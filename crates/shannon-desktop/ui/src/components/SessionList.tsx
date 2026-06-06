// Left sidebar session list with create/delete functionality and polished design
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, MessageSquare, Search, MoreHorizontal, Edit, Copy, Download } from 'lucide-react'
import { listSessions, newSession, deleteSession, searchSessions, renameSession, duplicateSession, exportSession } from '../lib/tauri-api'
import type { SessionInfo } from '../types/tauri-events'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { cn } from '../lib/utils'

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
  const [filteredSessions, setFilteredSessions] = useState<SessionInfo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [contextMenu, setContextMenu] = useState<{ sessionId: string; x: number; y: number } | null>(null)
  const [previewSession, setPreviewSession] = useState<SessionInfo | null>(null)
  const [previewTimeout, setPreviewTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await listSessions()
      setSessions(data)
      setFilteredSessions(data)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredSessions(sessions)
      return
    }

    try {
      const results = await searchSessions(query)
      setFilteredSessions(results)
    } catch (error) {
      console.error('Failed to search sessions:', error)
      setFilteredSessions(sessions.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase())
      ))
    }
  }

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setContextMenu({
      sessionId,
      x: rect.left,
      y: rect.bottom + 4
    })
  }

  const handleRename = async (sessionId: string) => {
    const newTitle = prompt('Enter new session name:')
    if (!newTitle || !newTitle.trim()) return

    try {
      const success = await renameSession(sessionId, newTitle.trim())
      if (success) {
        await loadSessions()
      }
    } catch (error) {
      console.error('Failed to rename session:', error)
    }
    setContextMenu(null)
  }

  const handleDuplicate = async (sessionId: string) => {
    try {
      const newSession = await duplicateSession(sessionId)
      await loadSessions()
      // Switch to the new session
      onSessionSelect(newSession.id)
    } catch (error) {
      console.error('Failed to duplicate session:', error)
    }
    setContextMenu(null)
  }

  const handleExport = async (sessionId: string, format: 'markdown' | 'json') => {
    try {
      const content = await exportSession(sessionId, format)
      const ext = format === 'markdown' ? 'md' : 'json'
      const blob = new Blob([content], { type: format === 'markdown' ? 'text/markdown' : 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session-${sessionId.slice(0, 8)}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export session:', error)
    }
    setContextMenu(null)
  }

  const handlePreview = (session: SessionInfo) => {
    setPreviewSession(session)

    // Clear previous timeout
    if (previewTimeout) {
      clearTimeout(previewTimeout)
    }

    // Set new timeout to clear preview
    setPreviewTimeout(setTimeout(() => setPreviewSession(null), 2000))
  }

  const handlePreviewHide = () => {
    if (previewTimeout) {
      clearTimeout(previewTimeout)
    }
    setPreviewSession(null)
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [contextMenu])

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

  const grouped = groupSessionsByDate(filteredSessions)

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-2">
        <Button onClick={handleNewSession} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search sessions..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--bg-input)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--accent)]/50 placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>
      <Separator />

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-[var(--text-muted)] text-sm">
            <div className="animate-spin w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-2" />
            Loading...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-muted)] text-sm">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            {searchQuery ? 'No sessions found' : 'No sessions yet'}
          </div>
        ) : (
          <div className="py-1">
            {grouped.map((group) => (
              <div key={group.label}>
                <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {group.label}
                </div>
                {group.sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionSelect(session.id)}
                    onContextMenu={(e) => handleContextMenu(e, session.id)}
                    onMouseEnter={() => handlePreview(session)}
                    onMouseLeave={handlePreviewHide}
                    className={cn(
                      'mx-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-100 group relative',
                      currentSessionId === session.id
                        ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] border border-transparent'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                        currentSessionId === session.id ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]/40'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate leading-tight">
                          {session.title || 'New Conversation'}
                        </div>
                        <div className="text-[10px text-[var(--text-muted)] mt-0.5 tabular-nums">
                          {session.message_count} msgs
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleContextMenu(e, session.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-[var(--bg-secondary)]/50"
                        title="More options"
                      >
                        <MoreHorizontal className="w-3 h-3 text-[var(--text-muted)]" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50 min-w-[160px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
        >
          <button
            onClick={() => handleRename(contextMenu.sessionId)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] flex items-center gap-2 text-[var(--text-primary)]"
          >
            <Edit className="w-3.5 h-3.5" />
            Rename
          </button>
          <button
            onClick={() => handleDuplicate(contextMenu.sessionId)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] flex items-center gap-2 text-[var(--text-primary)]"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <button
            onClick={() => handleExport(contextMenu.sessionId, 'markdown')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] flex items-center gap-2 text-[var(--text-primary)]"
          >
            <Download className="w-3.5 h-3.5" />
            Export Markdown
          </button>
          <button
            onClick={() => handleExport(contextMenu.sessionId, 'json')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] flex items-center gap-2 text-[var(--text-primary)]"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <div className="h-px bg-[var(--border)] my-1" />
          <button
            onClick={(e) => {
              handleDeleteSession(contextMenu.sessionId, e)
              setContextMenu(null)
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--error)]/10 flex items-center gap-2 text-[var(--error)]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}

      {/* Session Preview Popup */}
      {previewSession && (
        <div
          className="fixed bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg shadow-xl p-3 z-50 max-w-[280px]"
          style={{
            left: `${contextMenu?.x || 0}px`,
            top: `${(contextMenu?.y || 0) + 40}px`
          }}
        >
          <div className="text-sm font-medium text-[var(--text-primary)] mb-1">
            {previewSession.title || 'New Conversation'}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {previewSession.message_count} messages · Created {new Date(previewSession.created_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  )
}
