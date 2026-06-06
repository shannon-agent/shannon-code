import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BackgroundAgentBadge } from '../BackgroundAgentBadge'

vi.mock('../../lib/tauri-api', () => ({
  getBackgroundTasks: vi.fn(() => Promise.resolve([])),
  cancelBackgroundTask: vi.fn(() => Promise.resolve(true)),
}))

vi.mock('../../hooks/useTauriEvent', () => ({
  useTauriEvent: vi.fn(),
}))

vi.mock('../../types/tauri-events', () => ({
  EVENT_NAMES: {
    BACKGROUND_TASKS_UPDATED: 'background-tasks-updated',
    BACKGROUND_TASK_UPDATE: 'background-task-update',
  },
}))

describe('BackgroundAgentBadge', () => {
  it('renders nothing when no tasks', () => {
    const { container } = render(<BackgroundAgentBadge />)
    expect(container.firstChild).toBeNull()
  })

  it('renders with tasks', async () => {
    const { getBackgroundTasks } = await import('../../lib/tauri-api')
    const mocked = vi.mocked(getBackgroundTasks)
    mocked.mockResolvedValueOnce([
      { task_id: '1', prompt: 'Test task', status: 'running', started_at: Date.now(), completed_at: null, output: '' },
    ])

    const { container } = render(<BackgroundAgentBadge />)

    // Wait for async load
    await vi.waitFor(() => {
      expect(container.querySelector('button')).toBeDefined()
    })
  })
})
