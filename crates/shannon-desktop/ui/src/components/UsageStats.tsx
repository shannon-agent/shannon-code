// Usage statistics display — tokens, cost, and session metrics
import { DollarSign, Cpu, MessageSquare, TrendingUp } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip'

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
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="flex items-center gap-3 px-3 py-1.5">
          <span className="text-[10px] text-muted-foreground">No usage data yet</span>
        </CardContent>
      </Card>
    )
  }

  const totalTokens = usage.inputTokens + usage.outputTokens

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="flex items-center gap-3 px-3 py-1.5 p-0">
        {/* Tokens */}
        <div className="flex items-center gap-1 text-[10px]">
          <Cpu className="w-3 h-3 text-primary" />
          <span className="text-secondary-foreground">{formatTokens(totalTokens)}</span>
          <span className="text-muted-foreground">tokens</span>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-1 text-[10px]">
          <DollarSign className="w-3 h-3 text-success" />
          <span className="text-secondary-foreground">{formatCost(usage.costUsd)}</span>
        </div>

        {/* Messages */}
        {messageCount != null && (
          <div className="flex items-center gap-1 text-[10px]">
            <MessageSquare className="w-3 h-3 text-warning" />
            <span className="text-secondary-foreground">{messageCount}</span>
          </div>
        )}

        {/* Duration */}
        {sessionDuration != null && (
          <div className="flex items-center gap-1 text-[10px]">
            <TrendingUp className="w-3 h-3 text-muted-foreground" />
            <span className="text-secondary-foreground">{formatDuration(sessionDuration)}</span>
          </div>
        )}

        {/* Token breakdown via Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] text-muted-foreground cursor-help">details</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-secondary text-foreground p-3 min-w-[160px]">
              <div className="text-[10px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Input tokens</span>
                  <span className="text-secondary-foreground">{usage.inputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Output tokens</span>
                  <span className="text-secondary-foreground">{usage.outputTokens.toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-1 flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-primary">{totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost</span>
                  <span className="text-success">{formatCost(usage.costUsd)}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
