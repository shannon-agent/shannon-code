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
  SendMessageResponse
} from '../types/tauri-events'

/**
 * Send a message to the query engine
 */
export async function sendMessage(message: string): Promise<SendMessageResponse> {
  return await invoke('send_message', { message })
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

// Import SessionInfo from types
import type { SessionInfo } from '../types/tauri-events'
