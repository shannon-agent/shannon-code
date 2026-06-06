import { useState } from 'react'
import { AppStateProvider } from './context/AppState'
import { useStreaming } from './hooks/useStreaming'
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from './hooks/useKeyboardShortcuts'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ChatPanel } from './components/ChatPanel'
import { SessionList } from './components/SessionList'
import { SettingsPanel } from './components/SettingsPanel'
import { newSession } from './lib/tauri-api'

function AppContent() {
  const { sendMessage, isStreaming, error, clearError } = useStreaming()
  const [currentSessionId, setCurrentSessionId] = useState<string>()

  // Register default keyboard shortcuts
  useKeyboardShortcuts(DEFAULT_SHORTCUTS)

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  const handleNewSession = async () => {
    try {
      const newId = await newSession()
      setCurrentSessionId(newId)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  return (
    <Layout
      sidebar={
        <SessionList
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
        />
      }
      panel={<SettingsPanel />}
    >
      <ChatPanel
        sendMessage={sendMessage}
        isStreaming={isStreaming}
        error={error}
        clearError={clearError}
      />
    </Layout>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </ErrorBoundary>
  )
}
