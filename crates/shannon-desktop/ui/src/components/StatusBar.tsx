// Bottom status bar showing model, provider, cost, and connection status
import { useAppState } from '../context/AppState'
import { Loader2, Zap } from 'lucide-react'
import { UsageStats } from './UsageStats'
import { Badge } from './ui/badge'

function ContextUsageIndicator({ usage, maxTokens }: { usage: { inputTokens: number; outputTokens: number } | null; maxTokens: number }) {
  const used = usage ? usage.inputTokens + usage.outputTokens : 0
  const pct = maxTokens > 0 ? Math.min(100, Math.round((used / maxTokens) * 100)) : 0
  const color = pct < 60 ? 'bg-[var(--success)]' : pct < 80 ? 'bg-[var(--warning)]' : 'bg-[var(--error)]'

  return (
    <div className="flex items-center gap-1.5" title={`Context: ${used.toLocaleString()} / ${maxTokens.toLocaleString()} tokens (${pct}%)`}>
      <div className="w-16 h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-[var(--text-muted)]">{pct}%</span>
    </div>
  )
}

export function StatusBar() {
  const { model, provider, querying, usage, messages } = useAppState()

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--bg-secondary)]/60 backdrop-blur-xl border-t border-[var(--border)]/20 text-xs">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-input)]" title={model}>
          <Zap className="w-3 h-3 text-[var(--accent)]" />
          <span className="text-[var(--text-secondary)] font-medium truncate max-w-[200px]">
            {model}
          </span>
        </div>
        <Badge variant="secondary" className="capitalize" title={`Provider: ${provider}`}>{provider}</Badge>
        <ContextUsageIndicator usage={usage} maxTokens={200000} />
      </div>

      <div className="flex items-center gap-3">
        <UsageStats usage={usage} messageCount={messages.length} />

        {querying ? (
          <div className="flex items-center gap-1.5" title="Processing your request">
            <Loader2 className="w-3.5 h-3.5 text-[var(--accent)] animate-spin" />
            <Badge variant="default">Querying</Badge>
          </div>
        ) : (
          <div className="flex items-center gap-1.5" title="Ready to assist">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            <span className="text-[var(--text-muted)]">Ready</span>
          </div>
        )}
      </div>
    </div>
  )
}
