// Plugin card component for MCP server display
import { Check, X, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { useState } from 'react'

interface Plugin {
  name: string
  command: string
  enabled: boolean
  connected: boolean
  toolCount: number
  tools?: string[]
}

interface PluginCardProps {
  plugin: Plugin
  onToggle?: (name: string) => void
  onRemove?: (name: string) => void
}

/**
 * MCP server plugin card with Tokyo Night styling
 * - Server name, status badge, tool count
 * - Expandable tools list
 * - Enable/disable toggle
 * - Remove button with confirmation
 */
export function PluginCard({ plugin, onToggle, onRemove }: PluginCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleToggle = () => {
    onToggle?.(plugin.name)
  }

  const handleRemove = () => {
    if (showConfirm) {
      onRemove?.(plugin.name)
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
    }
  }

  const handleCancelRemove = () => {
    setShowConfirm(false)
  }

  return (
    <div className="bg-[#1f2335] border border-[#414868] rounded-lg overflow-hidden transition-all hover:border-[#565f89]">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`
              p-2 rounded-lg flex-shrink-0
              ${plugin.connected ? 'bg-[#41a6b5]/20' : 'bg-[#f7768e]/20'}
            `}>
              <Package
                size={20}
                className={plugin.connected ? 'text-[#41a6b5]' : 'text-[#f7768e]'}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-[#c0caf5] font-semibold truncate">{plugin.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`
                  px-2 py-0.5 rounded text-xs font-medium
                  ${plugin.connected
                    ? 'bg-[#41a6b5]/20 text-[#41a6b5]'
                    : 'bg-[#f7768e]/20 text-[#f7768e]'
                  }
                `}>
                  {plugin.connected ? 'Connected' : 'Disconnected'}
                </span>
                <span className="text-[#565f89] text-xs">
                  {plugin.toolCount} tools
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Enable/Disable Toggle */}
            {onToggle && (
              <button
                onClick={handleToggle}
                className={`
                  p-2 rounded-lg transition-colors
                  ${plugin.enabled
                    ? 'bg-[#41a6b5]/20 text-[#41a6b5] hover:bg-[#41a6b5]/30'
                    : 'bg-[#565f89]/20 text-[#565f89] hover:bg-[#565f89]/30'
                  }
                `}
                aria-label={`${plugin.enabled ? 'Disable' : 'Enable'} ${plugin.name}`}
              >
                {plugin.enabled ? <Check size={16} /> : <X size={16} />}
              </button>
            )}

            {/* Expand/Collapse Button */}
            {plugin.tools && plugin.tools.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg bg-[#24283b] text-[#565f89] hover:text-[#c0caf5] transition-colors"
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} tools list`}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}

            {/* Remove Button */}
            {onRemove && (
              <button
                onClick={handleRemove}
                className={`
                  p-2 rounded-lg transition-colors
                  ${showConfirm
                    ? 'bg-[#f7768e]/20 text-[#f7768e] hover:bg-[#f7768e]/30'
                    : 'bg-[#565f89]/20 text-[#565f89] hover:bg-[#f7768e]/20 hover:text-[#f7768e]'
                  }
                `}
                aria-label={`Remove ${plugin.name}`}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="mt-3 p-3 bg-[#f7768e]/10 border border-[#f7768e] rounded-lg">
            <p className="text-sm text-[#c0caf5] mb-2">
              Remove {plugin.name}? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRemove}
                className="px-3 py-1 bg-[#f7768e] text-[#1a1b26] rounded hover:bg-[#f7768e]/80 transition-colors text-sm font-medium"
              >
                Remove
              </button>
              <button
                onClick={handleCancelRemove}
                className="px-3 py-1 bg-[#24283b] text-[#c0caf5] rounded hover:bg-[#2a2f44] transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Tools List */}
      {isExpanded && plugin.tools && plugin.tools.length > 0 && (
        <div className="px-4 pb-4 border-t border-[#2a2f44] pt-3">
          <h4 className="text-xs font-semibold text-[#565f89] mb-2">Tools</h4>
          <div className="space-y-1">
            {plugin.tools.map((tool) => (
              <div
                key={tool}
                className="text-sm text-[#a9b1d6] py-1 px-2 rounded bg-[#1a1b26] hover:bg-[#24283b] transition-colors"
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command Info */}
      <div className="px-4 pb-3">
        <code className="text-xs text-[#565f89] bg-[#1a1b26] px-2 py-1 rounded">
          {plugin.command}
        </code>
      </div>
    </div>
  )
}
