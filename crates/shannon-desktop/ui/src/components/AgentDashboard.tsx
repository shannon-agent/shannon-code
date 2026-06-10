// Agent dashboard with MD3 styling and Material Symbols
import { useState, useMemo } from 'react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'

export interface AgentInfo {
  id: string
  name: string
  model: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  task?: string
  progress?: number
  toolsUsed?: number
  duration?: number
  outputPreview?: string
}

type StatusFilter = 'all' | 'running' | 'completed' | 'failed'

interface AgentDashboardProps {
  agents: AgentInfo[]
  onCancel?: (agentId: string) => void
}

const STATUS_ICON: Record<string, { icon: string; color: string }> = {
  running: { icon: 'progress_activity', color: 'text-md3-primary' },
  completed: { icon: 'check_circle', color: 'text-md3-secondary' },
  failed: { icon: 'cancel', color: 'text-md3-error' },
  pending: { icon: 'schedule', color: 'text-md3-on-surface-variant' },
}

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'running', label: 'Running' },
  { key: 'completed', label: 'Done' },
  { key: 'failed', label: 'Failed' },
]

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export function AgentDashboard({ agents, onCancel }: AgentDashboardProps) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return agents
    return agents.filter(a => a.status === filter)
  }, [agents, filter])

  const running = agents.filter(a => a.status === 'running').length
  const completed = agents.filter(a => a.status === 'completed').length
  const failed = agents.filter(a => a.status === 'failed').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-md3-md py-md3-sm bg-md3-surface-container border-b border-md3-outline-variant/10">
        <div className="flex items-center gap-md3-sm">
          <span className="material-symbols-outlined text-[16px] text-md3-primary">smart_toy</span>
          <span className="text-label-md font-medium text-md3-on-surface">Agents</span>
        </div>
        <div className="flex items-center gap-md3-xs">
          {running > 0 && <Badge variant="default">{running} running</Badge>}
          {completed > 0 && <Badge variant="success">{completed} done</Badge>}
          {failed > 0 && <Badge variant="error">{failed} failed</Badge>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-md3-xs px-md3-md py-md3-xs border-b border-md3-outline-variant/10 bg-md3-surface-container-low">
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'all' ? agents.length : agents.filter(a => a.status === tab.key).length
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-md3-sm py-md3-xs text-label-sm rounded-lg transition-colors',
                filter === tab.key
                  ? 'bg-md3-primary/10 text-md3-primary font-medium'
                  : 'text-md3-on-surface-variant hover:text-md3-on-surface'
              )}
            >
              {tab.label} {count > 0 && `(${count})`}
            </button>
          )
        })}
      </div>

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-md3-sm">
              <span className="material-symbols-outlined text-[32px] text-md3-on-surface-variant/40">smart_toy</span>
              <p className="text-label-sm text-md3-on-surface-variant">
                {agents.length === 0 ? 'No active agents' : 'No matching agents'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-md3-md space-y-md3-sm">
            {filtered.map(agent => {
              const cfg = STATUS_ICON[agent.status]
              const isExpanded = expandedId === agent.id
              return (
                <div
                  key={agent.id}
                  className={cn(
                    'rounded-xl border transition-colors',
                    agent.status === 'running'
                      ? 'bg-md3-primary/5 border-md3-primary/15'
                      : 'bg-md3-surface-container border-md3-outline-variant/10'
                  )}
                >
                  <div className="px-md3-md py-md3-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-md3-sm min-w-0 flex-1">
                        <span className={cn(
                          'material-symbols-outlined text-[18px] shrink-0',
                          cfg.color,
                          agent.status === 'running' && 'animate-spin'
                        )}>
                          {cfg.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-md3-xs">
                            <span className="text-body-sm font-medium text-md3-on-surface truncate">{agent.name}</span>
                            <Badge variant={agent.status === 'running' ? 'default' : agent.status === 'completed' ? 'success' : agent.status === 'failed' ? 'error' : 'secondary'} className="text-[9px]">{agent.status}</Badge>
                            <span className="text-label-sm text-md3-on-surface-variant shrink-0">{agent.model}</span>
                          </div>
                          {agent.task && (
                            <p className="text-label-sm text-md3-on-surface-variant truncate mt-md3-xs">{agent.task}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-md3-sm shrink-0 ml-md3-sm">
                        {agent.duration != null && (
                          <span className="text-label-sm text-md3-on-surface-variant flex items-center gap-md3-xs">
                            <span className="material-symbols-outlined text-[12px]">timer</span>
                            {formatDuration(agent.duration)}
                          </span>
                        )}
                        {agent.status === 'running' && onCancel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCancel(agent.id)}
                            className="h-6 text-label-sm text-md3-error hover:text-md3-error hover:bg-md3-error/10 px-md3-sm"
                          >
                            Cancel
                          </Button>
                        )}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : agent.id)}
                          className="p-0.5 text-md3-on-surface-variant hover:text-md3-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {agent.status === 'running' && agent.progress != null && (
                      <div className="mt-md3-sm h-1 bg-md3-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-md3-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(100, agent.progress)}%` }} />
                      </div>
                    )}
                    {/* Quick stats */}
                    {agent.toolsUsed != null && agent.toolsUsed > 0 && (
                      <span className="text-label-sm text-md3-on-surface-variant mt-md3-xs flex items-center gap-md3-xs">
                        <span className="material-symbols-outlined text-[12px]">build</span>
                        {agent.toolsUsed} tool{agent.toolsUsed !== 1 ? 's' : ''} used
                      </span>
                    )}
                  </div>
                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mx-md3-md mb-md3-md p-md3-md rounded-lg bg-md3-surface border border-md3-outline-variant/10 text-label-sm text-md3-on-surface-variant space-y-md3-xs">
                      {agent.task && (
                        <div><span className="text-md3-on-surface font-medium">Task:</span> {agent.task}</div>
                      )}
                      {agent.outputPreview && (
                        <div><span className="text-md3-on-surface font-medium">Output:</span> <span className="font-mono whitespace-pre-wrap">{agent.outputPreview}</span></div>
                      )}
                      <div className="flex items-center gap-md3-md">
                        <span>ID: <span className="font-mono">{agent.id.slice(0, 8)}</span></span>
                        <span>Model: {agent.model}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
