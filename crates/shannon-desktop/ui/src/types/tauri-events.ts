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
  file_attachments?: FileAttachment[]
}

export interface FileAttachment {
  name: string
  path: string
  size: number
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
  working_dir?: string
  theme?: string
  mcp_servers: Array<{
    name: string
    command: string
    args: string[]
    env: Record<string, string>
    enabled: boolean
  }>
  approval_mode?: string
}

export interface SendMessageResponse {
  query_id: string
}

// Diff review types
export interface DiffFileInfo {
  path: string
  status: 'modified' | 'added' | 'deleted'
  hunks: DiffHunk[]
}

export interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  content: string
}

export interface HunkAction {
  line_start: number
  line_end: number
  action: 'accept' | 'reject'
}

export interface DiffReviewRequest {
  files: DiffFileInfo[]
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
  DIFF_REVIEW_AVAILABLE: 'diff-review-available',
  BACKGROUND_TASK_UPDATE: 'background-task-update',
  BACKGROUND_TASKS_UPDATED: 'background-tasks-updated',
} as const

export interface BackgroundTaskUpdate {
  task_id: string
  status: string
  prompt: string
  output: string
  started_at: number
  completed_at: number | null
}

export interface BackgroundTaskInfo {
  task_id: string
  prompt: string
  status: string
  started_at: number
  completed_at: number | null
  output: string
}

// Approval mode for tool execution - matches Rust ApprovalMode enum
export type ApprovalMode =
  | 'suggest'      // Ask for confirmation on every tool execution (default)
  | 'plan'         // Plan first, ask before execution
  | 'auto'         // Background safety classifier auto-approves low-risk operations
  | 'auto_edit'    // Auto-accept file ops, ask for bash
  | 'full_auto'    // Auto-approve everything except critical
  | 'readonly'     // Only allow read operations
  | 'plan_ro'      // Read-only analysis mode, no tool execution
  | 'bypass_permissions' // Skip all permission checks
  | 'dont_ask'     // Accept everything without prompting
  | 'confirm'      // Alias for suggest (ask each time)

export interface ApprovalModeConfig {
  mode: ApprovalMode
  highRiskTools?: string[]  // Tools that always require confirmation
}
