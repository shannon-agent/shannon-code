// Floating badge for background tasks with MD3 styling
import { useState, useEffect, useCallback } from 'react'
import { getBackgroundTasks, cancelBackgroundTask } from '../lib/tauri-api'
import { useTauriEvent } from '../hooks/useTauriEvent'
import type { BackgroundTaskInfo } from '../types/tauri-events'
import { EVENT_NAMES } from '../types/tauri-events'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip'
import { Spinner } from './ui/spinner'
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
  useTauriEvent<{ task_id: string; status: string; output?: string; completed_at?: number }>(EVENT_NAMES.BACKGROUND_TASK_UPDATE, (update) => {
    // Update single task in the list
    setTasks(prev => prev.map(task => {
      if (task.task_id !== update.task_id) return task
      const updated: BackgroundTaskInfo = {
        ...task,
        status: update.status,
        output: update.output ?? task.output,
        completed_at: update.completed_at ?? task.completed_at,
      }
      return updated
    }))
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
  const hasTasks = tasks.length > 0

  if (!hasTasks) return null

  const getTaskStatus = (task: BackgroundTaskInfo): 'warning' | 'success' | 'error' | 'default' => {
    switch (task.status) {
      case 'running': return 'warning'
      case 'completed': return 'success'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all',
                runningTasks.length > 0
                  ? 'bg-primary text-white hover:bg-primary/90 animate-pulse'
                  : 'bg-secondary text-secondary-foreground hover:bg-background'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              <Badge variant={runningTasks.length > 0 ? 'default' : 'secondary'} className="text-xs">
                {tasks.length}
              </Badge>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {tasks.length} background task{tasks.length > 1 ? 's' : ''}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <Card
            className="max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                Background Tasks ({tasks.length})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-7 w-7 p-0">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[60vh]">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No background tasks
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="p-4 border-b border-border last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-foreground line-clamp-2">
                          {task.prompt}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Started {new Date(task.started_at).toLocaleTimeString()}
                          {task.completed_at && ` \u00b7 Completed ${new Date(task.completed_at).toLocaleTimeString()}`}
                        </p>
                      </div>
                      <Badge variant={getTaskStatus(task)} className="ml-2">
                        {task.status}
                      </Badge>
                    </div>
                    {task.output && (
                      <div className="mt-2 p-2 bg-secondary rounded text-xs text-muted-foreground font-mono max-h-32 overflow-auto">
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
                              <Spinner className="w-3 h-3 mr-1" />
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
            </CardContent>
            <CardFooter className="p-4 border-t border-border flex justify-end">
              <Button
                onClick={() => setIsOpen(false)}
                variant="secondary"
                size="sm"
              >
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}
