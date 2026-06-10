// Status bar with MD3 styling and Material Symbols
import { useAppState } from '../context/AppState'
import { UsageStats } from './UsageStats'
import { Badge } from './ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip'

function ContextUsageIndicator({ usage, maxTokens }: { usage: { inputTokens: number; outputTokens: number } | null; maxTokens: number }) {
  const used = usage ? usage.inputTokens + usage.outputTokens : 0
  const pct = maxTokens > 0 ? Math.min(100, Math.round((used / maxTokens) * 100)) : 0
  const color = pct < 60 ? 'bg-md3-secondary' : pct < 80 ? 'bg-md3-tertiary' : 'bg-md3-error'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-md3-xs cursor-default">
            <div className="w-16 h-1.5 bg-md3-surface-container-highest rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-label-sm text-md3-on-surface-variant">{pct}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Context: {used.toLocaleString()} / {maxTokens.toLocaleString()} tokens ({pct}%)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function StatusBar() {
  const { model, provider, querying, usage, messages } = useAppState()

  return (
    <div className="flex items-center justify-between px-md3-lg py-md3-sm bg-md3-surface-container/80 border-t border-md3-outline-variant/10 text-label-sm">
      <div className="flex items-center gap-md3-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="gap-md3-xs cursor-default">
                <span className="material-symbols-outlined text-[14px] text-md3-primary">bolt</span>
                <span className="font-medium truncate max-w-[200px]">{model}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent><p>{model}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="capitalize cursor-default">{provider}</Badge>
            </TooltipTrigger>
            <TooltipContent><p>Provider: {provider}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ContextUsageIndicator usage={usage} maxTokens={200000} />
      </div>

      <div className="flex items-center gap-md3-md">
        <UsageStats usage={usage} messageCount={messages.length} />

        {querying ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-md3-xs cursor-default">
                  <span className="material-symbols-outlined text-[14px] text-md3-primary animate-spin">progress_activity</span>
                  <Badge variant="default">Querying</Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent><p>Processing your request</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-md3-xs cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-md3-secondary" />
                  <span className="text-md3-on-surface-variant">Ready</span>
                </div>
              </TooltipTrigger>
              <TooltipContent><p>Ready to assist</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
