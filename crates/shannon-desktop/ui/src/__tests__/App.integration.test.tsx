// Integration test for App component
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AppStateProvider, useAppState } from '../context/AppState'
import { Layout } from '../components/Layout'
import { ChatMessage } from '../components/ChatMessage'
import { MessageInput } from '../components/MessageInput'
import { StatusBar } from '../components/StatusBar'
import { ToastProvider } from '../components/ToastProvider'
import { ThemeProvider } from '../context/ThemeContext'

// Wrapper that matches App.tsx provider order — catches provider ordering bugs
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

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
      case 'list_sessions':
        return Promise.resolve([
          { id: 'sess-1', title: 'Session 1', created_at: Date.now() },
          { id: 'sess-2', title: 'Session 2', created_at: Date.now() }
        ])
      case 'switch_session':
        return Promise.resolve([
          { role: 'user', content: 'Switched', timestamp: Date.now() }
        ])
      case 'new_session':
        return Promise.resolve('sess-new')
      case 'respond_permission':
        return Promise.resolve()
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
      <AllProviders>
        <Layout currentPage="chat" onNavigate={vi.fn()}>
          <div>Test Content</div>
        </Layout>
      </AllProviders>
    )

    await waitFor(() => {
      expect(container.textContent).toBeDefined()
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
      <AllProviders>
        <TestComponent />
      </AllProviders>
    )

    await waitFor(() => {
      expect(getByTestId('model')).toHaveTextContent('claude-3-5-sonnet-20241022')
      expect(getByTestId('provider')).toHaveTextContent('anthropic')
      expect(getByTestId('querying')).toHaveTextContent('false')
    })
  })

  it('integrates ChatMessage with context', async () => {
    const { container } = render(
      <AllProviders>
        <ChatMessage
          message={{
            role: 'user',
            content: 'Test message',
            timestamp: Date.now()
          }}
        />
      </AllProviders>
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

      expect(handleSend).toHaveBeenCalledWith('Test', undefined)
    }
  })

  it('integrates StatusBar with context', async () => {
    const { container } = render(
      <AllProviders>
        <StatusBar />
      </AllProviders>
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
      <AllProviders>
        <LoadingComponent />
      </AllProviders>
    )

    // Initially shows loading
    expect(container.textContent).toContain('Loading...')

    // Eventually shows loaded
    await waitFor(() => {
      expect(container.textContent).toContain('Loaded')
    }, { timeout: 3000 })
  })

  it('integrates Layout with children', async () => {
    const { container } = render(
      <AllProviders>
        <Layout currentPage="chat" onNavigate={vi.fn()}>
          <div>Main Content</div>
        </Layout>
      </AllProviders>
    )

    await waitFor(() => {
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
      <AllProviders>
        <ContextChecker />
      </AllProviders>
    )

    await waitFor(() => {
      expect(container.textContent).toContain('Messages: 2')
    })
  })
})