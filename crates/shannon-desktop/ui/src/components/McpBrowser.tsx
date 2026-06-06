// MCP server browser showing connected servers, tools, and status
import { useState } from 'react'
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

function ToolItem({ tool }: { tool: McpTool }) {
  return (
    <div className="flex items-start gap-2 px-3 py-1.5 pl-8">
      <Wrench className="w-3 h-3 flex-shrink-0 mt-0.5 text-[var(--text-muted)]" />
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">{tool.name}</p>
        {tool.description && (
          <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{tool.description}</p>
        )}
      </div>
    </div>
  )
}

function ServerItem({ server }: { server: McpServer }) {
  const [expanded, setExpanded] = useState(true)
  const statusVariant = server.status === 'connected' ? 'success' : server.status === 'error' ? 'error' : 'secondary'

  return (
    <div>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 flex-shrink-0 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="w-3 h-3 flex-shrink-0 text-[var(--text-muted)]" />
        )}
        <Badge variant={statusVariant} className="w-2 h-2 p-0 rounded-full" />
        <span className="text-[12px] text-[var(--text-secondary)] truncate flex-1">{server.name}</span>
        <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
          {server.tools.length} tool{server.tools.length !== 1 ? 's' : ''}
        </span>
      </div>
      {expanded && (
        <div>
          {server.error && (
            <div className="px-3 py-1 pl-8 text-[10px] text-[var(--error)]">{server.error}</div>
          )}
          {server.tools.length === 0 ? (
            <div className="px-3 py-1 pl-8 text-[10px] text-[var(--text-muted)]">No tools available</div>
          ) : (
            server.tools.map(tool => <ToolItem key={tool.name} tool={tool} />)
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Plug className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">MCP Servers</span>
          <Badge variant="secondary" className="text-[9px]">{connected}/{servers.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)]">{totalTools} tools</span>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-6 w-6 p-0"
              title="Refresh servers"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {servers.length === 0 ? (
          <div className="flex items-center justify-center h-32 p-4">
            <p className="text-[var(--text-muted)] text-[11px]">No MCP servers configured</p>
          </div>
        ) : (
          <div className="py-1">
            {servers.map(server => <ServerItem key={server.name} server={server} />)}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
