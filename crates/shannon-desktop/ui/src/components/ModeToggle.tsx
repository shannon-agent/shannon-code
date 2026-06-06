// Plan/Act mode toggle — controls whether the agent only plans or also executes
import { Lightbulb, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

export type AgentMode = 'plan' | 'act'

interface ModeToggleProps {
  mode: AgentMode
  onChange: (mode: AgentMode) => void
  disabled?: boolean
}

const MODE_CONFIG: Record<AgentMode, { icon: typeof Lightbulb; label: string; description: string }> = {
  plan: { icon: Lightbulb, label: 'Plan', description: 'Read-only analysis' },
  act: { icon: Zap, label: 'Act', description: 'Execute changes' },
}

export function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
  return (
    <div className="flex items-center bg-[var(--bg-secondary)] rounded-md p-0.5 gap-0.5">
      {(Object.keys(MODE_CONFIG) as AgentMode[]).map((m) => {
        const cfg = MODE_CONFIG[m]
        const Icon = cfg.icon
        const active = mode === m
        return (
          <Button
            key={m}
            variant="ghost"
            size="sm"
            onClick={() => { if (m !== mode) onChange(m) }}
            disabled={disabled}
            title={cfg.description}
            className={cn(
              'h-6 gap-1 px-2.5 text-[11px] font-medium',
              active
                ? m === 'plan'
                  ? 'bg-[var(--warning)]/15 text-[var(--warning)] shadow-sm hover:bg-[var(--warning)]/25 hover:text-[var(--warning)]'
                  : 'bg-[var(--accent)]/15 text-[var(--accent)] shadow-sm hover:bg-[var(--accent)]/25 hover:text-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <Icon className="w-3 h-3" />
            <span>{cfg.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
