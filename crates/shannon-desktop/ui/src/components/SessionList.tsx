// Left sidebar session list with create/delete functionality
import { useState, useEffect } from 'react'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { listSessions, newSession, deleteSession } from '../lib/tauri-api'
import type { SessionInfo } from '../types/tauri-events'

interface SessionListProps {
  currentSessionId?: string
  onSessionSelect: (sessionId: string) => void
  onNewSession: () => void
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#414868]">
        <button
          onClick={handleNewSession}
          className="w-full flex items-center gap-2 px-4 py-2 bg-[#7aa2f7] hover:bg-[#7aa2f7]/80 text-[#1a1b26] rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-[#565f89]">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-[#565f89]">No sessions yet</div>
        ) : (
          <div className="py-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`mx-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                  currentSessionId === session.id
                    ? 'bg-[#7aa2f7]/20 text-[#7aa2f7]'
                    : 'hover:bg-[#24283b]/50 text-[#a9b1d6]'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {session.title || 'New Conversation'}
                    </div>
                    <div className="text-xs text-[#565f89] mt-0.5">
                      {session.message_count} messages • {formatDate(session.created_at)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#f7768e]/20 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-[#f7768e]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
