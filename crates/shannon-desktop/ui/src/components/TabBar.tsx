// Multi-tab session bar component
import { X, Plus } from 'lucide-react'
import type { SessionInfo } from '../types/tauri-events'

interface TabBarProps {
  sessions: SessionInfo[]
  activeSessionId: string | null
  onSessionSelect: (id: string) => void
  onSessionClose: (id: string) => void
  onNewSession: () => void
}

const MAX_TABS = 10

/**
 * Tab bar showing open sessions with Tokyo Night styling
 * - Horizontal bar above chat panel
 * - Each tab: title (truncated to 20 chars), X close button
 * - "+" button at end to create new session
 * - Active tab highlighted with blue accent (#7aa2f7)
 * - Max 10 tabs enforced
 */
export function TabBar({
  sessions,
  activeSessionId,
  onSessionSelect,
  onSessionClose,
  onNewSession
}: TabBarProps) {
  const canAddMore = sessions.length < MAX_TABS

  const handleTabClick = (id: string) => {
    onSessionSelect(id)
  }

  const handleTabClose = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    onSessionClose(id)
  }

  const handleNewTab = () => {
    if (canAddMore) {
      onNewSession()
    }
  }

  const truncateTitle = (title: string, maxLength = 20) => {
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title
  }

  return (
    <div className="flex items-center bg-[#1a1b26] border-b border-[#414868] px-2 py-1 gap-1">
      {/* Session Tabs */}
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => handleTabClick(session.id)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer
            border-t-2 border-x transition-all duration-150
            ${activeSessionId === session.id
              ? 'bg-[#24283b] border-[#7aa2f7] text-[#7aa2f7] min-w-[140px]'
              : 'bg-[#1f2335] border-[#414868] text-[#a9b1d6] hover:bg-[#24283b] hover:text-[#c0caf5] min-w-[120px]'
            }
          `}
        >
          <span className="text-sm font-medium truncate max-w-[100px]">
            {truncateTitle(session.title)}
          </span>
          <button
            onClick={(e) => handleTabClose(session.id, e)}
            className="p-0.5 rounded hover:bg-[#414868] transition-colors"
            aria-label={`Close ${session.title}`}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* New Tab Button */}
      <button
        onClick={handleNewTab}
        disabled={!canAddMore}
        className={`
          p-2 rounded-lg transition-all duration-150
          ${canAddMore
            ? 'bg-[#24283b] text-[#7aa2f7] hover:bg-[#2a2f44] hover:text-[#9aa5ce]'
            : 'bg-[#1f2335] text-[#565f89] cursor-not-allowed opacity-50'
          }
        `}
        aria-label="New session"
        title={canAddMore ? 'Create new session' : `Maximum ${MAX_TABS} tabs allowed`}
      >
        <Plus size={18} />
      </button>

      {/* Tab Counter */}
      <div className="ml-auto text-xs text-[#565f89]">
        {sessions.length} / {MAX_TABS}
      </div>
    </div>
  )
}
