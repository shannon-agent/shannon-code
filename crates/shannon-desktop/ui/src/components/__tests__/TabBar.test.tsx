// Tests for TabBar component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TabBar } from '../TabBar'
import type { SessionInfo } from '../../types/tauri-events'

const mockSessions: SessionInfo[] = [
  { id: 'session-1', title: 'Test Session One', created_at: Date.now(), message_count: 5 },
  { id: 'session-2', title: 'Test Session Two', created_at: Date.now(), message_count: 3 },
  { id: 'session-3', title: 'Another Session', created_at: Date.now(), message_count: 1 }
]

describe('TabBar', () => {
  it('renders all session tabs', () => {
    render(
      <TabBar
        sessions={mockSessions}
        activeSessionId="session-1"
        onSessionSelect={vi.fn()}
        onSessionClose={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    expect(screen.getByText('Test Session One')).toBeDefined()
    expect(screen.getByText('Test Session Two')).toBeDefined()
    expect(screen.getByText('Another Session')).toBeDefined()
  })

  it('highlights active session tab', () => {
    render(
      <TabBar
        sessions={mockSessions}
        activeSessionId="session-1"
        onSessionSelect={vi.fn()}
        onSessionClose={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    const activeTab = screen.getByText('Test Session One').closest('[data-state="active"]')
    expect(activeTab).toBeDefined()
  })

  it('renders all tabs as tab triggers with correct content', () => {
    const handleSelect = vi.fn()
    render(
      <TabBar
        sessions={mockSessions}
        activeSessionId="session-1"
        onSessionSelect={handleSelect}
        onSessionClose={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    // All sessions render as tab triggers
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBe(3)
    // Active tab has data-state="active"
    expect(tabs[0]).toHaveAttribute('data-state', 'active')
    // Other tabs have data-state="inactive"
    expect(tabs[1]).toHaveAttribute('data-state', 'inactive')
  })

  it('closes tab when X button clicked', () => {
    const handleClose = vi.fn()
    render(
      <TabBar
        sessions={mockSessions}
        activeSessionId="session-1"
        onSessionSelect={vi.fn()}
        onSessionClose={handleClose}
        onNewSession={vi.fn()}
      />
    )

    const closeButtons = screen.getAllByRole('button').filter(btn => btn.getAttribute('aria-label')?.includes('Close'))
    fireEvent.click(closeButtons[0])
    expect(handleClose).toHaveBeenCalledWith('session-1')
  })

  it('creates new tab when + button clicked', () => {
    const handleNew = vi.fn()
    render(
      <TabBar
        sessions={mockSessions}
        activeSessionId="session-1"
        onSessionSelect={vi.fn()}
        onSessionClose={vi.fn()}
        onNewSession={handleNew}
      />
    )

    const newTabButton = screen.getByRole('button', { name: /new session/i })
    fireEvent.click(newTabButton)
    expect(handleNew).toHaveBeenCalled()
  })

  it('enforces maximum 10 tabs limit', () => {
    const tenSessions: SessionInfo[] = Array.from({ length: 10 }, (_, i) => ({
      id: `session-${i}`,
      title: `Session ${i}`,
      created_at: Date.now(),
      message_count: 0
    }))

    render(
      <TabBar
        sessions={tenSessions}
        activeSessionId="session-0"
        onSessionSelect={vi.fn()}
        onSessionClose={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    const newTabButton = screen.getByRole('button', { name: /new session/i })
    expect(newTabButton).toBeDisabled()
  })

  it('truncates long session titles to 20 characters', () => {
    const longSessions: SessionInfo[] = [{
      id: 'session-1',
      title: 'This is a very long session title that should be truncated',
      created_at: Date.now(),
      message_count: 0
    }]

    render(
      <TabBar
        sessions={longSessions}
        activeSessionId="session-1"
        onSessionSelect={vi.fn()}
        onSessionClose={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    expect(screen.getByText('This is a very long ...')).toBeDefined()
  })

  it('displays tab counter', () => {
    render(
      <TabBar
        sessions={mockSessions}
        activeSessionId="session-1"
        onSessionSelect={vi.fn()}
        onSessionClose={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    expect(screen.getByText('3/10')).toBeDefined()
  })

  it('applies theme-based styling', () => {
    render(
      <TabBar
        sessions={mockSessions}
        activeSessionId="session-1"
        onSessionSelect={vi.fn()}
        onSessionClose={vi.fn()}
        onNewSession={vi.fn()}
      />
    )

    // Component uses shadcn Tabs with bg-secondary styling
    const tabsList = screen.getByRole('tablist')
    expect(tabsList).toBeDefined()
    expect(tabsList.className).toContain('bg-secondary')
  })
})
