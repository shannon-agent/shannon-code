// Bottom status bar showing model, provider, cost, and connection status
import { useAppState } from '../context/AppState'
import { Loader2, Zap } from 'lucide-react'
import { UsageStats } from './UsageStats'
import { Badge } from './ui/badge'

export function StatusBar() {
  const { model, provider, querying, usage, messages } = useAppState()

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--bg-secondary)]/80 border-t border-[var(--border)] text-xs backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-input)]">
          <Zap className="w-3 h-3 text-[var(--accent)]" />
          <span className="text-[var(--text-secondary)] font-medium truncate max-w-[200px]">
            {model}
          </span>
        </div>
        <Badge variant="secondary" className="capitalize">{provider}</Badge>
      </div>

      <div className="flex items-center gap-3">
        <UsageStats usage={usage} messageCount={messages.length} />

        {querying ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 text-[var(--accent)] animate-spin" />
            <Badge variant="default">Querying</Badge>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            <span className="text-[var(--text-muted)]">Ready</span>
          </div>
        )}
      </div>
    </div>
  )
}
