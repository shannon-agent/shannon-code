// React context for app state with Tauri event subscriptions
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { listen } from '@tauri-apps/api/event'
import {
  getConfig,
  getStatus,
  getConversation,
  respondPermission as respondPermissionApi,
  configure
} from '../lib/tauri-api'
import { useToast } from '../components/ToastProvider'
import type {
  ChatMessage,
  QueryTextPayload,
  ToolStartPayload,
  ToolResultPayload,
  UsagePayload,
  QueryCompletedPayload,
  QueryFailedPayload,
  PermissionRequest,
  ThinkingPayload,
  ApprovalMode
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
  thinkingText: string
  activeToolCalls: ToolCall[]
  usage: { inputTokens: number; outputTokens: number; costUsd: number } | null
  permissionRequest: PermissionRequest | null
  mode: AgentMode
  setMode: (mode: AgentMode) => void
  respondPermission: (allow: boolean) => void
  approvalMode: ApprovalMode
  setApprovalMode: (mode: ApprovalMode) => void
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
  const [thinkingText, setThinkingText] = useState('')
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([])
  const [usage, setUsage] = useState<{ inputTokens: number; outputTokens: number; costUsd: number } | null>(null)
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null)
  const [mode, setMode] = useState<AgentMode>('act')
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('confirm')
  const { addToast } = useToast()

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

        // Load approval mode from config, default to 'confirm'
        if (cfg.approval_mode) {
          setApprovalMode(cfg.approval_mode as ApprovalMode)
        }
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
        addToast(`Permission ${allow ? 'approved' : 'denied'}`, 'info')
      } catch (error) {
        console.error('Failed to respond to permission:', error)
      }
    }
  }, [permissionRequest, addToast])

  // Set approval mode and persist to backend config
  const handleSetApprovalMode = useCallback(async (mode: ApprovalMode) => {
    setApprovalMode(mode)
    try {
      await configure({ key: 'approval_mode', value: mode })
      addToast(`Approval mode set to ${mode}`, 'success')
    } catch (error) {
      console.error('Failed to save approval mode:', error)
      addToast('Failed to save approval mode', 'error')
    }
  }, [addToast])

  // Subscribe to Tauri events
  useEffect(() => {
    const unlisteners: Promise<() => void>[] = []

    // Query text streaming — accumulate partial text
    unlisteners.push(
      listen<QueryTextPayload>(EVENT_NAMES.QUERY_TEXT, (event) => {
        setStreamingText(prev => prev + event.payload.content)
      })
    )

    // Thinking content — accumulate during streaming
    unlisteners.push(
      listen<ThinkingPayload>(EVENT_NAMES.QUERY_THINKING, (event) => {
        setThinkingText(prev => prev + event.payload.content)
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
        setThinkingText('')
        setActiveToolCalls([])
        addToast('Response received', 'success')
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
      listen<QueryFailedPayload>(EVENT_NAMES.QUERY_FAILED, (event) => {
        setQuerying(false)
        setStreamingText('')
        setThinkingText('')
        setActiveToolCalls([])
        addToast(`Query failed: ${event.payload.error}`, 'error')
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
    thinkingText,
    activeToolCalls,
    usage,
    permissionRequest,
    mode,
    setMode,
    respondPermission,
    approvalMode,
    setApprovalMode: handleSetApprovalMode
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
