// Bottom status bar showing model, provider, cost, and connection status
import { useAppState } from '../context/AppState'
import { Loader2, Zap } from 'lucide-react'
import { UsageStats } from './UsageStats'
import { Badge } from './ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip'

function ContextUsageIndicator({ usage, maxTokens }: { usage: { inputTokens: number; outputTokens: number } | null; maxTokens: number }) {
  const used = usage ? usage.inputTokens + usage.outputTokens : 0
  const pct = maxTokens > 0 ? Math.min(100, Math.round((used / maxTokens) * 100)) : 0
  const color = pct < 60 ? 'bg-success' : pct < 80 ? 'bg-warning' : 'bg-destructive'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground">{pct}%</span>
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
    <div className="flex items-center justify-between px-4 py-1.5 bg-secondary/80 border-t border-border/20 text-xs">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="gap-1.5 cursor-default">
                <Zap className="w-3 h-3 text-primary" />
                <span className="font-medium truncate max-w-[200px]">
                  {model}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{model}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="capitalize cursor-default">{provider}</Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Provider: {provider}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ContextUsageIndicator usage={usage} maxTokens={200000} />
      </div>

      <div className="flex items-center gap-3">
        <UsageStats usage={usage} messageCount={messages.length} />

        {querying ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-default">
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  <Badge variant="default">Querying</Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Processing your request</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-muted-foreground">Ready</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ready to assist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
