import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { GoalsPage } from '../GoalsPage'

describe('GoalsPage', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading spinner initially', () => {
    render(<GoalsPage />)
    expect(screen.getByText('Loading goals...')).toBeDefined()
  })

  it('shows goals from API after loading', async () => {
    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Fix auth bug').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Add tests').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Refactor API').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows goal progress percentages', async () => {
    render(<GoalsPage />)

    await waitFor(() => {
      // in_progress → 50%, pending → 0%, completed → 100%
      expect(screen.getAllByText('50%').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('0%').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('100%').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows agent call path from API', async () => {
    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText('Agent Call Path')).toBeDefined()
      expect(screen.getAllByText('Researcher').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Engineer').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('QA').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows task tree with status labels', async () => {
    render(<GoalsPage />)

    await waitFor(() => {
      // "In Progress" and "Done" appear in tree nodes
      expect(screen.getAllByText('In Progress').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Done').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows session stats in sidebar', async () => {
    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText('Session Stats')).toBeDefined()
    })
  })

  it('switches active goal on click', async () => {
    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Add tests').length).toBeGreaterThanOrEqual(1)
    })

    // Find the button in the sidebar that contains "Add tests"
    const buttons = screen.getAllByText('Add tests')
    fireEvent.click(buttons[0])

    // Active goal header in main canvas should update
    await waitFor(() => {
      const headings = screen.getAllByText('Add tests')
      expect(headings.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('shows empty state when no tasks returned', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockImplementation((cmd: string) => {
      if (cmd === 'list_tasks') return Promise.resolve([])
      if (cmd === 'list_agents') return Promise.resolve([])
      return Promise.reject(new Error(`Unknown: ${cmd}`))
    })

    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText('No Goals Yet')).toBeDefined()
    })
  })

  it('shows goal progress bars in sidebar', async () => {
    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText('Goal Progress')).toBeDefined()
    })
  })

  it('shows search input in sidebar', async () => {
    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search goals...')).toBeDefined()
    })
  })
})
