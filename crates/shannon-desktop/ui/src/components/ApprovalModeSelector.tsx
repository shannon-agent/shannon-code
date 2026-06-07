// Approval mode selector using ToggleGroup for compact mode switching
import { Shield } from 'lucide-react'
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

// Show a subset of the most commonly used modes as toggle buttons
const PRIMARY_MODES: ApprovalMode[] = ['suggest', 'auto', 'full_auto', 'readonly']

export function ApprovalModeSelector({ mode, onChange, disabled }: ApprovalModeSelectorProps) {
  const isPrimary = (PRIMARY_MODES as string[]).includes(mode)

  return (
    <div className="flex items-center gap-2">
      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
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
              className="h-6 px-2 text-[10px] font-medium data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:shadow-sm"
            >
              {cfg.label}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </div>
  )
}
