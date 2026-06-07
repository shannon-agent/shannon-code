// Multi-tab session bar component using shadcn Tabs
import { X, Plus } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
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
 * Tab bar showing open sessions with shadcn Tabs
 * - Horizontal bar above chat panel
 * - Each tab: title (truncated to 20 chars), X close button
 * - "+" button at end to create new session
 * - Active tab highlighted via shadcn data-[state=active] styles
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
    <div className="flex items-center gap-1 px-2 py-1">
      <Tabs
        value={activeSessionId ?? undefined}
        onValueChange={onSessionSelect}
        className="flex-1"
      >
        <TabsList className="bg-secondary h-auto p-0.5 gap-0.5">
          {sessions.map((session) => (
            <TabsTrigger
              key={session.id}
              value={session.id}
              className="group gap-1.5 px-2.5 py-1.5 min-w-[100px] max-w-[160px] data-[state=active]:min-w-[140px]"
            >
              <span className="text-sm font-medium truncate max-w-[100px]">
                {truncateTitle(session.title)}
              </span>
              <button
                onClick={(e) => handleTabClose(session.id, e)}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-secondary/80 transition-colors"
                aria-label={`Close ${session.title}`}
              >
                <X size={14} />
              </button>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* New Tab Button */}
      <button
        onClick={handleNewTab}
        disabled={!canAddMore}
        className={`
          p-2 rounded-md transition-all duration-150 flex-shrink-0
          ${canAddMore
            ? 'bg-secondary text-primary hover:bg-primary/15'
            : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
          }
        `}
        aria-label="New session"
        title={canAddMore ? 'Create new session' : `Maximum ${MAX_TABS} tabs allowed`}
      >
        <Plus size={16} />
      </button>

      {/* Tab Counter */}
      <div className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">
        {sessions.length}/{MAX_TABS}
      </div>
    </div>
  )
}
