import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import * as api from '@/lib/tauri-api'
import type { ApprovalMode } from '@/types'

const APPROVAL_MODES: { value: ApprovalMode; label: string; description: string }[] = [
  { value: 'suggest', label: 'Suggest', description: 'AI suggests only, you apply' },
  { value: 'confirm', label: 'Confirm', description: 'High supervision, approve every action' },
  { value: 'plan', label: 'Plan', description: 'Shared context, approve plans' },
  { value: 'auto_edit', label: 'Auto Edit', description: 'Auto-approve file edits' },
  { value: 'full_auto', label: 'Full Auto', description: 'Result focused, minimal intervention' },
]

export default function GeneralSettings() {
  const { config, refreshConfig } = useApp()
  const [approvalMode, setApprovalMode] = useState<number>(2) // default to "plan"
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (config?.approval_mode) {
      const idx = APPROVAL_MODES.findIndex(m => m.value === config.approval_mode)
      if (idx >= 0) setApprovalMode(idx)
    }
  }, [config])

  const handleModeChange = async (idx: number) => {
    setApprovalMode(idx)
    setSaving(true)
    try {
      await api.configure({ key: 'approval_mode', value: APPROVAL_MODES[idx].value })
      await refreshConfig()
    } catch (e) { console.warn("GeneralSettings error:", e) }
    setSaving(false)
  }

  const currentMode = APPROVAL_MODES[approvalMode]

  return (
    <div className="max-w-3xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-md">
        <Link to="/settings/general" className="hover:text-primary transition-colors">Settings</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface">General</span>
      </nav>
      <header className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">System Settings</h2>
        <p className="font-body-md text-on-surface-variant">Refine your AI workflow and interface preferences.</p>
      </header>

      <div className="space-y-lg">
        {/* Autonomy Level */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-md mb-xs">
            <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
            <h3 className="font-headline-md text-headline-md">Approval Mode</h3>
            {saving && <span className="material-symbols-outlined text-primary animate-spin text-[18px]">progress_activity</span>}
          </div>
          <p className="font-body-sm text-on-surface-variant mb-xl">
            Current: <strong className="text-primary">{currentMode.label}</strong> — {currentMode.description}
          </p>
          <div className="space-y-sm">
            <input
              className="w-full appearance-none bg-outline-variant/30 h-1 rounded-full cursor-pointer outline-none slider-thumb-primary"
              max={APPROVAL_MODES.length - 1} min={0} type="range" value={approvalMode}
              onChange={e => handleModeChange(Number(e.target.value))}
            />
            <div className="flex justify-between font-label-sm text-outline px-1">
              {APPROVAL_MODES.map((m, i) => (
                <button
                  key={m.value}
                  onClick={() => handleModeChange(i)}
                  className={`text-center cursor-pointer transition-colors ${i === approvalMode ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  <p className="font-bold">{m.label}</p>
                  <p className="text-[10px]">{m.description}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Session Info */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xl shadow-sm">
          <h3 className="font-headline-md text-headline-md mb-md">Provider</h3>
          <div className="space-y-sm">
            <div className="flex justify-between items-center py-sm">
              <span className="font-label-md text-on-surface-variant">Active Provider</span>
              <span className="font-label-md text-on-surface font-bold">{config?.provider ?? 'Not configured'}</span>
            </div>
            <div className="flex justify-between items-center py-sm">
              <span className="font-label-md text-on-surface-variant">Model</span>
              <span className="font-label-md text-on-surface font-bold">{config?.model ?? 'Not configured'}</span>
            </div>
            <div className="flex justify-between items-center py-sm">
              <span className="font-label-md text-on-surface-variant">Working Directory</span>
              <span className="font-label-md text-on-surface font-bold font-mono text-sm truncate max-w-[300px]">{config?.working_dir ?? 'Not set'}</span>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        input.slider-thumb-primary::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: var(--color-primary);
            cursor: pointer;
            box-shadow: 0 0 10px rgba(107, 56, 212, 0.3);
            margin-top: -6px;
        }
      `}</style>
    </div>
  )
}
