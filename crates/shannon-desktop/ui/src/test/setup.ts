// Test setup with Tauri API mocks
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'

afterEach(() => {
  cleanup()
  // Reset window.__TAURI__ that some tests set via Object.defineProperty
  // (configurable:false prevents delete, so set to undefined instead)
  if ((window as unknown as Record<string, unknown>).__TAURI__) {
    try {
      (window as unknown as Record<string, unknown>).__TAURI__ = undefined
    } catch {
      // non-writable, ignore
    }
  }
})

// Mock @tauri-apps/api/core invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd: string, _args?: unknown) => {
    // Mock responses for different commands
    switch (cmd) {
      case 'send_message':
        return Promise.resolve({ query_id: 'test-query-123' })
      case 'get_conversation':
        return Promise.resolve([
          {
            role: 'user',
            content: 'Hello',
            timestamp: Date.now()
          },
          {
            role: 'assistant',
            content: 'Hi there!',
            timestamp: Date.now()
          }
        ])
      case 'list_models':
        return Promise.resolve([
          {
            id: 'claude-3-5-sonnet-20241022',
            name: 'Claude 3.5 Sonnet',
            provider: 'anthropic',
            context_window: 200000
          }
        ])
      case 'get_tools':
        return Promise.resolve([
          {
            name: 'bash',
            description: 'Execute bash commands',
            enabled: true
          }
        ])
      case 'get_status':
        return Promise.resolve({
          model: 'claude-3-5-sonnet-20241022',
          provider: 'anthropic',
          querying: false,
          message_count: 2,
          working_dir: '/home/ed/test'
        })
      case 'cancel_query':
        return Promise.resolve()
      case 'configure':
        return Promise.resolve()
      case 'switch_provider':
        return Promise.resolve()
      case 'get_config':
        return Promise.resolve({
          provider: 'anthropic',
          api_key: 'sk-ant-test-key',
          base_url: undefined,
          model: 'claude-3-5-sonnet-20241022'
        })
      case 'list_sessions':
        return Promise.resolve([
          {
            id: 'session-1',
            title: 'Test Conversation',
            created_at: Date.now(),
            message_count: 5
          }
        ])
      case 'load_session':
        return Promise.resolve([
          {
            role: 'user',
            content: 'Test',
            timestamp: Date.now()
          }
        ])
      case 'delete_session':
        return Promise.resolve(true)
      case 'new_session':
        return Promise.resolve('session-new-123')
      case 'list_tasks':
        return Promise.resolve([
          { id: 'task-1', title: 'Fix auth bug', status: 'in_progress', description: 'Token refresh loop', assignee: 'worker-1' },
          { id: 'task-2', title: 'Add tests', status: 'pending', description: 'Write unit tests' },
          { id: 'task-3', title: 'Refactor API', status: 'completed', description: 'Clean up endpoints', assignee: 'worker-2' },
        ])
      case 'list_agents':
        return Promise.resolve([
          { id: 'agent-1', name: 'Researcher', model: 'claude-sonnet-4-6', status: 'running', task: 'Analyzing codebase' },
          { id: 'agent-2', name: 'Engineer', model: 'claude-sonnet-4-6', status: 'completed', task: 'Build feature' },
          { id: 'agent-3', name: 'QA', model: 'claude-haiku-4-5', status: 'pending' },
        ])
      case 'list_skills':
        return Promise.resolve([
          { name: 'commit', description: 'Create git commit', trigger: '/commit', source: 'builtin', category: 'git' },
          { name: 'help', description: 'Show help', trigger: '/help', source: 'builtin', category: 'navigation' },
        ])
      case 'get_skill_detail':
        return Promise.resolve({
          name: 'commit', description: 'Create git commit', trigger: '/commit',
          content: 'Generate a commit...', parameters: [], source: 'builtin', category: 'git',
        })
      case 'get_file_tree':
        return Promise.resolve([
          { name: 'src', type: 'directory', path: '/test/src', children: [
            { name: 'main.rs', type: 'file', path: '/test/src/main.rs' },
          ]},
          { name: 'Cargo.toml', type: 'file', path: '/test/Cargo.toml' },
        ])
      case 'get_working_dir_info':
        return Promise.resolve({ working_dir: '/home/ed/test', branch: 'main', modified_files: [] })
      case 'list_mcp_servers':
        return Promise.resolve([
          { name: 'filesystem', command: 'npx @modelcontextprotocol/server-filesystem', enabled: true, connected: true, toolCount: 5, tools: [] },
        ])
      case 'respond_permission':
        return Promise.resolve()
      default:
        return Promise.reject(new Error(`Unknown command: ${cmd}`))
    }
  })
}))

// Mock @tauri-apps/api/event listen
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((_event: string, _handler: (event: { payload: unknown }) => void) => {
    // Return unlisten function
    return Promise.resolve(() => {
      // Cleanup function
    })
  })
}))

// Mock window.dispatchEvent for custom events
const originalDispatchEvent = window.dispatchEvent
window.dispatchEvent = vi.fn((event: Event) => {
  // Track custom events for testing
  if (event.type.startsWith('shannon:')) {
    return true
  }
  return originalDispatchEvent.call(window, event)
})

// Mock ResizeObserver
;(globalThis as unknown as Record<string, unknown>).ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
;(globalThis as unknown as Record<string, unknown>).IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Suppress console errors in tests unless debugging
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const errorMessage = args[0] as string
    if (errorMessage && errorMessage.includes('Warning:')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
