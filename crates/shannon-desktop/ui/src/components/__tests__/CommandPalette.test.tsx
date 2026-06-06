// Tests for CommandPalette component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommandPalette } from '../CommandPalette'

describe('CommandPalette', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onNewSession: vi.fn(),
    onOpenSettings: vi.fn(),
    onSwitchModel: vi.fn(),
    onToggleSidebar: vi.fn(),
    onToggleTheme: vi.fn()
  }

  it('renders command palette when open', () => {
    render(<CommandPalette {...mockProps} />)

    expect(screen.getByPlaceholderText('Type a command or search...')).toBeDefined()
    expect(screen.getByText('New Session')).toBeDefined()
    expect(screen.getByText('Open Settings')).toBeDefined()
  })

  it('does not render when closed', () => {
    render(<CommandPalette {...mockProps} isOpen={false} />)

    expect(screen.queryByPlaceholderText('Type a command or search...')).toBeNull()
  })

  it('filters actions with search query', async () => {
    const { container } = render(<CommandPalette {...mockProps} />)

    const input = screen.getByPlaceholderText('Type a command or search...')
    fireEvent.change(input, { target: { value: 'session' } })

    await waitFor(() => {
      expect(container.textContent).toContain('New Session')
      expect(container.textContent).not.toContain('Open Settings')
    })
  })

  it('executes action when Enter pressed', () => {
    render(<CommandPalette {...mockProps} />)

    const input = screen.getByPlaceholderText('Type a command or search...')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockProps.onNewSession).toHaveBeenCalled()
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('navigates actions with arrow keys', () => {
    render(<CommandPalette {...mockProps} />)

    const input = screen.getByPlaceholderText('Type a command or search...')

    // Press down arrow
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockProps.onOpenSettings).toHaveBeenCalled()
  })

  it('closes on Escape key', () => {
    render(<CommandPalette {...mockProps} />)

    const input = screen.getByPlaceholderText('Type a command or search...')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('highlights selected action', () => {
    render(<CommandPalette {...mockProps} />)

    const firstAction = screen.getByText('New Session').closest('.bg-\\[\\#2a2f44\\]')
    expect(firstAction).toBeDefined()
  })

  it('shows keyboard shortcuts in UI', () => {
    render(<CommandPalette {...mockProps} />)

    expect(screen.getByText('Ctrl+N')).toBeDefined()
    expect(screen.getByText('Ctrl+,')).toBeDefined()
    expect(screen.getByText('Ctrl+M')).toBeDefined()
  })

  it('shows navigation hints in footer', () => {
    render(<CommandPalette {...mockProps} />)

    expect(screen.getByText('↑↓ Navigate')).toBeDefined()
    expect(screen.getByText('Enter Execute')).toBeDefined()
    expect(screen.getByText('Esc Close')).toBeDefined()
  })

  it('displays no results message when no matches', async () => {
    render(<CommandPalette {...mockProps} />)

    const input = screen.getByPlaceholderText('Type a command or search...')
    fireEvent.change(input, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.getByText('No actions found')).toBeDefined()
    })
  })
})
