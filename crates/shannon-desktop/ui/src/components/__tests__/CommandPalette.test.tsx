// Tests for CommandPalette component using cmdk
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommandPalette } from '../CommandPalette'

// jsdom doesn't implement scrollIntoView — needed by cmdk
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

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

  it('executes first action when clicked', () => {
    const onNewSession = vi.fn()
    const onClose = vi.fn()
    render(<CommandPalette {...mockProps} onNewSession={onNewSession} onClose={onClose} />)

    // Click on the first action item directly
    fireEvent.click(screen.getByText('New Session'))
    expect(onNewSession).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on Escape key', () => {
    render(<CommandPalette {...mockProps} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('renders action items with correct labels', () => {
    render(<CommandPalette {...mockProps} />)

    expect(screen.getByText('New Session')).toBeDefined()
    expect(screen.getByText('Open Settings')).toBeDefined()
    expect(screen.getByText('Switch Model')).toBeDefined()
    expect(screen.getByText('Toggle Sidebar')).toBeDefined()
    expect(screen.getByText('Toggle Theme')).toBeDefined()
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
      expect(screen.getByText('No results found')).toBeDefined()
    })
  })
})
