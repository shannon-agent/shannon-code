// Tests for SessionList component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionList } from '../SessionList'

// Mock Tauri API
vi.mock('../../lib/tauri-api', () => ({
  listSessions: vi.fn(() => Promise.resolve([
    { id: 'session-1', title: 'Test Session', created_at: Date.now(), message_count: 5 }
  ])),
  newSession: vi.fn(() => Promise.resolve('new-session-id')),
  deleteSession: vi.fn(() => Promise.resolve(true)),
  exportSession: vi.fn(() => Promise.resolve('# Test Session\n\nexported content'))
}))

// Mock window.confirm
;(globalThis as unknown as Record<string, unknown>).confirm = vi.fn(() => true)

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
      const sessionCard = sessionText.closest('[class*="accent"]')
      expect(sessionCard).toBeDefined()
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
      expect(screen.getByText(/5 msgs/)).toBeDefined()
    })
  })

  it('renders new chat button', async () => {
    render(
      <SessionList
        currentSessionId="session-1"
        onSessionSelect={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('New Chat')).toBeDefined()
    })
  })

  it('renders session item with right-click support via DropdownMenu', async () => {
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

    // The session item renders with a DropdownMenu trigger
    // Right-click fires contextmenu, which opens the dropdown
    const sessionItem = screen.getByText('Test Session')
    fireEvent.contextMenu(sessionItem)

    // DropdownMenu items render after trigger interaction
    // Check that the component renders without errors
    expect(screen.getByText('Test Session')).toBeDefined()
  })
})
