// React context for app state with Tauri event subscriptions
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { listen } from '@tauri-apps/api/event'
import {
  getConfig,
  getStatus,
  getConversation,
  respondPermission as respondPermissionApi
} from '../lib/tauri-api'
import type {
  ChatMessage,
  QueryTextPayload,
  ToolStartPayload,
  ToolResultPayload,
  UsagePayload,
  QueryCompletedPayload,
  QueryFailedPayload,
  PermissionRequest
} from '../types/tauri-events'
import type { AgentMode } from '../components/ModeToggle'
import { EVENT_NAMES } from '../types/tauri-events'
import type { DesktopConfig } from '../types/tauri-events'

export interface ToolCall {
  toolUseId: string
  toolName: string
  toolInput: unknown
  result?: string
  isError?: boolean
  isRunning: boolean
}

interface AppStateContextType {
  messages: ChatMessage[]
  querying: boolean
  model: string
  provider: string
  config: DesktopConfig | null
  loading: boolean
  streamingText: string
  activeToolCalls: ToolCall[]
  usage: { inputTokens: number; outputTokens: number; costUsd: number } | null
  permissionRequest: PermissionRequest | null
  mode: AgentMode
  setMode: (mode: AgentMode) => void
  respondPermission: (allow: boolean) => void
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
  const [streamingText, setStreamingText] = useState('')
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([])
  const [usage, setUsage] = useState<{ inputTokens: number; outputTokens: number; costUsd: number } | null>(null)
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null)
  const [mode, setMode] = useState<AgentMode>('act')

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

  // Respond to permission request
  const respondPermission = useCallback(async (allow: boolean) => {
    if (permissionRequest) {
      const requestId = permissionRequest.request_id
      setPermissionRequest(null)
      try {
        await respondPermissionApi(requestId, allow)
      } catch (error) {
        console.error('Failed to respond to permission:', error)
      }
    }
  }, [permissionRequest])

  // Subscribe to Tauri events
  useEffect(() => {
    const unlisteners: Promise<() => void>[] = []

    // Query text streaming — accumulate partial text
    unlisteners.push(
      listen<QueryTextPayload>(EVENT_NAMES.QUERY_TEXT, (event) => {
        setStreamingText(prev => prev + event.payload.content)
      })
    )

    // Tool started
    unlisteners.push(
      listen<ToolStartPayload>(EVENT_NAMES.QUERY_TOOL_START, (event) => {
        setActiveToolCalls(prev => [
          ...prev,
          {
            toolUseId: event.payload.tool_use_id,
            toolName: event.payload.tool_name,
            toolInput: event.payload.tool_input,
            isRunning: true
          }
        ])
      })
    )

    // Tool result
    unlisteners.push(
      listen<ToolResultPayload>(EVENT_NAMES.QUERY_TOOL_RESULT, (event) => {
        setActiveToolCalls(prev =>
          prev.map(tc =>
            tc.toolUseId === event.payload.tool_use_id
              ? {
                  ...tc,
                  result: event.payload.result,
                  isError: event.payload.is_error,
                  isRunning: false
                }
              : tc
          )
        )
      })
    )

    // Usage update
    unlisteners.push(
      listen<UsagePayload>(EVENT_NAMES.QUERY_USAGE, (event) => {
        setUsage({
          inputTokens: event.payload.input_tokens,
          outputTokens: event.payload.output_tokens,
          costUsd: event.payload.cost_usd
        })
      })
    )

    // Query completed — reload conversation from backend
    unlisteners.push(
      listen<QueryCompletedPayload>(EVENT_NAMES.QUERY_COMPLETED, async () => {
        setQuerying(false)
        setStreamingText('')
        setActiveToolCalls([])
        try {
          const conversation = await getConversation()
          setMessages(conversation)
        } catch {
          // Conversation reload failed, keep existing state
        }
      })
    )

    // Query failed
    unlisteners.push(
      listen<QueryFailedPayload>(EVENT_NAMES.QUERY_FAILED, () => {
        setQuerying(false)
        setStreamingText('')
        setActiveToolCalls([])
      })
    )

    // Permission request
    unlisteners.push(
      listen<PermissionRequest>(EVENT_NAMES.PERMISSION_REQUEST, (event) => {
        setPermissionRequest(event.payload)
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
    loading,
    streamingText,
    activeToolCalls,
    usage,
    permissionRequest,
    mode,
    setMode,
    respondPermission
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
