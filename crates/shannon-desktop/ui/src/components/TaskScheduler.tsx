// Task scheduler UI component
import { useState } from 'react'
import { Plus, Clock, Calendar, Trash2, Eye, Play, CheckCircle, XCircle } from 'lucide-react'

export type TaskStatus = 'scheduled' | 'running' | 'completed' | 'failed'

export interface ScheduledTask {
  id: string
  name: string
  prompt: string
  scheduledTime: Date
  recurrence: 'once' | 'daily' | 'weekly'
  status: TaskStatus
  result?: string
  error?: string
}

interface TaskSchedulerProps {
  tasks: ScheduledTask[]
  onScheduleTask: (task: Omit<ScheduledTask, 'id' | 'status'>) => void
  onCancelTask: (id: string) => void
  onViewResult?: (id: string) => void
}

export function TaskScheduler({
  tasks,
  onScheduleTask,
  onCancelTask,
  onViewResult
}: TaskSchedulerProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [newTask, setNewTask] = useState({
    name: '',
    prompt: '',
    scheduledTime: '',
    recurrence: 'once' as 'once' | 'daily' | 'weekly'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.name && newTask.prompt && newTask.scheduledTime) {
      onScheduleTask({
        name: newTask.name,
        prompt: newTask.prompt,
        scheduledTime: new Date(newTask.scheduledTime),
        recurrence: newTask.recurrence
      })
      setNewTask({ name: '', prompt: '', scheduledTime: '', recurrence: 'once' })
      setShowScheduleForm(false)
    }
  }

  const getStatusBadge = (status: TaskStatus) => {
    const styles = {
      scheduled: 'bg-amber-100 text-amber-700',
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
      failed: 'bg-red-100 text-red-700'
    }

    const icons = {
      scheduled: <Clock size={14} />,
      running: <Play size={14} />,
      completed: <CheckCircle size={14} />,
      failed: <XCircle size={14} />
    }

    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-md3-on-surface text-lg font-semibold">Scheduled Tasks</h2>
        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="flex items-center gap-2 px-4 py-2 bg-md3-primary text-md3-on-primary rounded-lg hover:brightness-110 transition-colors font-medium"
        >
          <Plus size={18} />
          Schedule Task
        </button>
      </div>

      {/* Schedule Form */}
      {showScheduleForm && (
        <div className="p-4 bg-md3-surface-container border border-md3-outline-variant rounded-xl">
          <h3 className="text-md3-on-surface font-semibold mb-3">Schedule New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-md3-on-surface-variant mb-1">Task Name</label>
              <input
                type="text"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                placeholder="e.g., Daily Summary"
                className="w-full px-3 py-2 bg-md3-surface-container-highest border border-md3-outline-variant rounded-lg text-md3-on-surface placeholder-md3-on-surface-variant/50 focus:outline-none focus:border-md3-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-md3-on-surface-variant mb-1">Prompt</label>
              <textarea
                value={newTask.prompt}
                onChange={(e) => setNewTask({ ...newTask, prompt: e.target.value })}
                placeholder="Enter the task prompt..."
                rows={3}
                className="w-full px-3 py-2 bg-md3-surface-container-highest border border-md3-outline-variant rounded-lg text-md3-on-surface placeholder-md3-on-surface-variant/50 focus:outline-none focus:border-md3-primary resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-md3-on-surface-variant mb-1">Scheduled Time</label>
                <input
                  type="datetime-local"
                  value={newTask.scheduledTime}
                  onChange={(e) => setNewTask({ ...newTask, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 bg-md3-surface-container-highest border border-md3-outline-variant rounded-lg text-md3-on-surface focus:outline-none focus:border-md3-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-md3-on-surface-variant mb-1">Recurrence</label>
                <select
                  value={newTask.recurrence}
                  onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value as 'once' | 'daily' | 'weekly' })}
                  className="w-full px-3 py-2 bg-md3-surface-container-highest border border-md3-outline-variant rounded-lg text-md3-on-surface focus:outline-none focus:border-md3-primary"
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-md3-primary text-md3-on-primary rounded-lg hover:brightness-110 transition-colors font-medium"
              >
                Schedule Task
              </button>
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="px-4 py-2 bg-md3-surface-container-high text-md3-on-surface rounded-lg hover:bg-md3-surface-container-high/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-md3-surface-container-low border border-md3-outline-variant rounded-xl overflow-hidden">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-md3-on-surface-variant/60">
            No scheduled tasks
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-md3-surface-container border-b border-md3-outline-variant">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-md3-on-surface-variant">Task</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-md3-on-surface-variant">Schedule</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-md3-on-surface-variant">Recurrence</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-md3-on-surface-variant">Status</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-md3-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md3-outline-variant/20">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-md3-surface-container/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-md3-on-surface-variant/60" />
                      <span className="text-md3-on-surface font-medium">{task.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-md3-on-surface-variant">
                    {formatDate(task.scheduledTime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-md3-on-surface-variant capitalize">
                    {task.recurrence}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(task.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {task.status === 'completed' && onViewResult && (
                        <button
                          onClick={() => onViewResult(task.id)}
                          className="p-1.5 rounded bg-md3-surface-container text-md3-primary hover:bg-md3-surface-container-high transition-colors"
                          title="View result"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {task.status !== 'running' && (
                        <button
                          onClick={() => onCancelTask(task.id)}
                          className="p-1.5 rounded bg-md3-surface-container text-md3-error hover:bg-md3-surface-container-high transition-colors"
                          title="Cancel task"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats Footer */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-md3-on-surface-variant/60 pt-2 border-t border-md3-outline-variant/20">
          <span>{tasks.length} total tasks</span>
          <span>•</span>
          <span>{tasks.filter(t => t.status === 'scheduled').length} scheduled</span>
          <span>•</span>
          <span>{tasks.filter(t => t.status === 'running').length} running</span>
          <span>•</span>
          <span>{tasks.filter(t => t.status === 'completed').length} completed</span>
        </div>
      )}
    </div>
  )
}
