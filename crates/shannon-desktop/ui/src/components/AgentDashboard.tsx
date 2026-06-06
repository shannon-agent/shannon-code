// Agent dashboard showing active sub-agents, status, and progress
import { Bot, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react'

export interface AgentInfo {
  id: string
  name: string
  model: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  task?: string
  progress?: number
  toolsUsed?: number
  duration?: number
}

interface AgentDashboardProps {
  agents: AgentInfo[]
  onCancel?: (agentId: string) => void
}

const STATUS_CONFIG = {
  running: { icon: Loader2, color: 'text-[var(--accent)]', animate: 'animate-spin', label: 'Running' },
  completed: { icon: CheckCircle2, color: 'text-[var(--success)]', animate: '', label: 'Done' },
  failed: { icon: XCircle, color: 'text-[var(--error)]', animate: '', label: 'Failed' },
  pending: { icon: Clock, color: 'text-[var(--text-muted)]', animate: '', label: 'Queued' },
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export function AgentDashboard({ agents, onCancel }: AgentDashboardProps) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
          <Bot className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">Agents</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-[var(--text-muted)] text-[11px]">No active agents</p>
        </div>
      </div>
    )
  }

  const running = agents.filter(a => a.status === 'running').length
  const completed = agents.filter(a => a.status === 'completed').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">Agents</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          {running > 0 && <span className="text-[var(--accent)]">{running} running</span>}
          {completed > 0 && <span className="text-[var(--success)]">{completed} done</span>}
        </div>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto py-1">
        {agents.map(agent => {
          const cfg = STATUS_CONFIG[agent.status]
          const Icon = cfg.icon
          return (
            <div
              key={agent.id}
              className={`px-3 py-2 border-b border-[var(--border)]/50 ${
                agent.status === 'running' ? 'bg-[var(--accent)]/5' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color} ${cfg.animate}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-medium text-[var(--text-secondary)] truncate">
                        {agent.name}
                      </span>
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
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {agent.duration != null && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {formatDuration(agent.duration)}
                    </span>
                  )}
                  {agent.status === 'running' && onCancel && (
                    <button
                      onClick={() => onCancel(agent.id)}
                      className="text-[10px] text-[var(--error)] hover:text-[var(--error)]/80 px-1.5 py-0.5 rounded hover:bg-[var(--error)]/10"
                    >
                      Cancel
                    </button>
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
              {/* Tools used */}
              {agent.toolsUsed != null && agent.toolsUsed > 0 && (
                <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                  {agent.toolsUsed} tool{agent.toolsUsed !== 1 ? 's' : ''} used
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
