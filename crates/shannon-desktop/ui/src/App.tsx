import { useState, useEffect, useCallback } from 'react'
import { AppStateProvider } from './context/AppState'
import { ThemeProvider } from './context/ThemeContext'
import { useTheme } from './context/ThemeContext'
import { useStreaming } from './hooks/useStreaming'
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from './hooks/useKeyboardShortcuts'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import {
  newSession,
  listSessions,
  switchSession,
  deleteSession
} from './lib/tauri-api'
import type { SessionInfo } from './types/tauri-events'

function AppContent() {
  const { sendMessage, isStreaming, error, clearError } = useStreaming()
  const { theme, setTheme } = useTheme()
  const [currentSessionId, setCurrentSessionId] = useState<string>()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [settingsVisible, setSettingsVisible] = useState(true)
  const [rightPanelTab, setRightPanelTab] = useState<string>('settings')

  // Register default keyboard shortcuts (dispatches DOM custom events)
  useKeyboardShortcuts(DEFAULT_SHORTCUTS)

  // Listen for DOM custom events dispatched by shortcuts
  useEffect(() => {
    const handlers: Record<string, EventListener> = {
      'shannon:command-palette': () => setCommandPaletteOpen(prev => !prev),
      'shannon:new-session': () => handleNewSession(),
      'shannon:toggle-sidebar': () => setSidebarVisible(prev => !prev),
      'shannon:toggle-settings': () => setSettingsVisible(prev => !prev),
      'shannon:close-dialogs': () => setCommandPaletteOpen(false),
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

  // Load sessions on mount
  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(console.error)
  }, [])

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
        panel={settingsVisible ? (
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex flex-col h-full">
            <TabsList className="w-full justify-start rounded-none border-b border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-1 h-auto gap-0.5">
              <TabsTrigger value="settings" className="text-[10px] px-2 py-1">Settings</TabsTrigger>
              <TabsTrigger value="agents" className="text-[10px] px-2 py-1">Agents</TabsTrigger>
              <TabsTrigger value="tasks" className="text-[10px] px-2 py-1">Tasks</TabsTrigger>
              <TabsTrigger value="mcp" className="text-[10px] px-2 py-1">MCP</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="flex-1 overflow-hidden mt-0"><SettingsPanel /></TabsContent>
            <TabsContent value="agents" className="flex-1 overflow-hidden mt-0"><AgentDashboard agents={[]} /></TabsContent>
            <TabsContent value="tasks" className="flex-1 overflow-hidden mt-0"><TaskBoard tasks={[]} /></TabsContent>
            <TabsContent value="mcp" className="flex-1 overflow-hidden mt-0"><McpBrowser servers={[]} /></TabsContent>
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
      />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppStateProvider>
          <AppContent />
        </AppStateProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
