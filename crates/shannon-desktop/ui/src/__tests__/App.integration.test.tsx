// Integration test for App component
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AppStateProvider } from '../context/AppState'
import { Layout } from '../components/Layout'
import { ChatMessage } from '../components/ChatMessage'
import { MessageInput } from '../components/MessageInput'
import { StatusBar } from '../components/StatusBar'

// Mock all Tauri APIs
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((cmd: string) => {
    switch (cmd) {
      case 'get_config':
        return Promise.resolve({
          provider: 'anthropic',
          api_key: 'sk-test',
          model: 'claude-3-5-sonnet-20241022'
        })
      case 'get_status':
        return Promise.resolve({
          model: 'claude-3-5-sonnet-20241022',
          provider: 'anthropic',
          querying: false,
          message_count: 2,
          working_dir: '/test'
        })
      case 'get_conversation':
        return Promise.resolve([
          { role: 'user', content: 'Hello', timestamp: Date.now() },
          { role: 'assistant', content: 'Hi!', timestamp: Date.now() }
        ])
      default:
        return Promise.resolve({})
    }
  })
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(vi.fn()))
}))

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders app without crashing', async () => {
    const { container } = render(
      <AppStateProvider>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </AppStateProvider>
    )

    await waitFor(() => {
      expect(container.querySelector('.bg-\\[\\#1a1b26\\]')).toBeDefined()
    })
  })

  it('provides context to children', async () => {
    function TestComponent() {
      const { model, provider, querying } = useAppState()
      return (
        <div>
          <span data-testid="model">{model}</span>
          <span data-testid="provider">{provider}</span>
          <span data-testid="querying">{querying.toString()}</span>
        </div>
      )
    }

    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    )

    await waitFor(() => {
      expect(getByTestId('model')).toHaveTextContent('claude-3-5-sonnet-20241022')
      expect(getByTestId('provider')).toHaveTextContent('anthropic')
      expect(getByTestId('querying')).toHaveTextContent('false')
    })
  })

  it('integrates ChatMessage with context', async () => {
    const { container } = render(
      <AppStateProvider>
        <ChatMessage
          message={{
            role: 'user',
            content: 'Test message',
            timestamp: Date.now()
          }}
        />
      </AppStateProvider>
    )

    await waitFor(() => {
      expect(container.textContent).toContain('Test message')
    })
  })

  it('integrates MessageInput with handlers', async () => {
    const handleSend = vi.fn()
    const { container } = render(
      <MessageInput onSend={handleSend} disabled={false} />
    )

    const input = container.querySelector('textarea')
    expect(input).toBeDefined()

    if (input) {
      fireEvent.change(input, { target: { value: 'Test' } })
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

      expect(handleSend).toHaveBeenCalledWith('Test')
    }
  })

  it('integrates StatusBar with context', async () => {
    const { container } = render(
      <AppStateProvider>
        <StatusBar />
      </AppStateProvider>
    )

    await waitFor(() => {
      expect(container.textContent).toContain('claude-3-5-sonnet-20241022')
      expect(container.textContent).toContain('anthropic')
    })
  })

  it('handles loading state', async () => {
    function LoadingComponent() {
      const { loading } = useAppState()
      return <div>{loading ? 'Loading...' : 'Loaded'}</div>
    }

    const { container } = render(
      <AppStateProvider>
        <LoadingComponent />
      </AppStateProvider>
    )

    // Initially shows loading
    expect(container.textContent).toContain('Loading...')

    // Eventually shows loaded
    await waitFor(() => {
      expect(container.textContent).toContain('Loaded')
    }, { timeout: 3000 })
  })

  it('integrates Layout with sidebar and panel', async () => {
    const { container } = render(
      <AppStateProvider>
        <Layout
          sidebar={<div>Sidebar</div>}
          panel={<div>Panel</div>}
        >
          <div>Main Content</div>
        </Layout>
      </AppStateProvider>
    )

    await waitFor(() => {
      expect(container.textContent).toContain('Sidebar')
      expect(container.textContent).toContain('Panel')
      expect(container.textContent).toContain('Main Content')
    })
  })

  it('passes through all context values', async () => {
    function ContextChecker() {
      const context = useAppState()
      return (
        <div>
          <span data-messages={context.messages.length.toString()}>
            Messages: {context.messages.length}
          </span>
        </div>
      )
    }

    const { container } = render(
      <AppStateProvider>
        <ContextChecker />
      </AppStateProvider>
    )

    await waitFor(() => {
      expect(container.textContent).toContain('Messages: 2')
    })
  })
})

// Import useAppState for the test
import { useAppState } from '../context/AppState'
