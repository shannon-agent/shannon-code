// Agent dashboard showing active sub-agents, status, and progress
import { useState, useMemo } from 'react'
import { Bot, CheckCircle2, XCircle, Loader2, Clock, ChevronDown, ChevronRight, Wrench, Timer } from 'lucide-react'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
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

const STATUS_CONFIG = {
  running: { icon: Loader2, color: 'text-[var(--accent)]', animate: 'animate-spin', badge: 'default' as const },
  completed: { icon: CheckCircle2, color: 'text-[var(--success)]', animate: '', badge: 'success' as const },
  failed: { icon: XCircle, color: 'text-[var(--error)]', animate: '', badge: 'error' as const },
  pending: { icon: Clock, color: 'text-[var(--text-muted)]', animate: '', badge: 'secondary' as const },
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
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">Agents</span>
        </div>
        <div className="flex items-center gap-1.5">
          {running > 0 && <Badge variant="default">{running} running</Badge>}
          {completed > 0 && <Badge variant="success">{completed} done</Badge>}
          {failed > 0 && <Badge variant="error">{failed} failed</Badge>}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-[var(--border)]/50 bg-[var(--bg-secondary)]/30">
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'all' ? agents.length : agents.filter(a => a.status === tab.key).length
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-2 py-0.5 text-[10px] rounded transition-colors',
                filter === tab.key
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
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
            <p className="text-[var(--text-muted)] text-[11px]">
              {agents.length === 0 ? 'No active agents' : 'No matching agents'}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filtered.map(agent => {
              const cfg = STATUS_CONFIG[agent.status]
              const Icon = cfg.icon
              const isExpanded = expandedId === agent.id
              const hasDetails = agent.task || agent.outputPreview
              return (
                <div
                  key={agent.id}
                  className={cn(
                    'px-3 py-2',
                    agent.status === 'running' ? 'bg-[var(--accent)]/5' : ''
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', cfg.color, cfg.animate)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-medium text-[var(--text-secondary)] truncate">
                            {agent.name}
                          </span>
                          <Badge variant={cfg.badge} className="text-[9px]">{agent.status}</Badge>
                          <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
                            {agent.model}
                          </span>
                        </div>
                        {agent.task && (
                          <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                            {agent.task}
                          </p>
                        )}
                      </div>
                      {hasDetails && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : agent.id)}
                          className="flex-shrink-0 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                        >
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {agent.duration != null && (
                        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5">
                          <Timer className="w-2.5 h-2.5" />
                          {formatDuration(agent.duration)}
                        </span>
                      )}
                      {agent.status === 'running' && onCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancel(agent.id)}
                          className="h-5 text-[10px] text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 px-1.5"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  {agent.status === 'running' && agent.progress != null && (
                    <div className="mt-1.5 h-1 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, agent.progress)}%` }}
                      />
                    </div>
                  )}
                  {/* Quick stats */}
                  {agent.toolsUsed != null && agent.toolsUsed > 0 && (
                    <span className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-0.5">
                      <Wrench className="w-2.5 h-2.5" />
                      {agent.toolsUsed} tool{agent.toolsUsed !== 1 ? 's' : ''} used
                    </span>
                  )}
                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-2 p-2 rounded bg-[var(--bg-primary)] border border-[var(--border)]/50 text-[10px] text-[var(--text-muted)] space-y-1">
                      {agent.task && (
                        <div>
                          <span className="text-[var(--text-secondary)] font-medium">Task:</span> {agent.task}
                        </div>
                      )}
                      {agent.outputPreview && (
                        <div>
                          <span className="text-[var(--text-secondary)] font-medium">Output:</span>{' '}
                          <span className="font-mono whitespace-pre-wrap">{agent.outputPreview}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span>ID: <span className="font-mono">{agent.id.slice(0, 8)}</span></span>
                        <span>Model: {agent.model}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length > 1 && <Separator />}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
