// Task scheduler hook with mock Tauri API
import { useState, useEffect } from 'react'
import type { ScheduledTask, TaskStatus } from '../components/TaskScheduler'

// Mock Tauri API - replace with actual Tauri invoke calls
const mockTauriAPI = {
  scheduleTask: async (_task: Omit<ScheduledTask, 'id' | 'status'>): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    return `task-${Date.now()}`
  },
  cancelTask: async (_id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 50))
    return true
  },
  listTasks: async (): Promise<ScheduledTask[]> => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return []
  }
}

/**
 * React hook for managing scheduled tasks
 *
 * Provides CRUD operations for background task scheduling
 * with mock Tauri API integration.
 *
 * @example
 * ```tsx
 * const { tasks, scheduleTask, cancelTask } = useTaskScheduler()
 * ```
 */
export function useTaskScheduler() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load tasks on mount
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const loadedTasks = await mockTauriAPI.listTasks()
      setTasks(loadedTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const scheduleTask = async (taskData: Omit<ScheduledTask, 'id' | 'status'>) => {
    setError(null)
    try {
      const id = await mockTauriAPI.scheduleTask(taskData)
      const newTask: ScheduledTask = {
        ...taskData,
        id,
        status: 'scheduled'
      }
      setTasks(prev => [...prev, newTask])
      return newTask
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to schedule task'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  const cancelTask = async (id: string) => {
    setError(null)
    try {
      const success = await mockTauriAPI.cancelTask(id)
      if (success) {
        setTasks(prev => prev.filter(task => task.id !== id))
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to cancel task'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  const updateTaskStatus = (id: string, status: TaskStatus, result?: string, error?: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, status, result, error } : task
    ))
  }

  return {
    tasks,
    loading,
    error,
    scheduleTask,
    cancelTask,
    updateTaskStatus,
    refreshTasks: loadTasks
  }
}
