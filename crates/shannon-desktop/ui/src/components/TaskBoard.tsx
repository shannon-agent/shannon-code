// Task board showing pending, in-progress, and completed tasks
import { Circle, Clock, CheckCircle2, AlertCircle, ListTodo } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { cn } from '../lib/utils'

export interface TaskItem {
  id: string
  subject: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  owner?: string
}

interface TaskBoardProps {
  tasks: TaskItem[]
  onSelect?: (taskId: string) => void
  selectedId?: string
}

const STATUS_CONFIG = {
  pending: { icon: Circle, color: 'text-[var(--text-muted)]', badge: 'secondary' as const },
  in_progress: { icon: Clock, color: 'text-[var(--accent)]', pulse: true, badge: 'default' as const },
  completed: { icon: CheckCircle2, color: 'text-[var(--success)]', badge: 'success' as const },
  failed: { icon: AlertCircle, color: 'text-[var(--error)]', badge: 'error' as const },
}

function TaskCard({ task, onSelect, isSelected }: { task: TaskItem; onSelect?: (id: string) => void; isSelected: boolean }) {
  const cfg = STATUS_CONFIG[task.status]
  const Icon = cfg.icon

  return (
    <div
      onClick={() => onSelect?.(task.id)}
      className={cn(
        'px-3 py-2 cursor-pointer transition-colors duration-100',
        isSelected
          ? 'bg-[var(--accent)]/10 border-l-2 border-l-[var(--accent)]'
          : task.status === 'in_progress'
            ? 'bg-[var(--bg-secondary)]/50'
            : 'hover:bg-[var(--bg-secondary)]/30'
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', cfg.color, cfg.pulse ? 'animate-pulse' : '')} />
        <div className="min-w-0 flex-1">
          <p className={cn(
            'text-[12px] truncate',
            task.status === 'completed' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'
          )}>
            {task.subject}
          </p>
          {task.description && (
            <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{task.description}</p>
          )}
          {task.owner && (
            <Badge variant="outline" className="text-[9px] mt-0.5">{task.owner}</Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export function TaskBoard({ tasks, onSelect, selectedId }: TaskBoardProps) {
  const counts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  }

  const sorted = [...tasks].sort((a, b) => {
    const order = { in_progress: 0, pending: 1, failed: 2, completed: 3 }
    return order[a.status] - order[b.status]
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <ListTodo className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">Tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          {counts.in_progress > 0 && <Badge variant="default" className="text-[9px]">{counts.in_progress} active</Badge>}
          {counts.completed > 0 && <Badge variant="success" className="text-[9px]">{counts.completed} done</Badge>}
          {counts.failed > 0 && <Badge variant="error" className="text-[9px]">{counts.failed} failed</Badge>}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 p-4">
            <p className="text-[var(--text-muted)] text-[11px]">No tasks</p>
          </div>
        ) : (
          sorted.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={onSelect}
              isSelected={task.id === selectedId}
            />
          ))
        )}
      </ScrollArea>

      {tasks.length > 0 && (
        <>
          <Separator />
          <div className="px-3 py-1.5 bg-[var(--bg-secondary)]/50">
            <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
              <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              <span>{counts.pending + counts.in_progress} remaining</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
