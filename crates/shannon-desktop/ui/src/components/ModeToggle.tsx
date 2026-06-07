// Plan/Act mode toggle using ToggleGroup — controls whether the agent only plans or also executes
import { Lightbulb, Zap } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

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
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => { if (value) onChange(value as AgentMode) }}
      disabled={disabled}
      className="bg-secondary rounded-md p-0.5 gap-0.5"
    >
      {(Object.keys(MODE_CONFIG) as AgentMode[]).map((m) => {
        const cfg = MODE_CONFIG[m]
        const Icon = cfg.icon
        return (
          <ToggleGroupItem
            key={m}
            value={m}
            title={cfg.description}
            className="h-6 gap-1 px-2.5 text-[11px] font-medium data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:shadow-sm"
          >
            <Icon className="w-3 h-3" />
            <span>{cfg.label}</span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
