import { Shield } from 'lucide-react'
import type { ApprovalMode } from '../types/tauri-events'

interface ApprovalModeSelectorProps {
  mode: ApprovalMode
  onChange: (mode: ApprovalMode) => void
  disabled?: boolean
}

const APPROVAL_MODES: Record<ApprovalMode, { label: string; description: string; color: string }> = {
  suggest: { label: 'Confirm', description: 'Ask for each tool execution', color: 'warning' },
  plan: { label: 'Plan', description: 'Plan first, execute after confirmation', color: 'info' },
  auto: { label: 'Auto', description: 'Auto-approve safe operations', color: 'success' },
  auto_edit: { label: 'Auto Edit', description: 'Auto-approve file ops, ask for bash', color: 'success' },
  full_auto: { label: 'Full Auto', description: 'Auto-approve except critical', color: 'success' },
  readonly: { label: 'Readonly', description: 'Only allow read operations', color: 'info' },
  plan_ro: { label: 'Plan RO', description: 'Read-only analysis mode', color: 'info' },
  bypass_permissions: { label: 'Bypass', description: 'Skip all permission checks', color: 'error' },
  dont_ask: { label: 'Never Ask', description: 'Accept everything without prompting', color: 'error' },
  confirm: { label: 'Confirm', description: 'Ask for each tool execution', color: 'warning' },
}

export function ApprovalModeSelector({ mode, onChange, disabled }: ApprovalModeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Shield className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      <select
        value={mode}
        onChange={(e) => onChange(e.target.value as ApprovalMode)}
        disabled={disabled}
        className="px-2 py-1 text-[10px] rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all duration-200"
        title="Approval mode for tool execution"
      >
        {Object.entries(APPROVAL_MODES).map(([value, config]) => (
          <option key={value} value={value}>
            {config.label}
          </option>
        ))}
      </select>
    </div>
  )
}
