import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { OPCTaskPage } from '../OPCTaskPage'

describe('OPCTaskPage', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading spinner initially', () => {
    render(<OPCTaskPage />)
    expect(screen.getByText('Loading task details...')).toBeDefined()
  })

  it('shows workflow from agents', async () => {
    render(<OPCTaskPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Researcher').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Engineer').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('QA').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows workflow progress bar', async () => {
    render(<OPCTaskPage />)

    await waitFor(() => {
      expect(screen.getByText('Workflow Progress')).toBeDefined()
    })
  })

  it('shows task description for first in-progress task', async () => {
    render(<OPCTaskPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Fix auth bug').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Token refresh loop').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows execution log from tasks', async () => {
    render(<OPCTaskPage />)

    await waitFor(() => {
      expect(screen.getByText('Execution Log')).toBeDefined()
      expect(screen.getAllByText('Add tests').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Refactor API').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows event count badge', async () => {
    render(<OPCTaskPage />)

    await waitFor(() => {
      expect(screen.getByText('3 Events')).toBeDefined()
    })
  })

  it('shows task info sidebar panel', async () => {
    render(<OPCTaskPage />)

    await waitFor(() => {
      expect(screen.getByText('Task Info')).toBeDefined()
    })
  })

  it('shows metrics sidebar', async () => {
    render(<OPCTaskPage />)

    await waitFor(() => {
      expect(screen.getByText('Metrics')).toBeDefined()
    })
  })

  it('shows agent count in metrics', async () => {
    render(<OPCTaskPage />)

    await waitFor(() => {
      // Metrics panel shows "3" for agents count
      const threes = screen.getAllByText('3')
      expect(threes.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows task status in description', async () => {
    render(<OPCTaskPage />)

    await waitFor(() => {
      // Status badge for in_progress task
      expect(screen.getAllByText('in_progress').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('finds specific task by taskId prop', async () => {
    render(<OPCTaskPage taskId="task-2" />)

    await waitFor(() => {
      // Should find the Add tests task (task-2) as the main content
      expect(screen.getAllByText('Add tests').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Write unit tests').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows "No task selected" when no tasks', async () => {
    const { invoke } = await import('@tauri-apps/api/core')
    vi.mocked(invoke).mockImplementation((cmd: string) => {
      if (cmd === 'list_tasks') return Promise.resolve([])
      if (cmd === 'list_agents') return Promise.resolve([])
      return Promise.reject(new Error(`Unknown: ${cmd}`))
    })

    render(<OPCTaskPage />)

    await waitFor(() => {
      expect(screen.getAllByText('No task selected').length).toBeGreaterThanOrEqual(1)
    })
  })
})
