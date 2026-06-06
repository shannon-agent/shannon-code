// Inline permission dialog for tool execution approval
import { useState } from 'react'
import { ShieldAlert, Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import { useTauriEvent } from '../hooks/useTauriEvent'
import type { PermissionRequest } from '../types/tauri-events'
import { EVENT_NAMES } from '../types/tauri-events'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'

interface PermissionDialogProps {
  onApprove: (requestId: string, always: boolean) => void
  onDeny: (requestId: string) => void
  request?: PermissionRequest | null
}

const RISK_VARIANT: Record<string, 'error' | 'warning' | 'default' | 'success'> = {
  critical: 'error',
  high: 'warning',
  medium: 'default',
  low: 'success',
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

  const riskVariant = RISK_VARIANT[request.risk.toLowerCase()] || 'success'

  return (
    <div className="mx-4 my-2">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden transition-all duration-150">
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[var(--warning)]" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {request.tool}
              </span>
              <Badge variant={riskVariant}>{request.risk}</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-6 w-6 p-0"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Expandable content */}
        {expanded && (
          <>
            <Separator />
            <div className="px-4 py-3 space-y-3">
              <ScrollArea className="max-h-32">
                <pre className="text-[11px] text-[var(--text-muted)] font-mono leading-relaxed">
                  <code>{JSON.stringify(request.input, null, 2)}</code>
                </pre>
              </ScrollArea>

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alwaysAllow}
                    onChange={(e) => setAlwaysAllow(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[var(--border)] bg-[var(--bg-primary)] text-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                  />
                  <span className="text-[11px] text-[var(--text-muted)]">Always allow</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button variant="destructive" size="sm" onClick={handleDeny}>
                    <X className="w-3 h-3 mr-1" />
                    Deny
                  </Button>
                  <Button variant="success" size="sm" onClick={handleApprove}>
                    <Check className="w-3 h-3 mr-1" />
                    Allow
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
