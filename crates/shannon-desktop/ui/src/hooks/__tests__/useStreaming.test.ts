// Tests for useStreaming hook
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStreaming } from '../useStreaming'
import { sendMessage } from '../../lib/tauri-api'
import { EVENT_NAMES } from '../../types/tauri-events'

// Mock dependencies
vi.mock('../../lib/tauri-api', () => ({
  sendMessage: vi.fn()
}))

vi.mock('../useTauriEvent', () => ({
  useTauriEvent: vi.fn((event, handler) => {
    // Track event handlers for testing
    ;(useStreaming as any).__eventHandlers = (useStreaming as any).__eventHandlers || {}
    ;(useStreaming as any).__eventHandlers[event] = handler
  })
}))

describe('useStreaming', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear any tracked event handlers
    ;(useStreaming as any).__eventHandlers = {}
  })

  it('sends message via sendMessage', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ query_id: 'test-123' })

    const { result } = renderHook(() => useStreaming())

    await act(async () => {
      await result.current.sendMessage('Hello')
    })

    expect(sendMessage).toHaveBeenCalledWith('Hello')
  })

  it('sets isStreaming to true when sending', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ query_id: 'test-456' })

    const { result } = renderHook(() => useStreaming())

    await act(async () => {
      await result.current.sendMessage('Test')
    })

    expect(result.current.isStreaming).toBe(true)
  })

  it('sets isStreaming to false on completion', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ query_id: 'test-789' })

    const { result } = renderHook(() => useStreaming())

    await act(async () => {
      await result.current.sendMessage('Test')
    })

    // Simulate completion event
    const handlers = (useStreaming as any).__eventHandlers || {}
    if (handlers[EVENT_NAMES.QUERY_COMPLETED]) {
      act(() => {
        handlers[EVENT_NAMES.QUERY_COMPLETED]({ query_id: 'test-789' })
      })
    }

    expect(result.current.isStreaming).toBe(false)
  })

  it('sets error message on failure', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ query_id: 'test-error' })

    const { result } = renderHook(() => useStreaming())

    await act(async () => {
      await result.current.sendMessage('Test')
    })

    // Simulate failure event
    const handlers = (useStreaming as any).__eventHandlers || {}
    if (handlers[EVENT_NAMES.QUERY_FAILED]) {
      act(() => {
        handlers[EVENT_NAMES.QUERY_FAILED]({
          query_id: 'test-error',
          error: 'Network error'
        })
      })
    }

    expect(result.current.error).toBe('Network error')
    expect(result.current.isStreaming).toBe(false)
  })

  it('prevents sending while streaming', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ query_id: 'test-block' })

    const { result } = renderHook(() => useStreaming())

    await act(async () => {
      await result.current.sendMessage('First')
    })

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await act(async () => {
      await result.current.sendMessage('Second')
    })

    expect(consoleWarn).toHaveBeenCalledWith(
      'Cannot send message while streaming is in progress'
    )
    expect(sendMessage).toHaveBeenCalledTimes(1)

    consoleWarn.mockRestore()
  })

  it('clears error when clearError is called', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ query_id: 'test-clear' })

    const { result } = renderHook(() => useStreaming())

    // Set an error
    const handlers = (useStreaming as any).__eventHandlers || {}
    if (handlers[EVENT_NAMES.QUERY_FAILED]) {
      act(() => {
        handlers[EVENT_NAMES.QUERY_FAILED]({
          query_id: 'test-clear',
          error: 'Test error'
        })
      })
    }

    expect(result.current.error).toBe('Test error')

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
  })

  it('accumulates streaming text chunks', async () => {
    vi.mocked(sendMessage).mockResolvedValue({ query_id: 'test-stream' })

    const { result } = renderHook(() => useStreaming())

    await act(async () => {
      await result.current.sendMessage('Stream test')
    })

    // Simulate multiple text chunks
    const handlers = (useStreaming as any).__eventHandlers || {}
    if (handlers[EVENT_NAMES.QUERY_TEXT]) {
      act(() => {
        handlers[EVENT_NAMES.QUERY_TEXT]({ query_id: 'test-stream', content: 'Hello ' })
        handlers[EVENT_NAMES.QUERY_TEXT]({ query_id: 'test-stream', content: 'World' })
      })
    }

    // Check that custom events were dispatched
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shannon:stream-text' })
    )
  })
})
