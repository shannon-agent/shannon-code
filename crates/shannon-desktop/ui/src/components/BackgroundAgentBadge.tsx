// Floating badge for background tasks
import { useState, useEffect, useCallback } from 'react'
import { Brain, X, Loader2 } from 'lucide-react'
import { listen } from '@tauri-apps/api/event'
import { getBackgroundTasks, cancelBackgroundTask } from '../lib/tauri-api'
import { useTauriEvent } from '../hooks/useTauriEvent'
import type { BackgroundTaskInfo } from '../types/tauri-events'
import { EVENT_NAMES } from '../types/tauri-events'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

export function BackgroundAgentBadge() {
  const [tasks, setTasks] = useState<BackgroundTaskInfo[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const loadTasks = useCallback(() => {
    getBackgroundTasks().then(setTasks).catch(console.error)
  }, [])

  useEffect(() => {
    // Load initial tasks
    loadTasks()
  }, [loadTasks])

  // Listen for task updates
  useTauriEvent(EVENT_NAMES.BACKGROUND_TASKS_UPDATED, loadTasks)
  useTauriEvent(EVENT_NAMES.BACKGROUND_TASK_UPDATE, (update) => {
    // Update single task in the list
    setTasks(prev => prev.map(task => 
      task.task_id === update.task_id 
        ? { 
            ...task, 
            status: update.status,
            output: update.output,
            completed_at: update.completed_at 
          }
        : task
    ))
  })

  const handleCancelTask = async (taskId: string) => {
    setCancelling(taskId)
    try {
      const success = await cancelBackgroundTask(taskId)
      if (success) {
        loadTasks()
      }
    } catch (error) {
      console.error('Failed to cancel task:', error)
    } finally {
      setCancelling(null)
    }
  }

  const runningTasks = tasks.filter(t => t.status === 'running')
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'failed')
  const hasTasks = tasks.length > 0

  if (!hasTasks) return null

  const getTaskStatus = (task: BackgroundTaskInfo) => {
    switch (task.status) {
      case 'running': return 'warning'
      case 'completed': return 'success'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all',
          runningTasks.length > 0
            ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 animate-pulse'
            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
        )}
        title={`${tasks.length} background task${tasks.length > 1 ? 's' : ''}`}
      >
        <Brain className="w-4 h-4" />
        <span className="text-sm font-medium">{tasks.length}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[var(--bg-primary)] rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Background Tasks ({tasks.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  No background tasks
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="p-4 border-b border-[var(--border)] last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-[var(--text-primary)] line-clamp-2">
                          {task.prompt}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Started {new Date(task.started_at).toLocaleTimeString()}
                          {task.completed_at && ` • Completed ${new Date(task.completed_at).toLocaleTimeString()}`}
                        </p>
                      </div>
                      <Badge variant={getTaskStatus(task)} className="ml-2">
                        {task.status}
                      </Badge>
                    </div>
                    {task.output && (
                      <div className="mt-2 p-2 bg-[var(--bg-secondary)] rounded text-xs text-[var(--text-muted)] font-mono max-h-32 overflow-auto">
                        {task.output}
                      </div>
                    )}
                    {task.status === 'running' && (
                      <div className="mt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelTask(task.task_id)}
                          disabled={cancelling === task.task_id}
                          className="h-7 text-xs"
                        >
                          {cancelling === task.task_id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>Cancel Task</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-[var(--border)] flex justify-end">
              <Button
                onClick={() => setIsOpen(false)}
                variant="secondary"
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}