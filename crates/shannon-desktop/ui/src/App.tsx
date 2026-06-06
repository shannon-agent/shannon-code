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
  const [rightPanelTab, setRightPanelTab] = useState<'settings' | 'agents' | 'tasks' | 'mcp'>('settings')

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
          <div className="flex flex-col h-full">
            {/* Panel tabs */}
            <div className="flex items-center gap-0.5 px-2 py-1 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              {(['settings', 'agents', 'tasks', 'mcp'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRightPanelTab(tab)}
                  className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                    rightPanelTab === tab
                      ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {tab === 'mcp' ? 'MCP' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {rightPanelTab === 'settings' && <SettingsPanel />}
              {rightPanelTab === 'agents' && <AgentDashboard agents={[]} />}
              {rightPanelTab === 'tasks' && <TaskBoard tasks={[]} />}
              {rightPanelTab === 'mcp' && <McpBrowser servers={[]} />}
            </div>
          </div>
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
