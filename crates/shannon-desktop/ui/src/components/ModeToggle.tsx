// Plan/Act mode toggle with MD3 styling and Material Symbols
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

export type AgentMode = 'plan' | 'act'

interface ModeToggleProps {
  mode: AgentMode
  onChange: (mode: AgentMode) => void
  disabled?: boolean
}

const MODE_CONFIG: Record<AgentMode, { icon: string; label: string; description: string }> = {
  plan: { icon: 'lightbulb', label: 'Plan', description: 'Read-only analysis' },
  act: { icon: 'bolt', label: 'Act', description: 'Execute changes' },
}

export function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => { if (value) onChange(value as AgentMode) }}
      disabled={disabled}
      className="bg-md3-surface-container rounded-xl p-0.5 gap-0.5"
    >
      {(Object.keys(MODE_CONFIG) as AgentMode[]).map((m) => {
        const cfg = MODE_CONFIG[m]
        return (
          <ToggleGroupItem
            key={m}
            value={m}
            title={cfg.description}
            className="h-6 gap-md3-xs px-md3-sm text-label-sm font-medium data-[state=on]:bg-md3-primary/10 data-[state=on]:text-md3-primary data-[state=on]:shadow-sm rounded-lg"
          >
            <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
            <span>{cfg.label}</span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
