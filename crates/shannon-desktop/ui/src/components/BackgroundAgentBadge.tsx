// Floating badge for background tasks
import { useState, useEffect } from 'react'
import { Brain } from 'lucide-react'
import { listen } from '@tauri-apps/api/event'
import { getBackgroundTasks } from '../lib/tauri-api'
import type { BackgroundTaskInfo } from '../types/tauri-events'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'

export function BackgroundAgentBadge() {
  const [tasks, setTasks] = useState<BackgroundTaskInfo[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load initial tasks
    getBackgroundTasks().then(setTasks).catch(console.error)

    // Listen for task updates
    const unlisten = listen('background-tasks-updated', () => {
      getBackgroundTasks().then(setTasks).catch(console.error)
    })

    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  const runningTasks = tasks.filter(t => t.status === 'running')
  const hasTasks = runningTasks.length > 0

  if (!hasTasks) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all',
          'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90',
          'animate-pulse'
        )}
        title={`${runningTasks.length} background task${runningTasks.length > 1 ? 's' : ''} running`}
      >
        <Brain className="w-4 h-4" />
        <span className="text-sm font-medium">{runningTasks.length}</span>
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
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Background Tasks ({runningTasks.length})
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {runningTasks.map((task) => (
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
                      </p>
                    </div>
                    <Badge variant="secondary">Running</Badge>
                  </div>
                  {task.output && (
                    <div className="mt-2 p-2 bg-[var(--bg-secondary)] rounded text-xs text-[var(--text-muted)] font-mono">
                      {task.output}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}