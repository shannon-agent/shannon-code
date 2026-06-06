// MCP server browser showing connected servers, tools, and status
import { useState, useRef, useEffect, useCallback } from 'react'
import { Plug, Wrench, Circle, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'

export interface McpServer {
  name: string
  status: 'connected' | 'disconnected' | 'error'
  tools: McpTool[]
  error?: string
}

export interface McpTool {
  name: string
  description?: string
  schema?: Record<string, unknown>
}

interface McpBrowserProps {
  servers: McpServer[]
  onRefresh?: () => void
}

function ToolItem({ tool, index }: { tool: McpTool; index: number }) {
  return (
    <div
      className="flex items-start gap-2 px-3 py-2 pl-8"
      role="listitem"
      tabIndex={0}
      aria-label={`Tool: ${tool.name}${tool.description ? ` - ${tool.description}` : ''}`}
    >
      <Wrench className="w-3 h-3 flex-shrink-0 mt-0.5 text-[var(--text-muted)] aria-hidden" />
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">{tool.name}</p>
        {tool.description && (
          <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{tool.description}</p>
        )}
      </div>
    </div>
  )
}

function ServerItem({ server, index }: { server: McpServer; index: number }) {
  const [expanded, setExpanded] = useState(true)
  const statusVariant = server.status === 'connected' ? 'success' : server.status === 'error' ? 'error' : 'secondary'
  const serverId = `mcp-server-${index}`
  const toolsListId = `${serverId}-tools`

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setExpanded(!expanded)
    } else if (e.key === 'Escape' && expanded) {
      setExpanded(false)
    }
  }, [expanded])

  return (
    <div role="listitem">
      <div
        onClick={() => setExpanded(!expanded)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-controls={toolsListId}
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 flex-shrink-0 text-[var(--text-muted)] aria-hidden" />
        ) : (
          <ChevronRight className="w-3 h-3 flex-shrink-0 text-[var(--text-muted)] aria-hidden" />
        )}
        <Badge variant={statusVariant} className="w-2 h-2 p-0 rounded-full" aria-hidden />
        <span className="text-[12px] text-[var(--text-secondary)] truncate flex-1">{server.name}</span>
        <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0" aria-label={`${server.tools.length} tools`}>
          {server.tools.length} tool{server.tools.length !== 1 ? 's' : ''}
        </span>
      </div>
      {expanded && (
        <div id={toolsListId} role="group" aria-label={`Tools for ${server.name}`}>
          {server.error && (
            <div className="px-3 py-1 pl-8 text-[10px] text-[var(--error)]" role="alert">{server.error}</div>
          )}
          {server.tools.length === 0 ? (
            <div className="px-3 py-1 pl-8 text-[10px] text-[var(--text-muted)]">No tools available</div>
          ) : (
            server.tools.map((tool, toolIndex) => (
              <ToolItem key={tool.name} tool={tool} index={toolIndex} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function McpBrowser({ servers, onRefresh }: McpBrowserProps) {
  const connected = servers.filter(s => s.status === 'connected').length
  const totalTools = servers.reduce((sum, s) => sum + s.tools.length, 0)

  return (
    <div className="flex flex-col h-full" role="region" aria-labelledby="mcp-browsers-title">
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Plug className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden />
          <span id="mcp-browsers-title" className="text-xs font-medium text-[var(--text-secondary)]">MCP Servers</span>
          <Badge variant="secondary" className="text-[9px]" aria-label={`${connected} of ${servers.length} servers connected`}>
            {connected}/{servers.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)]" aria-label={`Total ${totalTools} tools across all servers`}>
            {totalTools} tools
          </span>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-6 w-6 p-0"
              title="Refresh servers"
              aria-label="Refresh MCP servers"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {servers.length === 0 ? (
          <div className="flex items-center justify-center h-32 p-4" role="status">
            <p className="text-[var(--text-muted)] text-[11px]">No MCP servers configured</p>
          </div>
        ) : (
          <div className="py-1" role="list" aria-label="MCP servers list">
            {servers.map((server, index) => (
              <ServerItem key={server.name} server={server} index={index} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
