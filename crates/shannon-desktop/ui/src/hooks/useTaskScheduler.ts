// Task scheduler hook wired to real Tauri APIs
import { useState, useEffect, useCallback } from 'react'
import { getBackgroundTasks, startBackgroundTask, cancelBackgroundTask } from '../lib/tauri-api'
import type { BackgroundTaskInfo } from '../types/tauri-events'
import type { ScheduledTask, TaskStatus } from '../components/TaskScheduler'

function mapStatus(status: string): TaskStatus {
  if (status === 'completed') return 'completed'
  if (status === 'failed') return 'failed'
  if (status === 'running') return 'running'
  return 'scheduled'
}

function toScheduledTask(info: BackgroundTaskInfo): ScheduledTask {
  return {
    id: info.task_id,
    name: info.prompt.slice(0, 60) + (info.prompt.length > 60 ? '...' : ''),
    prompt: info.prompt,
    scheduledTime: new Date(info.started_at),
    recurrence: 'once' as const,
    status: mapStatus(info.status),
    result: info.output || undefined,
  }
}

export function useTaskScheduler() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const bgTasks = await getBackgroundTasks()
      setTasks(bgTasks.map(toScheduledTask))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const scheduleTask = async (taskData: Omit<ScheduledTask, 'id' | 'status'>) => {
    setError(null)
    try {
      const id = await startBackgroundTask(taskData.prompt)
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
      const success = await cancelBackgroundTask(id)
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
