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
        panel={settingsVisible ? <SettingsPanel /> : undefined}
        tabBar={
          <TabBar
            sessions={sessions}
            activeSessionId={currentSessionId ?? null}
            onSessionSelect={handleSessionSelect}
            onSessionClose={handleSessionClose}
            onNewSession={handleNewSession}
          />
        }
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
