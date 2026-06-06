// Test setup with Tauri API mocks
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock @tauri-apps/api/core invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd: string, args?: unknown) => {
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
      default:
        return Promise.reject(new Error(`Unknown command: ${cmd}`))
    }
  })
}))

// Mock @tauri-apps/api/event listen
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((event: string, handler: (event: { payload: unknown }) => void) => {
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
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
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
