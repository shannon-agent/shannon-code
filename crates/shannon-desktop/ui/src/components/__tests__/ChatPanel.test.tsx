import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatPanel } from '../ChatPanel'

// Mock useAppState
const mockUseAppState = vi.fn()
vi.mock('../../context/AppState', () => ({
  useAppState: () => mockUseAppState(),
}))

// Mock tauri event listener
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}))

// Mock tauri-api
vi.mock('../../lib/tauri-api', () => ({
  applyDiff: vi.fn(() => Promise.resolve()),
}))

const defaultState = {
  messages: [],
  querying: false,
  model: 'claude-3-sonnet',
  provider: 'anthropic',
  config: null,
  loading: false,
  streamingText: '',
  thinkingText: '',
  activeToolCalls: [],
  usage: null,
  permissionRequest: null,
  mode: 'code' as const,
  setMode: vi.fn(),
  respondPermission: vi.fn(),
  approvalMode: 'normal' as const,
  setApprovalMode: vi.fn(),
}

describe('ChatPanel', () => {
  beforeEach(() => {
    mockUseAppState.mockReturnValue(defaultState)
  })

  it('renders welcome message when no messages', () => {
    render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={false} error={null} clearError={vi.fn()} />
    )
    expect(screen.getByText('Shannon Code')).toBeDefined()
    expect(screen.getByText('Your AI coding assistant')).toBeDefined()
  })

  it('renders messages from state', () => {
    mockUseAppState.mockReturnValue({
      ...defaultState,
      messages: [
        { role: 'user', content: 'Hello', timestamp: Date.now() },
        { role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
      ],
    })
    render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={false} error={null} clearError={vi.fn()} />
    )
    expect(screen.getByText('Hello')).toBeDefined()
    expect(screen.getByText('Hi there!')).toBeDefined()
  })

  it('shows error banner when error is set', () => {
    render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={false} error="Something went wrong" clearError={vi.fn()} />
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })

  it('shows loading spinner when loading', () => {
    mockUseAppState.mockReturnValue({ ...defaultState, loading: true })
    const { container } = render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={false} error={null} clearError={vi.fn()} />
    )
    expect(container.querySelector('.animate-spin')).toBeDefined()
    expect(screen.getByText('Loading Shannon Desktop...')).toBeDefined()
  })

  it('shows streaming text as message', () => {
    mockUseAppState.mockReturnValue({ ...defaultState, streamingText: 'Thinking...' })
    render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={true} error={null} clearError={vi.fn()} />
    )
    expect(screen.getByText('Thinking...')).toBeDefined()
  })

  it('calls clearError when dismiss clicked', () => {
    const clearError = vi.fn()
    render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={false} error="Error" clearError={clearError} />
    )
    fireEvent.click(screen.getByText('Dismiss'))
    expect(clearError).toHaveBeenCalled()
  })
})
