import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { OPCPage } from '../OPCPage'

describe('OPCPage', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading spinner initially', () => {
    render(<OPCPage />)
    expect(screen.getByText('Loading project data...')).toBeDefined()
  })

  it('shows agent swarm from API', async () => {
    render(<OPCPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Researcher').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Engineer').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('QA').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows agent model info', async () => {
    render(<OPCPage />)

    await waitFor(() => {
      expect(screen.getAllByText('claude-sonnet-4-6').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows kanban board with tasks', async () => {
    render(<OPCPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Fix auth bug').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Add tests').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Refactor API').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows kanban column headers', async () => {
    render(<OPCPage />)

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeDefined()
      expect(screen.getAllByText('In Progress').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Done').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows task status badges in cards', async () => {
    render(<OPCPage />)

    await waitFor(() => {
      // "Active" for in_progress task card, "Pending" for pending
      expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows agent and task count in header', async () => {
    render(<OPCPage />)

    await waitFor(() => {
      // Header shows "3 agents · 3 tasks"
      const headerText = screen.getByText(/3 agents/)
      expect(headerText).toBeDefined()
    })
  })

  it('shows running agent count in overview', async () => {
    render(<OPCPage />)

    await waitFor(() => {
      expect(screen.getByText('1 agent currently active')).toBeDefined()
    })
  })

  it('calls onNavigate when kanban task is clicked', async () => {
    const onNavigate = vi.fn()
    render(<OPCPage onNavigate={onNavigate} />)

    await waitFor(() => {
      expect(screen.getAllByText('Fix auth bug').length).toBeGreaterThanOrEqual(1)
    })

    fireEvent.click(screen.getAllByText('Fix auth bug')[0])
    expect(onNavigate).toHaveBeenCalledWith('opc-task')
  })

  it('shows agent task assignments', async () => {
    render(<OPCPage />)

    await waitFor(() => {
      expect(screen.getByText('Analyzing codebase')).toBeDefined()
      expect(screen.getByText('Build feature')).toBeDefined()
    })
  })

  it('shows empty state when no tasks', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockImplementation((cmd: string) => {
      if (cmd === 'list_tasks') return Promise.resolve([])
      if (cmd === 'list_agents') return Promise.resolve([])
      return Promise.reject(new Error(`Unknown: ${cmd}`))
    })

    render(<OPCPage />)

    await waitFor(() => {
      expect(screen.getByText('No agents currently running')).toBeDefined()
    })
  })
})
