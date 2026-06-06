import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
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

// Mock PermissionDialog
vi.mock('../PermissionDialog', () => ({
  PermissionDialog: () => null,
}))

// Mock ModeToggle
vi.mock('../ModeToggle', () => ({
  ModeToggle: () => null,
}))

// Mock ApprovalModeSelector
vi.mock('../ApprovalModeSelector', () => ({
  ApprovalModeSelector: () => null,
}))

// Mock StatusBar
vi.mock('../StatusBar', () => ({
  StatusBar: () => null,
}))

// Mock MessageInput
vi.mock('../MessageInput', () => ({
  MessageInput: (_props: unknown) => null,
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
  viewMode: 'normal' as const,
  setViewMode: vi.fn(),
}

describe('ChatPanel', () => {
  beforeEach(() => {
    mockUseAppState.mockReturnValue(defaultState)
  })

  afterEach(() => cleanup())

  it('renders without crashing', () => {
    render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={false} error={null} clearError={vi.fn()} />
    )
    expect(screen.getByTitle('View mode (Ctrl+O)')).toBeDefined()
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
    expect(screen.getByRole('button', { name: /Dismiss/ })).toBeDefined()
  })

  it('shows loading spinner when loading', () => {
    mockUseAppState.mockReturnValue({ ...defaultState, loading: true })
    const { container } = render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={false} error={null} clearError={vi.fn()} />
    )
    expect(container.querySelector('.animate-spin')).toBeDefined()
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
    fireEvent.click(screen.getByRole('button', { name: /Dismiss/ }))
    expect(clearError).toHaveBeenCalled()
  })

  it('renders view mode toggle button', () => {
    render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={false} error={null} clearError={vi.fn()} />
    )
    expect(screen.getByTitle('View mode (Ctrl+O)')).toBeDefined()
  })

  it('calls setViewMode when view mode toggle clicked', () => {
    const setViewMode = vi.fn()
    mockUseAppState.mockReturnValue({ ...defaultState, setViewMode })
    render(
      <ChatPanel sendMessage={vi.fn()} isStreaming={false} error={null} clearError={vi.fn()} />
    )
    fireEvent.click(screen.getByTitle('View mode (Ctrl+O)'))
    expect(setViewMode).toHaveBeenCalled()
  })
})
