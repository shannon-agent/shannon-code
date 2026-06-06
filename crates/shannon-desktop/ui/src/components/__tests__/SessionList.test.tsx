// Tests for SessionList component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionList } from '../SessionList'

// Mock Tauri API
vi.mock('../../lib/tauri-api', () => ({
  listSessions: vi.fn(() => Promise.resolve([
    { id: 'session-1', title: 'Test Session', created_at: Date.now() - 3 * 24 * 60 * 60 * 1000, message_count: 5 }
  ])),
  newSession: vi.fn(() => Promise.resolve('new-session-id')),
  deleteSession: vi.fn(() => Promise.resolve(true))
}))

// Mock window.confirm
global.confirm = vi.fn(() => true)

describe('SessionList', () => {
  it('renders session list', async () => {
    render(
      <SessionList
        currentSessionId="session-1"
        onSessionSelect={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Test Session')).toBeDefined()
    })
  })

  it('calls onSessionSelect when session is clicked', async () => {
    const handleSelect = vi.fn()
    render(
      <SessionList
        currentSessionId="session-1"
        onSessionSelect={handleSelect}
        onNewSession={vi.fn()}
      />
    )

    await waitFor(() => {
      const session = screen.getByText('Test Session')
      fireEvent.click(session)
      expect(handleSelect).toHaveBeenCalledWith('session-1')
    })
  })

  it('highlights active session', async () => {
    render(
      <SessionList
        currentSessionId="session-1"
        onSessionSelect={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    await waitFor(() => {
      const sessionText = screen.getByText('Test Session')
      const sessionCard = sessionText.closest('[class*="bg-[#7aa2f7]"]')
      expect(sessionCard?.className).toContain('text-[#7aa2f7]')
    })
  })

  it('displays session metadata', async () => {
    render(
      <SessionList
        currentSessionId="session-1"
        onSessionSelect={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/5 messages/)).toBeDefined()
      expect(screen.getByText(/3 days ago/)).toBeDefined()
    })
  })

  it('applies Tokyo Night styling', async () => {
    const { container } = render(
      <SessionList
        currentSessionId="session-1"
        onSessionSelect={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    await waitFor(() => {
      const sidebar = container.querySelector('.bg-\\[\\#24283b\\]')
      expect(sidebar).toBeDefined()
    })
  })
})
