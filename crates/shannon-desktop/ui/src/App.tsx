import { useState, useEffect, useCallback, useRef } from 'react'
import { AppStateProvider, useAppState } from './context/AppState'
import { ThemeProvider } from './context/ThemeContext'
import { useTheme } from './context/ThemeContext'
import { useStreaming } from './hooks/useStreaming'
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from './hooks/useKeyboardShortcuts'
import { listen } from '@tauri-apps/api/event'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ChatPanel } from './components/ChatPanel'
import { SessionList } from './components/SessionList'
import { SettingsPanel } from './components/SettingsPanel'
import { CommandPalette } from './components/CommandPalette'
import { TabBar } from './components/TabBar'
import { FileTree } from './components/FileTree'
import { TerminalPane } from './components/TerminalPane'
import { AgentDashboard } from './components/AgentDashboard'
import { TaskBoard } from './components/TaskBoard'
import { McpBrowser } from './components/McpBrowser'
import { ToastProvider } from './components/ToastProvider'
import { BackgroundAgentBadge } from './components/BackgroundAgentBadge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import {
  newSession,
  listSessions,
  switchSession,
  deleteSession,
  listAgents,
  listTasks,
  cancelBackgroundTask,
  listMcpServers
} from './lib/tauri-api'
import type { SessionInfo, McpServerInfo } from './types/tauri-events'

function AppContent() {
  const { sendMessage, isStreaming, error, clearError } = useStreaming()
  const { theme, setTheme } = useTheme()
  const { setViewMode } = useAppState()
  const [currentSessionId, setCurrentSessionId] = useState<string>()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(true)
  const [rightPanelTab, setRightPanelTab] = useState<string>('settings')
  const [agents, setAgents] = useState<import('./components/AgentDashboard').AgentInfo[]>([])
  const [tasks, setTasks] = useState<import('./components/TaskBoard').TaskItem[]>([])
  const [mcpServers, setMcpServers] = useState<McpServerInfo[]>([])

  // Refs for keyboard shortcut handlers (avoid stale closures)
  const sessionsRef = useRef(sessions)
  sessionsRef.current = sessions
  const currentSessionIdRef = useRef(currentSessionId)
  currentSessionIdRef.current = currentSessionId
  // Register default keyboard shortcuts (dispatches DOM custom events)
  useKeyboardShortcuts(DEFAULT_SHORTCUTS)

  const handleNewSession = useCallback(async () => {
    try {
      const newId = await newSession()
      setCurrentSessionId(newId)
      const updated = await listSessions()
      setSessions(updated)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }, [])

  // Load agents and tasks on mount + listen for updates
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

  // Listen for DOM custom events dispatched by shortcuts
  useEffect(() => {
    const handlers: Record<string, EventListener> = {
      'shannon:command-palette': () => setCommandPaletteOpen(prev => !prev),
      'shannon:new-session': () => handleNewSession(),
      'shannon:toggle-right-panel': () => setSettingsVisible(prev => !prev),
      'shannon:toggle-sidebar': () => setSidebarCollapsed(prev => !prev),
      'shannon:toggle-settings': () => setSettingsVisible(prev => !prev),
      'shannon:close-dialogs': () => setCommandPaletteOpen(false),
      'shannon:cycle-view-mode': () => setViewMode(prev => prev === 'verbose' ? 'normal' : prev === 'normal' ? 'summary' : 'verbose'),
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
        // Dispatch focus input event for MessageInput component
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

  // Listen for Tauri global shortcut events
  useEffect(() => {
    const unlisteners = [
      listen('new-session', () => {
        handleNewSession()
      }),
      listen('focus-input', () => {
        // Dispatch focus input event for MessageInput component
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
    try {
      await switchSession(sessionId)
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }, [])

  const handleSessionClose = useCallback(async (id: string) => {
    try {
      await deleteSession(id)
      if (currentSessionId === id) {
        setCurrentSessionId(undefined)
      }
      const updated = await listSessions()
      setSessions(updated)
    } catch (error) {
      console.error('Failed to close session:', error)
    }
  }, [currentSessionId])

  const cycleTheme = useCallback(() => {
    const themes = ['tokyo-night', 'tokyo-night-light', 'catppuccin', 'nord'] as const
    const idx = themes.indexOf(theme)
    setTheme(themes[(idx + 1) % themes.length])
  }, [theme, setTheme])

  return (
    <>
      <Layout
        sidebar={sidebarVisible ? (
          <SessionList
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
          />
        ) : undefined}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
        panel={settingsVisible ? (
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex flex-col h-full">
            <TabsList className="w-full justify-start rounded-none border-b border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 h-auto gap-0.5">
              <TabsTrigger value="settings" className="text-[10px] px-2 py-1">Settings</TabsTrigger>
              <TabsTrigger value="agents" className="text-[10px] px-2 py-1">Agents</TabsTrigger>
              <TabsTrigger value="tasks" className="text-[10px] px-2 py-1">Tasks</TabsTrigger>
              <TabsTrigger value="mcp" className="text-[10px] px-2 py-1">MCP</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="flex-1 overflow-hidden mt-0"><SettingsPanel /></TabsContent>
            <TabsContent value="agents" className="flex-1 overflow-hidden mt-0"><AgentDashboard agents={agents} onCancel={id => cancelBackgroundTask(id).catch(() => {})} /></TabsContent>
            <TabsContent value="tasks" className="flex-1 overflow-hidden mt-0"><TaskBoard tasks={tasks} onRefresh={() => listTasks().then(apiTasks => {
              setTasks(apiTasks.map(t => ({
                id: t.id,
                subject: t.title,
                description: t.description,
                status: (t.status === 'in_progress' ? 'in_progress' : t.status === 'completed' ? 'completed' : t.status === 'failed' ? 'failed' : 'pending') as import('./components/TaskBoard').TaskItem['status'],
                owner: t.assignee,
              })))
            }).catch(() => {})} /></TabsContent>
            <TabsContent value="mcp" className="flex-1 overflow-hidden mt-0"><McpBrowser
                  servers={mcpServers.map(s => ({
                    name: s.name,
                    status: s.connected ? 'connected' as const : s.enabled ? 'disconnected' as const : 'disconnected' as const,
                    tools: s.tools.map(t => ({ name: t.name, description: t.description })),
                  }))}
                  onRefresh={() => listMcpServers().then(setMcpServers).catch(() => {})}
                /></TabsContent>
          </Tabs>
        ) : undefined}
        tabBar={
          <TabBar
            sessions={sessions}
            activeSessionId={currentSessionId ?? null}
            onSessionSelect={handleSessionSelect}
            onSessionClose={handleSessionClose}
            onNewSession={handleNewSession}
          />
        }
        bottomPanel={<TerminalPane />}
      >
        <ChatPanel
          sendMessage={sendMessage}
          isStreaming={isStreaming}
          error={error}
          clearError={clearError}
        />
      </Layout>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNewSession={handleNewSession}
        onOpenSettings={() => setSettingsVisible(prev => !prev)}
        onSwitchModel={() => {}}
        onToggleSidebar={() => setSidebarVisible(prev => !prev)}
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
