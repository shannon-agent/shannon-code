import { useState, useEffect, useCallback, useRef } from 'react'
import { AppStateProvider, useAppState } from './context/AppState'
import { ThemeProvider } from './context/ThemeContext'
import { useTheme } from './context/ThemeContext'
import type { Theme } from './context/ThemeContext'
import { useStreaming } from './hooks/useStreaming'
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from './hooks/useKeyboardShortcuts'
import { listen } from '@tauri-apps/api/event'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ChatPanel } from './components/ChatPanel'
import { SessionList } from './components/SessionList'
import { CommandPalette } from './components/CommandPalette'
import { ToastProvider } from './components/ToastProvider'
import { BackgroundAgentBadge } from './components/BackgroundAgentBadge'
import { PageRouter } from './components/PageRouter'
import type { PageId } from './components/AppSidebar'
import {
  newSession,
  listSessions,
  switchSession,
  listAgents,
  listTasks,
  cancelBackgroundTask,
  listMcpServers
} from './lib/tauri-api'
import type { SessionInfo, McpServerInfo } from './types/tauri-events'

function AppContent() {
  const { sendMessage, isStreaming, error, clearError } = useStreaming()
  const { theme, setTheme } = useTheme()
  const { setViewMode, viewMode, usage } = useAppState()
  const [currentPage, setCurrentPage] = useState<PageId>('chat')
  const [currentSessionId, setCurrentSessionId] = useState<string>()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [agents, setAgents] = useState<import('./components/AgentDashboard').AgentInfo[]>([])
  const [tasks, setTasks] = useState<import('./components/TaskBoard').TaskItem[]>([])
  const [mcpServers, setMcpServers] = useState<McpServerInfo[]>([])

  // Refs for keyboard shortcut handlers
  const viewModeRef = useRef(viewMode)
  viewModeRef.current = viewMode
  const sessionsRef = useRef(sessions)
  sessionsRef.current = sessions
  const currentSessionIdRef = useRef(currentSessionId)
  currentSessionIdRef.current = currentSessionId

  useKeyboardShortcuts(DEFAULT_SHORTCUTS)

  const handleNewSession = useCallback(async () => {
    try {
      const newId = await newSession()
      setCurrentSessionId(newId)
      setCurrentPage('chat')
      const updated = await listSessions()
      setSessions(updated)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }, [])

  const handleNavigate = useCallback((page: PageId) => {
    setCurrentPage(page)
  }, [])

  // Load agents, tasks, MCP on mount + listen for updates
  useEffect(() => {
    listAgents().then(setAgents).catch(() => {})
    listMcpServers().then(setMcpServers).catch(() => {})
    listTasks().then(apiTasks => {
      setTasks(apiTasks.map(t => ({
        id: t.id,
        subject: t.title,
        description: t.description,
        status: (t.status === 'in_progress' ? 'in_progress' : t.status === 'completed' ? 'completed' : t.status === 'failed' ? 'failed' : 'pending') as import('./components/TaskBoard').TaskItem['status'],
        owner: t.assignee,
      })))
    }).catch(() => {})

    let unlistenAgents: (() => void) | undefined
    let unlistenTasks: (() => void) | undefined

    ;(async () => {
      unlistenAgents = await listen('background-tasks-updated', () => {
        listAgents().then(setAgents).catch(() => {})
        listMcpServers().then(setMcpServers).catch(() => {})
      })
      unlistenTasks = await listen('background-tasks-updated', () => {
        listTasks().then(apiTasks => {
          setTasks(apiTasks.map(t => ({
            id: t.id,
            subject: t.title,
            description: t.description,
            status: (t.status === 'in_progress' ? 'in_progress' : t.status === 'completed' ? 'completed' : t.status === 'failed' ? 'failed' : 'pending') as import('./components/TaskBoard').TaskItem['status'],
            owner: t.assignee,
          })))
        }).catch(() => {})
      })
    })()

    return () => {
      unlistenAgents?.()
      unlistenTasks?.()
    }
  }, [])

  // Keyboard shortcut handlers
  useEffect(() => {
    const handlers: Record<string, EventListener> = {
      'shannon:command-palette': () => setCommandPaletteOpen(prev => !prev),
      'shannon:new-session': () => handleNewSession(),
      'shannon:close-dialogs': () => setCommandPaletteOpen(false),
      'shannon:cycle-view-mode': () => setViewMode(
          viewModeRef.current === 'verbose' ? 'normal' : viewModeRef.current === 'normal' ? 'summary' : 'verbose'
        ),
      'shannon:next-session': () => {
        const s = sessionsRef.current
        const curId = currentSessionIdRef.current
        const idx = s.findIndex(x => x.id === curId)
        if (s.length > 0) {
          const next = s[(idx + 1) % s.length]
          handleSessionSelect(next.id)
        }
      },
      'shannon:prev-session': () => {
        const s = sessionsRef.current
        const curId = currentSessionIdRef.current
        const idx = s.findIndex(x => x.id === curId)
        if (s.length > 0) {
          const prev = s[(idx - 1 + s.length) % s.length]
          handleSessionSelect(prev.id)
        }
      },
      'global:new-session': () => handleNewSession(),
      'global:focus-input': () => {
        window.dispatchEvent(new CustomEvent('shannon:focus-input'))
      },
    }

    for (const [event, handler] of Object.entries(handlers)) {
      window.addEventListener(event, handler)
    }
    return () => {
      for (const [event, handler] of Object.entries(handlers)) {
        window.removeEventListener(event, handler)
      }
    }
  }, [])

  // Tauri global shortcut events
  useEffect(() => {
    const unlisteners = [
      listen('new-session', () => {
        handleNewSession()
      }),
      listen('focus-input', () => {
        window.dispatchEvent(new CustomEvent('shannon:focus-input'))
      }),
    ]

    Promise.all(unlisteners).then((cleanups) => {
      return () => {
        cleanups.forEach(fn => fn())
      }
    })
  }, [handleNewSession])

  // Load sessions on mount
  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(console.error)
  }, [])

  const handleSessionSelect = useCallback(async (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setCurrentPage('chat')
    try {
      await switchSession(sessionId)
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }, [])

  const cycleTheme = useCallback(() => {
    const themes: Theme[] = ['material', 'tokyo-night', 'tokyo-night-light', 'catppuccin', 'nord', 'ember', 'slate']
    const idx = themes.indexOf(theme)
    setTheme(themes[(idx + 1) % themes.length])
  }, [theme, setTheme])

  const handleRefreshTasks = useCallback(() => {
    listTasks().then(apiTasks => {
      setTasks(apiTasks.map(t => ({
        id: t.id,
        subject: t.title,
        description: t.description,
        status: (t.status === 'in_progress' ? 'in_progress' : t.status === 'completed' ? 'completed' : t.status === 'failed' ? 'failed' : 'pending') as import('./components/TaskBoard').TaskItem['status'],
        owner: t.assignee,
      })))
    }).catch(() => {})
  }, [])

  // Chat page: three-column layout with session list + chat + context panel
  const isChatPage = currentPage === 'chat'
  const tokenUsage = usage ? `${(usage.inputTokens + usage.outputTokens).toLocaleString()} tokens` : undefined
  const computeTime = usage?.costUsd ? `$${usage.costUsd.toFixed(4)}` : undefined

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        tokenUsage={tokenUsage}
        computeTime={computeTime}
        activeAgents={agents.filter(a => a.status === 'running').map(a => a.name)}
      >
        {isChatPage ? (
          <div className="flex h-full">
            {/* Left — Session history */}
            <aside className="w-[240px] border-r border-md3-outline-variant/10 flex flex-col glass-panel shrink-0 overflow-hidden">
              <SessionList
                currentSessionId={currentSessionId}
                onSessionSelect={handleSessionSelect}
                onNewSession={handleNewSession}
              />
            </aside>

            {/* Center — Chat */}
            <section className="flex-1 flex flex-col overflow-hidden">
              <ChatPanel
                sendMessage={sendMessage}
                isStreaming={isStreaming}
                error={error}
                clearError={clearError}
              />
            </section>

            {/* Right — Context panel */}
            <aside className="w-[300px] border-l border-md3-outline-variant/10 glass-panel shrink-0 overflow-y-auto hidden lg:block">
              <div className="p-md3-lg space-y-md3-xl">
                <div>
                  <div className="text-label-md text-md3-on-surface-variant uppercase tracking-wider opacity-60 mb-md3-sm">Context</div>
                  <div className="space-y-md3-xs text-body-sm text-md3-on-surface-variant opacity-70">
                    <div className="p-md3-md bg-md3-surface-container rounded-xl flex items-center gap-md3-md border border-md3-outline-variant/10">
                      <span className="material-symbols-outlined text-md3-primary text-[18px]">folder</span>
                      <span className="text-label-md truncate">Project Context</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-label-md text-md3-on-surface-variant uppercase tracking-wider opacity-60 mb-md3-sm">Active Skills</div>
                  <div className="flex flex-wrap gap-md3-xs">
                    {['code-edit', 'bash', 'search'].map(skill => (
                      <span key={skill} className="px-md3-md py-md3-sm bg-md3-primary/10 text-md3-primary text-label-sm rounded-full border border-md3-primary/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <PageRouter
            currentPage={currentPage}
            sendMessage={sendMessage}
            isStreaming={isStreaming}
            error={error}
            clearError={clearError}
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
            agents={agents}
            tasks={tasks}
            mcpServers={mcpServers}
            onRefreshTasks={handleRefreshTasks}
            onRefreshMcp={() => listMcpServers().then(setMcpServers).catch(() => {})}
            onCancelAgent={(id) => cancelBackgroundTask(id).catch(() => {})}
            onNavigate={handleNavigate}
          />
        )}
      </Layout>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNewSession={handleNewSession}
        onOpenSettings={() => setCurrentPage('settings-general')}
        onSwitchModel={() => setCurrentPage('settings-models')}
        onToggleSidebar={() => {}}
        onToggleTheme={cycleTheme}
        onSessionSelect={handleSessionSelect}
      />
      <BackgroundAgentBadge />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppStateProvider>
            <AppContent />
          </AppStateProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
