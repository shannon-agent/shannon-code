// Bottom status bar showing model, provider, and connection status
import { useAppState } from '../context/AppState'
import { Loader2 } from 'lucide-react'

export function StatusBar() {
  const { model, provider, querying } = useAppState()

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#16161e] border-t border-[#414868] text-sm">
      {/* Model and Provider */}
      <div className="flex items-center gap-3">
        <span className="text-[#a9b1d6]">
          <span className="text-[#565f89]">Model:</span> {model}
        </span>
        <span className="text-[#565f89]">•</span>
        <span className="text-[#a9b1d6] capitalize">{provider}</span>
      </div>

      {/* Querying Indicator */}
      <div className="flex items-center gap-2">
        {querying && (
          <>
            <Loader2 className="w-4 h-4 text-[#7aa2f7] animate-spin" />
            <span className="text-[#7aa2f7] text-xs">Querying...</span>
          </>
        )}
        {!querying && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#9ece6a]" />
            <span className="text-[#565f89] text-xs">Connected</span>
          </div>
        )}
      </div>
    </div>
  )
}
