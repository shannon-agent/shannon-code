// Session list with MD3 styling and Material Symbols
import { useState, useEffect } from 'react'
import { listSessions, newSession, deleteSession, searchSessions, renameSession, duplicateSession, exportSession } from '../lib/tauri-api'
import type { SessionInfo } from '../types/tauri-events'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'
import { Empty } from './ui/empty'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
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
  }

  const handleDuplicate = async (sessionId: string) => {
    try {
      const newSess = await duplicateSession(sessionId)
      await loadSessions()
      onSessionSelect(newSess.id)
    } catch (error) {
      console.error('Failed to duplicate session:', error)
    }
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

  const handleDeleteSession = async (sessionId: string) => {
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
      <div className="p-md3-md space-y-md3-sm">
        <Button onClick={handleNewSession} className="w-full gap-md3-sm rounded-xl">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Chat
        </Button>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-md3-on-surface-variant/50 pointer-events-none">search</span>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search sessions..."
            className="pl-8 rounded-xl bg-md3-surface-container border-md3-outline-variant/10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-md3-md space-y-md3-md">
            <Skeleton className="h-4 w-16 rounded-lg" />
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <Empty
            icon={<span className="material-symbols-outlined text-[32px] text-md3-on-surface-variant/40">chat_bubble</span>}
            title={searchQuery ? 'No sessions found' : 'No sessions yet'}
            description={searchQuery ? 'Try a different search term' : 'Start a new chat to begin'}
          />
        ) : (
          <div className="py-md3-xs">
            {grouped.map((group) => (
              <div key={group.label}>
                <div className="px-md3-md pt-md3-md pb-md3-xs text-label-sm font-semibold uppercase tracking-wider text-md3-on-surface-variant/50">
                  {group.label}
                </div>
                {group.sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionSelect(session.id)}
                    className={cn(
                      'mx-md3-sm px-md3-md py-md3-sm rounded-xl cursor-pointer transition-all duration-150 group relative',
                      currentSessionId === session.id
                        ? 'bg-md3-primary/10 text-md3-primary border border-md3-primary/15'
                        : 'text-md3-on-surface hover:bg-md3-surface-container border border-transparent'
                    )}
                  >
                    <div className="flex items-start gap-md3-sm">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
                        currentSessionId === session.id ? 'bg-md3-primary' : 'bg-md3-on-surface-variant/30'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="text-body-sm truncate leading-tight">
                          {session.title || 'New Conversation'}
                        </div>
                        <div className="text-label-sm text-md3-on-surface-variant/60 mt-md3-xs tabular-nums">
                          {session.message_count} msgs
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-md3-surface-container-high rounded-lg"
                            title="More options"
                          >
                            <span className="material-symbols-outlined text-[14px] text-md3-on-surface-variant">more_horiz</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRename(session.id) }}>
                            <span className="material-symbols-outlined text-[16px] mr-2">edit</span>
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(session.id) }}>
                            <span className="material-symbols-outlined text-[16px] mr-2">content_copy</span>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleExport(session.id, 'markdown') }}>
                            <span className="material-symbols-outlined text-[16px] mr-2">download</span>
                            Export Markdown
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleExport(session.id, 'json') }}>
                            <span className="material-symbols-outlined text-[16px] mr-2">download</span>
                            Export JSON
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id) }}
                            className="text-md3-error focus:text-md3-error focus:bg-md3-error/10"
                          >
                            <span className="material-symbols-outlined text-[16px] mr-2">delete</span>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
