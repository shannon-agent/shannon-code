import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTaskScheduler } from '../useTaskScheduler'

vi.mock('../../lib/tauri-api', () => ({
  getBackgroundTasks: vi.fn(() => Promise.resolve([
    { task_id: 't-1', prompt: 'Run tests', status: 'running', started_at: Date.now(), completed_at: null, output: '' },
    { task_id: 't-2', prompt: 'Build project', status: 'completed', started_at: Date.now() - 1000, completed_at: Date.now(), output: 'Success' },
  ])),
  startBackgroundTask: vi.fn((prompt: string) => Promise.resolve(`new-${Date.now()}`)),
  cancelBackgroundTask: vi.fn((id: string) => Promise.resolve(true)),
}))

describe('useTaskScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads tasks on mount', async () => {
    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(2)
    })
    expect(result.current.tasks[0].id).toBe('t-1')
    expect(result.current.tasks[1].status).toBe('completed')
  })

  it('maps BackgroundTaskInfo to ScheduledTask', async () => {
    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(2)
    })
    const task = result.current.tasks[0]
    expect(task.id).toBe('t-1')
    expect(task.prompt).toBe('Run tests')
    expect(task.name).toBe('Run tests')
    expect(task.status).toBe('running')
    expect(task.recurrence).toBe('once')
  })

  it('truncates long prompts in name field', async () => {
    const longPrompt = 'a'.repeat(100)
    const { getBackgroundTasks } = await import('../../lib/tauri-api')
    vi.mocked(getBackgroundTasks).mockResolvedValueOnce([
      { task_id: 't-long', prompt: longPrompt, status: 'scheduled', started_at: Date.now(), completed_at: null, output: '' },
    ])

    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(1)
    })
    expect(result.current.tasks[0].name).toBe('a'.repeat(60) + '...')
  })

  it('maps unknown status to scheduled', async () => {
    const { getBackgroundTasks } = await import('../../lib/tauri-api')
    vi.mocked(getBackgroundTasks).mockResolvedValueOnce([
      { task_id: 't-unknown', prompt: 'Test', status: 'pending', started_at: Date.now(), completed_at: null, output: '' },
    ])

    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(1)
    })
    expect(result.current.tasks[0].status).toBe('scheduled')
  })

  it('schedules a new task', async () => {
    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      const task = await result.current.scheduleTask({
        name: 'Test task',
        prompt: 'Do something',
        scheduledTime: new Date(),
        recurrence: 'once',
      })
      expect(task.id).toBeDefined()
      expect(task.status).toBe('scheduled')
    })

    expect(result.current.tasks.length).toBe(3)
  })

  it('cancels a task', async () => {
    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(2)
    })

    await act(async () => {
      await result.current.cancelTask('t-1')
    })

    expect(result.current.tasks.length).toBe(1)
    expect(result.current.tasks[0].id).toBe('t-2')
  })

  it('handles load errors', async () => {
    const { getBackgroundTasks } = await import('../../lib/tauri-api')
    vi.mocked(getBackgroundTasks).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.error).toBe('Network error')
    })
    expect(result.current.tasks.length).toBe(0)
  })

  it('handles schedule errors', async () => {
    const { startBackgroundTask } = await import('../../lib/tauri-api')
    vi.mocked(startBackgroundTask).mockRejectedValueOnce(new Error('Schedule failed'))

    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let thrown = false
    await act(async () => {
      try {
        await result.current.scheduleTask({
          name: 'Fail',
          prompt: 'fail',
          scheduledTime: new Date(),
          recurrence: 'once',
        })
      } catch (e) {
        thrown = true
        expect((e as Error).message).toBe('Schedule failed')
      }
    })
    expect(thrown).toBe(true)
    expect(result.current.error).toBe('Schedule failed')
  })

  it('handles cancel errors', async () => {
    const { cancelBackgroundTask } = await import('../../lib/tauri-api')
    vi.mocked(cancelBackgroundTask).mockRejectedValueOnce(new Error('Cancel failed'))

    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(2)
    })

    await expect(
      act(async () => {
        await result.current.cancelTask('t-1')
      })
    ).rejects.toThrow('Cancel failed')
  })

  it('updates task status locally', async () => {
    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(2)
    })

    act(() => {
      result.current.updateTaskStatus('t-1', 'completed', 'Done')
    })

    expect(result.current.tasks[0].status).toBe('completed')
    expect(result.current.tasks[0].result).toBe('Done')
  })

  it('refreshes tasks', async () => {
    const { result } = renderHook(() => useTaskScheduler())

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(2)
    })

    await act(async () => {
      await result.current.refreshTasks()
    })

    expect(result.current.tasks.length).toBe(2)
  })
})
