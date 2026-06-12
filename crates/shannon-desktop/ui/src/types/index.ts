// TypeScript types matching Rust structs in shannon-desktop/src/events.rs and commands.rs

// --- Event Payloads ---

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

// --- Core Types ---

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  tool_calls?: ToolCall[]
  thinking?: string
  file_attachments?: FileAttachment[]
}

export interface ToolCall {
  tool_use_id: string
  tool_name: string
  tool_input: unknown
  result?: string
  is_error?: boolean
  progress?: number
  progress_message?: string
  status: 'running' | 'completed' | 'error'
}

export interface FileAttachment {
  name: string
  path: string
  size: number
}

export interface SessionInfo {
  id: string
  title: string
  created_at: number
  message_count: number
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
  provider?: string
  api_key?: string
  base_url?: string
  model?: string
  working_dir?: string
  theme?: string
  mcp_servers?: McpServerConfig[]
  approval_mode?: string
}

export interface SendMessageResponse {
  query_id: string
}

// --- Diff Types ---

export interface FileDiff {
  old_content: string
  new_content: string
  file_name: string
  language: string
}

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

// --- MCP Types ---

export interface McpServerConfig {
  name: string
  command: string
  args: string[]
  env: Record<string, string>
  enabled: boolean
}

export interface McpServerInfo {
  name: string
  command: string
  enabled: boolean
  connected: boolean
  tool_count: number
  tools: ToolInfo[]
  last_connected: string | null
}

// --- Skill Types ---

export interface SkillInfo {
  name: string
  description: string
  trigger: string
  source: string
  category?: string
}

export interface SkillDetail {
  name: string
  description: string
  trigger: string
  content: string
  parameters: string[]
  source: string
  category?: string
}

// --- Task Types ---

export interface TaskItem {
  id: string
  title: string
  status: string
  assignee?: string
  priority?: string
  description?: string
}

export interface BackgroundTaskInfo {
  task_id: string
  prompt: string
  status: string
  started_at: number
  completed_at: number | null
  output: string
}

export interface BackgroundTaskUpdate {
  task_id: string
  status: string
  prompt: string
  output: string
  started_at: number
  completed_at: number | null
}

// --- File Types ---

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  modified?: boolean
  size?: number
}

export interface WorkingDirInfo {
  root: string
  branch: string
  modified_files: string[]
  status: 'clean' | 'dirty' | 'merge-conflict'
}

export interface AgentInfo {
  id: string
  name: string
  model: string
  status: string
  task?: string
  progress?: number
  tools_used?: number
  duration?: number
}

// --- Billing Types ---

export interface BillingPlan {
  name: string
  price: number
  token_limit: number
  features: string[]
}

export interface CostRecord {
  date: string
  input_tokens: number
  output_tokens: number
  cost_usd: number
}

export interface BillingHistory {
  id: string
  date: string
  description: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
}

// --- Context Types ---

export interface FileContext {
  path: string
  name: string
  language: string
  lines: number
  relevant_lines?: { start: number; end: number }[]
}

// --- Enums ---

export type ViewMode = 'verbose' | 'normal' | 'summary'

export type ApprovalMode =
  | 'suggest'
  | 'plan'
  | 'auto'
  | 'auto_edit'
  | 'full_auto'
  | 'readonly'
  | 'plan_ro'
  | 'bypass_permissions'
  | 'dont_ask'
  | 'confirm'

// --- Event Names ---

export const EVENT_NAMES = {
  QUERY_TEXT: 'query:text',
  QUERY_TOOL_START: 'query:tool-start',
  QUERY_TOOL_RESULT: 'query:tool-result',
  QUERY_TOOL_PROGRESS: 'query:tool-progress',
  QUERY_THINKING: 'query:thinking',
  QUERY_USAGE: 'query:usage',
  QUERY_COMPLETED: 'query:completed',
  QUERY_FAILED: 'query:failed',
  QUERY_CANCELLED: 'query:cancelled',
  PERMISSION_REQUEST: 'permission-request',
  SESSIONS_UPDATED: 'sessions-updated',
  SESSION_LOADED: 'session-loaded',
  CONFIG_UPDATED: 'config-updated',
  DIFF_REVIEW_AVAILABLE: 'diff-review-available',
  BACKGROUND_TASK_UPDATE: 'background-task-update',
  BACKGROUND_TASKS_UPDATED: 'background-tasks-updated',
} as const

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES]
