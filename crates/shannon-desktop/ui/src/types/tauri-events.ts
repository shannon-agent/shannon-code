// TypeScript types matching Rust event structs in src/events.rs

export interface QueryTextPayload {
  query_id: string
  content: string
}

export interface ToolStartPayload {
  query_id: string
  tool_use_id: string
  tool_name: string
  tool_input: unknown
}

export interface ToolResultPayload {
  query_id: string
  tool_use_id: string
  tool_name: string
  result: string
  is_error: boolean
}

export interface ToolProgressPayload {
  query_id: string
  tool_use_id: string
  tool_name: string
  progress: number
  message: string
}

export interface ThinkingPayload {
  query_id: string
  content: string
}

export interface UsagePayload {
  query_id: string
  input_tokens: number
  output_tokens: number
  cost_usd: number
}

export interface QueryCompletedPayload {
  query_id: string
}

export interface QueryFailedPayload {
  query_id: string
  error: string
}

export interface PermissionRequest {
  tool: string
  input: unknown
  risk: string
  request_id: string
}

export interface SessionInfo {
  id: string
  title: string
  created_at: number
  message_count: number
}

export interface SessionLoaded {
  messages: ChatMessage[]
}

export interface ChatMessage {
  role: string
  content: string
  timestamp: number
}

export interface StatusResponse {
  model: string
  provider: string
  querying: boolean
  message_count: number
  working_dir: string
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  context_window: number
}

export interface ToolInfo {
  name: string
  description: string
  enabled: boolean
}

export interface ConfigUpdate {
  key: string
  value: string
}

export interface ProviderSwitchRequest {
  provider: string
  api_key?: string
  base_url?: string
  model: string
}

export interface DesktopConfig {
  provider: string
  api_key: string
  base_url?: string
  model: string
}

export interface SendMessageResponse {
  query_id: string
}

// Tauri event names (must match Rust event_names module)
export const EVENT_NAMES = {
  QUERY_TEXT: 'query:text',
  QUERY_TOOL_START: 'query:tool-start',
  QUERY_TOOL_RESULT: 'query:tool-result',
  QUERY_TOOL_PROGRESS: 'query:tool-progress',
  QUERY_THINKING: 'query:thinking',
  QUERY_USAGE: 'query:usage',
  QUERY_COMPLETED: 'query:completed',
  QUERY_FAILED: 'query:failed',
  PERMISSION_REQUEST: 'permission-request',
  SESSIONS_UPDATED: 'sessions-updated',
  SESSION_LOADED: 'session-loaded',
} as const
