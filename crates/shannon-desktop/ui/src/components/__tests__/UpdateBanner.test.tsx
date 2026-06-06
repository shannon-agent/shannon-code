import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UpdateBanner } from '../UpdateBanner'

// Mock @tauri-apps/api/event
const listeners = new Map<string, Set<(event: { payload: unknown }) => void>>()

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((event: string, handler: (event: { payload: unknown }) => void) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set())
    }
    listeners.get(event)!.add(handler)
    return Promise.resolve(() => {
      listeners.get(event)?.delete(handler)
    })
  }),
}))

// Mock window.__TAURI__
const mockEmit = vi.fn()
Object.defineProperty(window, '__TAURI__', {
  value: { emit: mockEmit },
  writable: true,
})

function emitEvent(event: string, payload: unknown) {
  listeners.get(event)?.forEach(handler => handler({ payload }))
}

describe('UpdateBanner', () => {
  beforeEach(() => {
    listeners.clear()
    mockEmit.mockClear()
    // Restore window.__TAURI__ (global afterEach may clear it)
    Object.defineProperty(window, '__TAURI__', {
      value: { emit: mockEmit },
      writable: true,
    })
  })

  it('renders nothing when no update is available', () => {
    const { container } = render(<UpdateBanner />)
    expect(container.innerHTML).toBe('')
  })

  it('has correct component structure', () => {
    const { container } = render(<UpdateBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('does not crash without Tauri context', () => {
    expect(() => render(<UpdateBanner />)).not.toThrow()
  })

  it('shows banner when update-available event fires', async () => {
    render(<UpdateBanner />)

    await waitFor(() => {
      expect(listeners.has('update-available')).toBe(true)
    })

    emitEvent('update-available', {
      version: '0.5.0',
      date: '2026-06-07',
      body: 'Bug fixes and improvements',
    })

    await waitFor(() => {
      expect(screen.getByText('v0.5.0')).toBeInTheDocument()
    })
    expect(screen.getByText('Update Available')).toBeInTheDocument()
    expect(screen.getByText(/Bug fixes and improvements/)).toBeInTheDocument()
    expect(screen.getByText('2026-06-07')).toBeInTheDocument()
  })

  it('shows download button when update is available', async () => {
    render(<UpdateBanner />)

    await waitFor(() => {
      expect(listeners.has('update-available')).toBe(true)
    })

    emitEvent('update-available', {
      version: '0.5.0',
    })

    await waitFor(() => {
      expect(screen.getByText('Download & Install')).toBeInTheDocument()
    })
  })

  it('emits download-update event on button click', async () => {
    render(<UpdateBanner />)

    await waitFor(() => {
      expect(listeners.has('update-available')).toBe(true)
    })

    emitEvent('update-available', { version: '0.5.0' })

    await waitFor(() => {
      expect(screen.getByText('Download & Install')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Download & Install'))
    expect(mockEmit).toHaveBeenCalledWith('download-update', {})
  })

  it('dismisses banner when close button clicked', async () => {
    const { container } = render(<UpdateBanner />)

    await waitFor(() => {
      expect(listeners.has('update-available')).toBe(true)
    })

    emitEvent('update-available', { version: '0.5.0' })

    await waitFor(() => {
      expect(screen.getByText('Download & Install')).toBeInTheDocument()
    })

    // Click close button (X icon)
    const closeBtn = screen.getByRole('button', { name: '' })
    fireEvent.click(closeBtn)

    await waitFor(() => {
      expect(container.innerHTML).toBe('')
    })
  })

  it('shows progress bar when update-progress event fires', async () => {
    render(<UpdateBanner />)

    await waitFor(() => {
      expect(listeners.has('update-available')).toBe(true)
      expect(listeners.has('update-progress')).toBe(true)
    })

    emitEvent('update-available', { version: '0.5.0' })

    emitEvent('update-progress', { progress: 0.5, status: 'downloading' })

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument()
    })
    expect(screen.getByText('downloading')).toBeInTheDocument()
    expect(screen.getByText('Downloading...')).toBeInTheDocument()
  })

  it('works with null date in update payload', async () => {
    render(<UpdateBanner />)

    await waitFor(() => {
      expect(listeners.has('update-available')).toBe(true)
    })

    emitEvent('update-available', {
      version: '0.5.0',
      date: null,
      body: null,
    })

    await waitFor(() => {
      expect(screen.getByText('v0.5.0')).toBeInTheDocument()
    })
  })
})
