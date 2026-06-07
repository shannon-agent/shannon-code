// Inline permission dialog for tool execution approval
import { useState, useRef, useEffect, useCallback } from 'react'
import { ShieldAlert, Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import { useTauriEvent } from '../hooks/useTauriEvent'
import { respondPermission } from '../lib/tauri-api'
import type { PermissionRequest } from '../types/tauri-events'
import { EVENT_NAMES } from '../types/tauri-events'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'

interface PermissionDialogProps {
  request?: PermissionRequest | null
}

const RISK_VARIANT: Record<string, 'error' | 'warning' | 'default' | 'success'> = {
  critical: 'error',
  high: 'warning',
  medium: 'default',
  low: 'success',
}

export function PermissionDialog({
  request: externalRequest
}: PermissionDialogProps) {
  const [internalRequest, setInternalRequest] = useState<PermissionRequest | null>(null)
  const [alwaysAllow, setAlwaysAllow] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [responding, setResponding] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const allowButtonRef = useRef<HTMLButtonElement>(null)
  const denyButtonRef = useRef<HTMLButtonElement>(null)

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

  // Focus management when dialog appears
  useEffect(() => {
    if (request && expanded) {
      allowButtonRef.current?.focus()
    }
  }, [request, expanded])

  // Keyboard navigation for dialog actions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && expanded) {
      e.preventDefault()
      setExpanded(false)
    } else if (e.key === 'Enter' && e.shiftKey && request) {
      e.preventDefault()
      handleDeny()
    } else if (e.key === 'Enter' && request) {
      e.preventDefault()
      handleApprove()
    }
  }, [expanded, request])

  const handleApprove = async () => {
    if (request) {
      setResponding(true)
      try {
        await respondPermission(request.request_id, true)
        if (!externalRequest) setInternalRequest(null)
      } catch (error) {
        console.error('Failed to approve permission:', error)
      } finally {
        setResponding(false)
      }
    }
  }

  const handleDeny = async () => {
    if (request) {
      setResponding(true)
      try {
        await respondPermission(request.request_id, false)
        if (!externalRequest) setInternalRequest(null)
      } catch (error) {
        console.error('Failed to deny permission:', error)
      } finally {
        setResponding(false)
      }
    }
  }

  const handleToggleExpanded = useCallback(() => {
    setExpanded(!expanded)
  }, [expanded])

  if (!request) return null

  const riskVariant = RISK_VARIANT[request.risk.toLowerCase()] || 'success'
  const dialogId = `permission-dialog-${request.request_id}`
  const contentId = `${dialogId}-content`

  return (
    <div
      ref={dialogRef}
      className="mx-4 my-2"
      role="alertdialog"
      aria-labelledby={`${dialogId}-title`}
      aria-describedby={`${dialogId}-description`}
      aria-modal="false"
    >
      <div
        className="rounded-lg border border-border bg-secondary overflow-hidden transition-all duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-3">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-warning" aria-hidden />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span id={`${dialogId}-title`} className="text-sm font-medium text-foreground">
                {request.tool}
              </span>
              <Badge variant={riskVariant} aria-label={`Risk level: ${request.risk}`}>{request.risk}</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpanded}
            className="h-6 w-6 p-0"
            aria-expanded={expanded}
            aria-controls={contentId}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Expandable content */}
        {expanded && (
          <>
            <Separator />
            <div id={contentId} className="px-4 py-3 space-y-3">
              <div id={`${dialogId}-description`}>
                <ScrollArea className="max-h-32">
                  <pre className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                    <code>{JSON.stringify(request.input, null, 2)}</code>
                  </pre>
                </ScrollArea>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alwaysAllow}
                    onChange={(e) => setAlwaysAllow(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border bg-background text-primary focus:ring-1 focus:ring-ring"
                    aria-label="Always allow this tool"
                  />
                  <span className="text-[11px] text-muted-foreground">Always allow</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    ref={denyButtonRef}
                    variant="destructive"
                    size="sm"
                    onClick={handleDeny}
                    disabled={responding}
                    aria-label={`Deny ${request.tool} (Shift+Enter)`}
                  >
                    <X className="w-3 h-3 mr-1" aria-hidden />
                    Deny
                  </Button>
                  <Button
                    ref={allowButtonRef}
                    variant="success"
                    size="sm"
                    onClick={handleApprove}
                    disabled={responding}
                    aria-label={`Allow ${request.tool} (Enter)`}
                  >
                    <Check className="w-3 h-3 mr-1" aria-hidden />
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
