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
  SessionInfo,
  McpServerInfo,
  McpServerConfig,
  SkillInfo,
  SkillDetail,
  TaskItem,
  BackgroundTaskInfo,
  AgentInfo,
  FileDiff,
  FileNode,
  WorkingDirInfo,
} from '@/types'

// --- Chat ---

export async function sendMessage(message: string, filePaths?: string[]): Promise<SendMessageResponse> {
  return invoke('send_message', { message, filePaths: filePaths ?? null })
}

export async function getConversation(): Promise<ChatMessage[]> {
  return invoke('get_conversation')
}

export async function cancelQuery(): Promise<void> {
  await invoke('cancel_query')
}

// --- Config ---

export async function getConfig(): Promise<DesktopConfig> {
  return invoke('get_config')
}

export async function configure(update: ConfigUpdate): Promise<void> {
  await invoke('configure', { update })
}

export async function switchProvider(req: ProviderSwitchRequest): Promise<void> {
  await invoke('switch_provider', { request: req })
}

// --- Models & Status ---

export async function listModels(): Promise<ModelInfo[]> {
  return invoke('list_models')
}

export async function getStatus(): Promise<StatusResponse> {
  return invoke('get_status')
}

export async function getTools(): Promise<ToolInfo[]> {
  return invoke('list_tools')
}

// --- Sessions ---

export async function newSession(): Promise<string> {
  return invoke('new_session')
}

export async function listSessions(): Promise<SessionInfo[]> {
  return invoke('list_sessions')
}

export async function searchSessions(query: string): Promise<SessionInfo[]> {
  return invoke('search_sessions', { query })
}

export async function loadSession(id: string): Promise<ChatMessage[]> {
  return invoke('load_session', { id })
}

export async function switchSession(id: string): Promise<ChatMessage[]> {
  return invoke('switch_session', { id })
}

export async function deleteSession(id: string): Promise<boolean> {
  return invoke('delete_session', { id })
}

export async function renameSession(id: string, title: string): Promise<boolean> {
  return invoke('rename_session', { id, title })
}

export async function duplicateSession(id: string): Promise<SessionInfo> {
  return invoke('duplicate_session', { id })
}

export async function exportSession(id: string, format: 'markdown' | 'json'): Promise<string> {
  return invoke('export_session', { id, format })
}

// --- Permissions ---

export async function respondPermission(requestId: string, allow: boolean, note?: string): Promise<void> {
  await invoke('respond_permission', { requestId, allow, note: note ?? null })
}

// --- Files & Diffs ---

export async function getFileDiff(path: string): Promise<FileDiff> {
  return invoke('get_file_diff', { path })
}

export async function applyDiff(filePath: string, hunks: HunkAction[]): Promise<void> {
  return invoke('apply_diff', { filePath, hunks })
}

export async function getFileTree(path: string): Promise<FileNode> {
  return invoke('get_file_tree', { path })
}

export async function getWorkingDirInfo(): Promise<WorkingDirInfo> {
  return invoke('get_working_dir_info')
}

// --- MCP Servers ---

export async function listMcpServers(): Promise<McpServerInfo[]> {
  return invoke('list_mcp_servers')
}

export async function addMcpServer(name: string, command: string, args: string[], env: Record<string, string>): Promise<McpServerInfo> {
  return invoke('add_mcp_server', { name, command, args, env })
}

export async function removeMcpServer(name: string): Promise<boolean> {
  return invoke('remove_mcp_server', { name })
}

export async function restartMcpServer(name: string): Promise<McpServerInfo> {
  return invoke('restart_mcp_server', { name })
}

export async function getMcpServerConfig(name: string): Promise<McpServerConfig> {
  return invoke('get_mcp_server_config', { name })
}

// --- Skills ---

export async function listSkills(): Promise<SkillInfo[]> {
  return invoke('list_skills')
}

export async function getSkillDetail(name: string): Promise<SkillDetail> {
  return invoke('get_skill_detail', { name })
}

// --- Background Tasks ---

export async function startBackgroundTask(prompt: string): Promise<string> {
  return invoke('start_background_task', { prompt })
}

export async function getBackgroundTasks(): Promise<BackgroundTaskInfo[]> {
  return invoke('get_background_tasks')
}

export async function cancelBackgroundTask(id: string): Promise<boolean> {
  return invoke('cancel_background_task', { id })
}

// --- Agents & Tasks ---

export async function listAgents(): Promise<AgentInfo[]> {
  return invoke('list_agents')
}

export async function listTasks(): Promise<TaskItem[]> {
  return invoke('list_tasks')
}

// --- Billing ---

export async function getBillingPlan(): Promise<import('@/types').BillingPlan> {
  return invoke('get_billing_plan')
}

export async function getCostHistory(days: number): Promise<import('@/types').CostRecord[]> {
  return invoke('get_cost_history', { days })
}

export async function getBillingHistory(): Promise<import('@/types').BillingHistory[]> {
  return invoke('get_billing_history')
}

// --- File Context ---

export async function getFileContext(): Promise<import('@/types').FileContext[]> {
  return invoke('get_file_context')
}

// --- Task Detail ---

export async function getTaskDetail(id: string): Promise<TaskItem> {
  return invoke('get_task_detail', { id })
}
