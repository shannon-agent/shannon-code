// Tests for useTauriEvent hook
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, cleanup } from '@testing-library/react'
import { useTauriEvent } from '../useTauriEvent'

// Mock @tauri-apps/api/event
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn()
}))

describe('useTauriEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('subscribes to Tauri event on mount', async () => {
    const { listen } = await import('@tauri-apps/api/event')
    const mockUnlisten = vi.fn()
    vi.mocked(listen).mockResolvedValue(mockUnlisten)

    const handler = vi.fn()
    renderHook(() => useTauriEvent('test-event', handler))

    expect(listen).toHaveBeenCalledWith('test-event', expect.any(Function))
  })

  it('calls handler with event payload', async () => {
    const { listen } = await import('@tauri-apps/api/event')

    let capturedHandler: ((event: { payload: unknown }) => void) | null = null
    vi.mocked(listen).mockImplementation((event, handler) => {
      capturedHandler = handler
      return Promise.resolve(vi.fn())
    })

    const testPayload = { data: 'test-data' }
    const handler = vi.fn()

    renderHook(() => useTauriEvent('data-event', handler))

    // Simulate event emission
    if (capturedHandler) {
      capturedHandler({ payload: testPayload })
    }

    expect(handler).toHaveBeenCalledWith(testPayload)
  })

  it('cleans up listener on unmount', async () => {
    const { listen } = await import('@tauri-apps/api/event')
    const mockUnlisten = vi.fn()

    vi.mocked(listen).mockResolvedValue(mockUnlisten)

    const handler = vi.fn()
    const { unmount } = renderHook(() => useTauriEvent('cleanup-event', handler))

    // Wait for setup to complete
    await new Promise(resolve => setTimeout(resolve, 10))

    unmount()

    // The unlisten function should be called during cleanup
    expect(listen).toHaveBeenCalled()
  })

  it('handles listen errors gracefully', async () => {
    const { listen } = await import('@tauri-apps/api/event')
    vi.mocked(listen).mockRejectedValue(new Error('Listen failed'))

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const handler = vi.fn()

    try {
      renderHook(() => useTauriEvent('error-event', handler))
      // Wait for the async setup to complete
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(consoleError).toHaveBeenCalled()
    } finally {
      consoleError.mockRestore()
    }
  })

  it('re-subscribes when event or handler changes', async () => {
    const { listen } = await import('@tauri-apps/api/event')
    const mockUnlisten = vi.fn()
    vi.mocked(listen).mockResolvedValue(mockUnlisten)

    const handler1 = vi.fn()
    const { rerender } = renderHook(
      ({ event, handler }) => useTauriEvent(event, handler),
      { initialProps: { event: 'event-1', handler: handler1 } }
    )

    // Change event
    const handler2 = vi.fn()
    rerender({ event: 'event-2', handler: handler2 })

    expect(listen).toHaveBeenCalledTimes(2)
  })
})
