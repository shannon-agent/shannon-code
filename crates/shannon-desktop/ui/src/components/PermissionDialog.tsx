// Inline permission dialog for tool execution approval
import { useState } from 'react'
import { ShieldAlert, Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import { useTauriEvent } from '../hooks/useTauriEvent'
import type { PermissionRequest } from '../types/tauri-events'
import { EVENT_NAMES } from '../types/tauri-events'

interface PermissionDialogProps {
  onApprove: (requestId: string, always: boolean) => void
  onDeny: (requestId: string) => void
  request?: PermissionRequest | null
}

export function PermissionDialog({
  onApprove,
  onDeny,
  request: externalRequest
}: PermissionDialogProps) {
  const [internalRequest, setInternalRequest] = useState<PermissionRequest | null>(null)
  const [alwaysAllow, setAlwaysAllow] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const request = externalRequest ?? internalRequest

  useTauriEvent<PermissionRequest>(
    EVENT_NAMES.PERMISSION_REQUEST,
    (payload) => {
      if (!externalRequest) {
        setInternalRequest(payload)
        setAlwaysAllow(false)
        setExpanded(true)
      }
    }
  )

  const handleApprove = () => {
    if (request) {
      onApprove(request.request_id, alwaysAllow)
      if (!externalRequest) setInternalRequest(null)
    }
  }

  const handleDeny = () => {
    if (request) {
      onDeny(request.request_id)
      if (!externalRequest) setInternalRequest(null)
    }
  }

  if (!request) return null

  const riskConfig: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: 'bg-[var(--error)]/15', text: 'text-[var(--error)]', border: 'border-[var(--error)]/40' },
    high: { bg: 'bg-[var(--warning)]/15', text: 'text-[var(--warning)]', border: 'border-[var(--warning)]/40' },
    medium: { bg: 'bg-[var(--accent)]/15', text: 'text-[var(--accent)]', border: 'border-[var(--accent)]/40' },
    low: { bg: 'bg-[var(--success)]/15', text: 'text-[var(--success)]', border: 'border-[var(--success)]/40' },
  }

  const risk = riskConfig[request.risk.toLowerCase()] || riskConfig.low

  return (
    <div className={`mx-4 my-2 rounded-lg border ${risk.border} ${risk.bg} overflow-hidden transition-all duration-150`}>
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <ShieldAlert className={`w-4 h-4 flex-shrink-0 ${risk.text}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {request.tool}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${risk.bg} ${risk.text} border ${risk.border}`}>
              {request.risk}
            </span>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-[var(--bg-secondary)]/50 transition-colors"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" /> : <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
        </button>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          <pre className="bg-[var(--bg-primary)]/60 p-2.5 rounded text-[11px] text-[var(--text-muted)] overflow-x-auto max-h-32 font-mono leading-relaxed">
            <code>{JSON.stringify(request.input, null, 2)}</code>
          </pre>

          <div className="flex items-center justify-between gap-2">
            {/* Always allow checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={alwaysAllow}
                onChange={(e) => setAlwaysAllow(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[var(--border)] bg-[var(--bg-primary)] text-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              />
              <span className="text-[11px] text-[var(--text-muted)]">Always allow</span>
            </label>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeny}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[var(--error)]/40 text-[var(--error)] text-xs font-medium hover:bg-[var(--error)]/10 transition-colors duration-100"
              >
                <X className="w-3 h-3" />
                Deny
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[var(--success)] text-[var(--bg-primary)] text-xs font-medium hover:bg-[var(--success)]/80 transition-colors duration-100"
              >
                <Check className="w-3 h-3" />
                Allow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
