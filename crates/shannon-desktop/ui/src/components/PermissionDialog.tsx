// Modal dialog for tool execution approval
import { useState } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'
import { useTauriEvent } from '../hooks/useTauriEvent'
import type { PermissionRequest } from '../types/tauri-events'
import { EVENT_NAMES } from '../types/tauri-events'

interface PermissionDialogProps {
  onApprove: (requestId: string, always: boolean) => void
  onDeny: (requestId: string) => void
  request?: PermissionRequest | null // Optional prop for testing
}

export function PermissionDialog({
  onApprove,
  onDeny,
  request: externalRequest
}: PermissionDialogProps) {
  const [internalRequest, setInternalRequest] = useState<PermissionRequest | null>(null)
  const [alwaysAllow, setAlwaysAllow] = useState(false)

  // Use external request if provided, otherwise use event-based state
  const request = externalRequest ?? internalRequest

  useTauriEvent<PermissionRequest>(
    EVENT_NAMES.PERMISSION_REQUEST,
    (payload) => {
      // Only update if not using external request
      if (!externalRequest) {
        setInternalRequest(payload)
        setAlwaysAllow(false)
      }
    }
  )

  const handleApprove = () => {
    if (request) {
      onApprove(request.request_id, alwaysAllow)
      if (!externalRequest) {
        setInternalRequest(null)
      }
    }
  }

  const handleDeny = () => {
    if (request) {
      onDeny(request.request_id)
      if (!externalRequest) {
        setInternalRequest(null)
      }
    }
  }

  if (!request) return null

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical':
        return 'bg-[#f7768e] text-[#1a1b26]'
      case 'high':
        return 'bg-[#e0af68] text-[#1a1b26]'
      case 'medium':
        return 'bg-[#7aa2f7] text-[#1a1b26]'
      default:
        return 'bg-[#9ece6a] text-[#1a1b26]'
    }
  }

  const getRiskLabel = (risk: string) => {
    return risk.charAt(0).toUpperCase() + risk.slice(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1b26]/80 backdrop-blur-sm">
      <div className="bg-[#24283b] border border-[#414868] rounded-lg shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#414868]">
          <AlertTriangle className="w-6 h-6 text-[#e0af68]" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#c0caf5]">
              Tool Execution Request
            </h3>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(request.risk)}`}
          >
            {getRiskLabel(request.risk)} Risk
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <div className="text-sm text-[#565f89] mb-1">Tool</div>
            <div className="text-[#a9b1d6] font-mono text-sm">
              {request.tool}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-[#565f89] mb-1">Input</div>
            <pre className="bg-[#1a1b26] p-3 rounded text-xs text-[#a9b1d6] overflow-x-auto">
              <code>{JSON.stringify(request.input, null, 2)}</code>
            </pre>
          </div>

          {/* Always Allow Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="always-allow"
              checked={alwaysAllow}
              onChange={(e) => setAlwaysAllow(e.target.checked)}
              className="w-4 h-4 rounded border-[#414868] bg-[#1a1b26] text-[#7aa2f7] focus:ring-[#7aa2f7] focus:ring-offset-0"
            />
            <label
              htmlFor="always-allow"
              className="text-sm text-[#a9b1d6] cursor-pointer"
            >
              Always allow this tool
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 bg-[#1a1b26] border-t border-[#414868]">
          <button
            onClick={handleDeny}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[#f7768e] text-[#f7768e] rounded-lg hover:bg-[#f7768e]/10 transition-colors"
          >
            <X className="w-4 h-4" />
            Deny
          </button>
          <button
            onClick={handleApprove}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#9ece6a] text-[#1a1b26] rounded-lg hover:bg-[#9ece6a]/80 transition-colors"
          >
            <Check className="w-4 h-4" />
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}
