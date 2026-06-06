// React context for app state with Tauri event subscriptions
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { listen } from '@tauri-apps/api/event'
import {
  getConfig,
  getStatus,
  getConversation
} from '../lib/tauri-api'
import type {
  ChatMessage,
  QueryTextPayload,
  ToolStartPayload,
  ToolResultPayload,
  UsagePayload,
  QueryCompletedPayload,
  QueryFailedPayload
} from '../types/tauri-events'
import { EVENT_NAMES } from '../types/tauri-events'
import type { DesktopConfig } from '../types/tauri-events'

interface AppStateContextType {
  messages: ChatMessage[]
  querying: boolean
  model: string
  provider: string
  config: DesktopConfig | null
  loading: boolean
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

interface AppStateProviderProps {
  children: ReactNode
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [querying, setQuerying] = useState(false)
  const [model, setModel] = useState<string>('')
  const [provider, setProvider] = useState<string>('')
  const [config, setConfig] = useState<DesktopConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // Load initial state on mount
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const [cfg, status, conversation] = await Promise.all([
          getConfig(),
          getStatus(),
          getConversation()
        ])

        setConfig(cfg)
        setModel(status.model)
        setProvider(status.provider)
        setQuerying(status.querying)
        setMessages(conversation)
      } catch (error) {
        console.error('Failed to load initial state:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialState()
  }, [])

  // Subscribe to Tauri events
  useEffect(() => {
    const unlisteners: Promise<() => void>[] = []

    // Query text streaming
    unlisteners.push(
      listen<QueryTextPayload>(EVENT_NAMES.QUERY_TEXT, () => {
        // This will be handled by the streaming hook
      })
    )

    // Tool started
    unlisteners.push(
      listen<ToolStartPayload>(EVENT_NAMES.QUERY_TOOL_START, () => {
        // Will be used to display tool call info
      })
    )

    // Tool result
    unlisteners.push(
      listen<ToolResultPayload>(EVENT_NAMES.QUERY_TOOL_RESULT, () => {
        // Will update tool call display with result
      })
    )

    // Usage update
    unlisteners.push(
      listen<UsagePayload>(EVENT_NAMES.QUERY_USAGE, () => {
        // Update token usage display
      })
    )

    // Query completed
    unlisteners.push(
      listen<QueryCompletedPayload>(EVENT_NAMES.QUERY_COMPLETED, () => {
        setQuerying(false)
      })
    )

    // Query failed
    unlisteners.push(
      listen<QueryFailedPayload>(EVENT_NAMES.QUERY_FAILED, () => {
        setQuerying(false)
        // Will display error message
      })
    )

    // Cleanup all listeners on unmount
    return () => {
      Promise.all(unlisteners).then((unfns) => {
        unfns.forEach((unfn) => unfn())
      })
    }
  }, [])

  const value: AppStateContextType = {
    messages,
    querying,
    model,
    provider,
    config,
    loading
  }

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState(): AppStateContextType {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}
