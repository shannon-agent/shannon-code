// Tauri API client with typed wrappers for all Tauri invoke commands
import { invoke } from '@tauri-apps/api/core'
import type {
  ChatMessage,
  StatusResponse,
  ModelInfo,
  ToolInfo,
  ConfigUpdate,
  ProviderSwitchRequest,
  DesktopConfig,
  SendMessageResponse,
  HunkAction,
  SessionInfo
} from '../types/tauri-events'

/**
 * Send a message to the query engine
 */
export async function sendMessage(message: string, filePaths?: string[]): Promise<SendMessageResponse> {
  return await invoke('send_message', { message, filePaths: filePaths ? filePaths : null })
}

/**
 * Get current conversation messages
 */
export async function getConversation(): Promise<ChatMessage[]> {
  return await invoke('get_conversation')
}

/**
 * List available models for current provider
 */
export async function listModels(): Promise<ModelInfo[]> {
  return await invoke('list_models')
}

/**
 * Get available tools information
 */
export async function getTools(): Promise<ToolInfo[]> {
  return await invoke('list_tools')
}

/**
 * Get current application status
 */
export async function getStatus(): Promise<StatusResponse> {
  return await invoke('get_status')
}

/**
 * Cancel the current running query
 */
export async function cancelQuery(): Promise<void> {
  await invoke('cancel_query')
}

/**
 * Update a single configuration value
 */
export async function configure(update: ConfigUpdate): Promise<void> {
  await invoke('configure', { update })
}

/**
 * Switch to a different provider/model
 */
export async function switchProvider(req: ProviderSwitchRequest): Promise<void> {
  await invoke('switch_provider', { request: req })
}

/**
 * Get current desktop configuration
 */
export async function getConfig(): Promise<DesktopConfig> {
  return await invoke('get_config')
}

/**
 * List all sessions
 */
export async function listSessions(): Promise<SessionInfo[]> {
  return await invoke('list_sessions')
}

/**
 * Search sessions by title substring
 */
export async function searchSessions(query: string): Promise<SessionInfo[]> {
  return await invoke('search_sessions', { query })
}

/**
 * Rename a session
 */
export async function renameSession(id: string, title: string): Promise<boolean> {
  return await invoke('rename_session', { id, title })
}

/**
 * Duplicate a session
 */
export async function duplicateSession(id: string): Promise<SessionInfo> {
  return await invoke('duplicate_session', { id })
}

/**
 * Load a session by ID
 */
export async function loadSession(id: string): Promise<ChatMessage[]> {
  return await invoke('load_session', { id })
}

/**
 * Delete a session by ID
 */
export async function deleteSession(id: string): Promise<boolean> {
  return await invoke('delete_session', { id })
}

/**
 * Respond to a permission request
 */
export async function respondPermission(requestId: string, allow: boolean): Promise<void> {
  await invoke('respond_permission', { requestId, allow })
}

/**
 * Switch to a different session
 */
export async function switchSession(id: string): Promise<ChatMessage[]> {
  return await invoke('switch_session', { id })
}

/**
 * Create a new session
 */
export async function newSession(): Promise<string> {
  return await invoke('new_session')
}

/**
 * Get file diff (old vs new content)
 */
export async function getFileDiff(path: string): Promise<FileDiff> {
  return await invoke('get_file_diff', { path })
}

/**
 * Apply diff with hunk actions
 */
export async function applyDiff(filePath: string, hunks: HunkAction[]): Promise<void> {
  return await invoke('apply_diff', { filePath, hunks })
}

// File diff response type
export interface FileDiff {
  old_content: string
  new_content: string
  file_name: string
  language: string
}

/**
 * Start a new background task
 */
export async function startBackgroundTask(prompt: string): Promise<string> {
  return await invoke('start_background_task', { prompt })
}

/**
 * Get all background tasks
 */
export async function getBackgroundTasks(): Promise<import('../types/tauri-events').BackgroundTaskInfo[]> {
  return await invoke('get_background_tasks')
}

/**
 * Cancel a background task
 */
export async function cancelBackgroundTask(id: string): Promise<boolean> {
  return await invoke('cancel_background_task', { id })
}
