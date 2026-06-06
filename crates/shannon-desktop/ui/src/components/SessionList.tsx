// Left sidebar session list with create/delete functionality and polished design
import { useState, useEffect } from 'react'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { listSessions, newSession, deleteSession } from '../lib/tauri-api'
import type { SessionInfo } from '../types/tauri-events'

interface SessionListProps {
  currentSessionId?: string
  onSessionSelect: (sessionId: string) => void
  onNewSession: () => void
}

interface GroupedSessions {
  label: string
  sessions: SessionInfo[]
}

function groupSessionsByDate(sessions: SessionInfo[]): GroupedSessions[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000
  const weekAgo = today - 7 * 86400000

  const groups: GroupedSessions[] = []
  const todaySessions: SessionInfo[] = []
  const yesterdaySessions: SessionInfo[] = []
  const weekSessions: SessionInfo[] = []
  const olderSessions: SessionInfo[] = []

  for (const session of sessions) {
    if (session.created_at >= today) {
      todaySessions.push(session)
    } else if (session.created_at >= yesterday) {
      yesterdaySessions.push(session)
    } else if (session.created_at >= weekAgo) {
      weekSessions.push(session)
    } else {
      olderSessions.push(session)
    }
  }

  if (todaySessions.length) groups.push({ label: 'Today', sessions: todaySessions })
  if (yesterdaySessions.length) groups.push({ label: 'Yesterday', sessions: yesterdaySessions })
  if (weekSessions.length) groups.push({ label: 'This Week', sessions: weekSessions })
  if (olderSessions.length) groups.push({ label: 'Older', sessions: olderSessions })

  return groups.length ? groups : [{ label: 'Sessions', sessions: [] }]
}

export function SessionList({
  currentSessionId,
  onSessionSelect,
  onNewSession
}: SessionListProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await listSessions()
      setSessions(data)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleNewSession = async () => {
    try {
      await newSession()
      await loadSessions()
      onNewSession()
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this session?')) return

    try {
      await deleteSession(sessionId)
      await loadSessions()
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const grouped = groupSessionsByDate(sessions)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-[var(--border)]">
        <button
          onClick={handleNewSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] rounded-lg font-medium text-sm transition-all duration-150 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-[var(--text-muted)] text-sm">
            <div className="animate-spin w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-2" />
            Loading...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-muted)] text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No sessions yet
          </div>
        ) : (
          <div className="py-1">
            {grouped.map((group) => (
              <div key={group.label}>
                {/* Group label */}
                <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {group.label}
                </div>
                {/* Session items */}
                {group.sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionSelect(session.id)}
                    className={`mx-1.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-100 group relative ${
                      currentSessionId === session.id
                        ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        currentSessionId === session.id ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]/40'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate leading-tight">
                          {session.title || 'New Conversation'}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5 tabular-nums">
                          {session.message_count} msgs
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--error)]/20 rounded transition-all duration-100"
                        title="Delete session"
                      >
                        <Trash2 className="w-3 h-3 text-[var(--error)]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
