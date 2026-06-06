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

/**
 * Task scheduler UI for scheduling background tasks
 * - Schedule form: prompt text, datetime picker, recurrence dropdown
 * - Task list table: name, schedule, status badge, actions
 * - Status badges: scheduled(yellow), running(blue), completed(green), failed(red)
 * - Tokyo Night styling
 */
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
      scheduled: 'bg-[#e0af68]/20 text-[#e0af68]',
      running: 'bg-[#7aa2f7]/20 text-[#7aa2f7]',
      completed: 'bg-[#9ece6a]/20 text-[#9ece6a]',
      failed: 'bg-[#f7768e]/20 text-[#f7768e]'
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
        <h2 className="text-[#c0caf5] text-lg font-semibold">Scheduled Tasks</h2>
        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#7aa2f7] text-[#1a1b26] rounded-lg hover:bg-[#7aa2f7]/80 transition-colors font-medium"
        >
          <Plus size={18} />
          Schedule Task
        </button>
      </div>

      {/* Schedule Form */}
      {showScheduleForm && (
        <div className="p-4 bg-[#24283b] border border-[#414868] rounded-lg">
          <h3 className="text-[#c0caf5] font-semibold mb-3">Schedule New Task</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-[#a9b1d6] mb-1">Task Name</label>
              <input
                type="text"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                placeholder="e.g., Daily Summary"
                className="w-full px-3 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#a9b1d6] mb-1">Prompt</label>
              <textarea
                value={newTask.prompt}
                onChange={(e) => setNewTask({ ...newTask, prompt: e.target.value })}
                placeholder="Enter the task prompt..."
                rows={3}
                className="w-full px-3 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7] resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[#a9b1d6] mb-1">Scheduled Time</label>
                <input
                  type="datetime-local"
                  value={newTask.scheduledTime}
                  onChange={(e) => setNewTask({ ...newTask, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[#a9b1d6] mb-1">Recurrence</label>
                <select
                  value={newTask.recurrence}
                  onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value as 'once' | 'daily' | 'weekly' })}
                  className="w-full px-3 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
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
                className="px-4 py-2 bg-[#7aa2f7] text-[#1a1b26] rounded-lg hover:bg-[#7aa2f7]/80 transition-colors font-medium"
              >
                Schedule Task
              </button>
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
                className="px-4 py-2 bg-[#414868] text-[#c0caf5] rounded-lg hover:bg-[#565f89] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-[#1f2335] border border-[#414868] rounded-lg overflow-hidden">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-[#565f89]">
            No scheduled tasks
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#24283b] border-b border-[#414868]">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-[#a9b1d6]">Task</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-[#a9b1d6]">Schedule</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-[#a9b1d6]">Recurrence</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-[#a9b1d6]">Status</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-[#a9b1d6]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2f44]">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-[#24283b]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#565f89]" />
                      <span className="text-[#c0caf5] font-medium">{task.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#a9b1d6]">
                    {formatDate(task.scheduledTime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#a9b1d6] capitalize">
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
                          className="p-1.5 rounded bg-[#24283b] text-[#7aa2f7] hover:bg-[#2a2f44] transition-colors"
                          title="View result"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {task.status !== 'running' && (
                        <button
                          onClick={() => onCancelTask(task.id)}
                          className="p-1.5 rounded bg-[#24283b] text-[#f7768e] hover:bg-[#2a2f44] transition-colors"
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
        <div className="flex items-center gap-4 text-sm text-[#565f89] pt-2 border-t border-[#2a2f44]">
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
