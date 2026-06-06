// Usage statistics display — tokens, cost, and session metrics
import { DollarSign, Cpu, MessageSquare, TrendingUp } from 'lucide-react'

interface UsageData {
  inputTokens: number
  outputTokens: number
  costUsd: number
}

interface UsageStatsProps {
  usage: UsageData | null
  messageCount?: number
  sessionDuration?: number
}

function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`
  return `${(n / 1_000_000).toFixed(2)}M`
}

function formatCost(usd: number): string {
  if (usd < 0.01) return '<$0.01'
  return `$${usd.toFixed(2)}`
}

function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`
  return `${Math.floor(ms / 60000)}m`
}

export function UsageStats({ usage, messageCount, sessionDuration }: UsageStatsProps) {
  if (!usage) {
    return (
      <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] text-[var(--text-muted)]">
        <span>No usage data yet</span>
      </div>
    )
  }

  const totalTokens = usage.inputTokens + usage.outputTokens

  return (
    <div className="flex items-center gap-3 px-3 py-1.5">
      {/* Tokens */}
      <div className="flex items-center gap-1 text-[10px]">
        <Cpu className="w-3 h-3 text-[var(--accent)]" />
        <span className="text-[var(--text-secondary)]">{formatTokens(totalTokens)}</span>
        <span className="text-[var(--text-muted)]">tokens</span>
      </div>

      {/* Cost */}
      <div className="flex items-center gap-1 text-[10px]">
        <DollarSign className="w-3 h-3 text-[var(--success)]" />
        <span className="text-[var(--text-secondary)]">{formatCost(usage.costUsd)}</span>
      </div>

      {/* Messages */}
      {messageCount != null && (
        <div className="flex items-center gap-1 text-[10px]">
          <MessageSquare className="w-3 h-3 text-[var(--warning)]" />
          <span className="text-[var(--text-secondary)]">{messageCount}</span>
        </div>
      )}

      {/* Duration */}
      {sessionDuration != null && (
        <div className="flex items-center gap-1 text-[10px]">
          <TrendingUp className="w-3 h-3 text-[var(--text-muted)]" />
          <span className="text-[var(--text-secondary)]">{formatDuration(sessionDuration)}</span>
        </div>
      )}

      {/* Token breakdown on hover */}
      <div className="group relative">
        <span className="text-[10px] text-[var(--text-muted)] cursor-help">details</span>
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10 bg-[var(--bg-secondary)] border border-[var(--border)] rounded shadow-lg p-2 min-w-[140px]">
          <div className="text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Input tokens</span>
              <span className="text-[var(--text-secondary)]">{usage.inputTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Output tokens</span>
              <span className="text-[var(--text-secondary)]">{usage.outputTokens.toLocaleString()}</span>
            </div>
            <div className="border-t border-[var(--border)] pt-1 flex justify-between">
              <span className="text-[var(--text-muted)]">Total</span>
              <span className="text-[var(--accent)]">{totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Cost</span>
              <span className="text-[var(--success)]">{formatCost(usage.costUsd)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
