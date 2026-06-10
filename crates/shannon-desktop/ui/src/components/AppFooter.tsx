// Fixed footer status bar
interface AppFooterProps {
  tokenUsage?: string
  computeTime?: string
  activeAgents?: string[]
}

export function AppFooter({ tokenUsage, computeTime, activeAgents }: AppFooterProps) {
  return (
    <footer className="fixed bottom-0 right-0 left-[280px] h-8 bg-md3-surface-container-low/90 backdrop-blur-sm border-t border-md3-outline-variant/20 flex items-center justify-between px-md3-lg z-40">
      {/* Left — Resource usage */}
      <span className="text-label-sm text-md3-on-surface-variant flex items-center gap-md3-xs">
        {tokenUsage && <>Resource Usage: {tokenUsage}</>}
        {tokenUsage && computeTime && <> | </>}
        {computeTime && <>Compute: {computeTime}</>}
      </span>

      {/* Right — Active agents */}
      <div className="flex items-center gap-md3-md">
        {activeAgents && activeAgents.length > 0 && (
          <span className="text-label-sm text-md3-primary flex items-center gap-md3-xs">
            <span className="w-2 h-2 rounded-full bg-md3-secondary animate-pulse" />
            Active Agents: {activeAgents.join(', ')}
          </span>
        )}
      </div>
    </footer>
  )
}
