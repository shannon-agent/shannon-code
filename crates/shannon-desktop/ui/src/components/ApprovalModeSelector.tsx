// Approval mode selector with MD3 styling and Material Symbols
import type { ApprovalMode } from '../types/tauri-events'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

interface ApprovalModeSelectorProps {
  mode: ApprovalMode
  onChange: (mode: ApprovalMode) => void
  disabled?: boolean
}

const APPROVAL_MODES: Record<ApprovalMode, { label: string; description: string }> = {
  suggest: { label: 'Confirm', description: 'Ask for each tool execution' },
  plan: { label: 'Plan', description: 'Plan first, execute after confirmation' },
  auto: { label: 'Auto', description: 'Auto-approve safe operations' },
  auto_edit: { label: 'Auto Edit', description: 'Auto-approve file ops, ask for bash' },
  full_auto: { label: 'Full Auto', description: 'Auto-approve except critical' },
  readonly: { label: 'Readonly', description: 'Only allow read operations' },
  plan_ro: { label: 'Plan RO', description: 'Read-only analysis mode' },
  bypass_permissions: { label: 'Bypass', description: 'Skip all permission checks' },
  dont_ask: { label: 'Never Ask', description: 'Accept everything without prompting' },
  confirm: { label: 'Confirm', description: 'Ask for each tool execution' },
}

const PRIMARY_MODES: ApprovalMode[] = ['suggest', 'auto', 'full_auto', 'readonly']

export function ApprovalModeSelector({ mode, onChange, disabled }: ApprovalModeSelectorProps) {
  const isPrimary = (PRIMARY_MODES as string[]).includes(mode)

  return (
    <div className="flex items-center gap-md3-sm">
      <span className="material-symbols-outlined text-[14px] text-md3-on-surface-variant">shield</span>
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value) => { if (value) onChange(value as ApprovalMode) }}
        disabled={disabled}
        className="gap-0.5"
      >
        {(isPrimary ? PRIMARY_MODES : [mode]).map((m) => {
          const cfg = APPROVAL_MODES[m]
          return (
            <ToggleGroupItem
              key={m}
              value={m}
              title={cfg.description}
              className="h-6 px-md3-sm text-label-sm font-medium data-[state=on]:bg-md3-primary/10 data-[state=on]:text-md3-primary data-[state=on]:shadow-sm rounded-lg"
            >
              {cfg.label}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </div>
  )
}
