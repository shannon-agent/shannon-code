// Task board showing pending, in-progress, and completed tasks
import { useState, useMemo } from 'react'
import { Circle, Clock, CheckCircle2, AlertCircle, ListTodo, RefreshCw } from 'lucide-react'
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

type TaskFilter = 'all' | 'active' | 'completed' | 'failed'

interface TaskBoardProps {
  tasks: TaskItem[]
  onSelect?: (taskId: string) => void
  selectedId?: string
  onRefresh?: () => void
}

const STATUS_CONFIG = {
  pending: { icon: Circle, color: 'text-muted-foreground', badge: 'secondary' as const },
  in_progress: { icon: Clock, color: 'text-primary', pulse: true, badge: 'default' as const },
  completed: { icon: CheckCircle2, color: 'text-success', badge: 'success' as const },
  failed: { icon: AlertCircle, color: 'text-destructive', badge: 'error' as const },
}

const FILTER_TABS: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' },
  { key: 'failed', label: 'Failed' },
]

function TaskCard({ task, onSelect, isSelected }: { task: TaskItem; onSelect?: (id: string) => void; isSelected: boolean }) {
  const cfg = STATUS_CONFIG[task.status]
  const Icon = cfg.icon

  return (
    <div
      onClick={() => onSelect?.(task.id)}
      className={cn(
        'px-3 py-2 cursor-pointer transition-colors duration-100',
        isSelected
          ? 'bg-primary/10 border-l-2 border-l-ring'
          : task.status === 'in_progress'
            ? 'bg-secondary/50'
            : 'hover:bg-secondary/30'
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', cfg.color, cfg.pulse ? 'animate-pulse' : '')} />
        <div className="min-w-0 flex-1">
          <p className={cn(
            'text-[12px] truncate',
            task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-secondary-foreground'
          )}>
            {task.subject}
          </p>
          {task.description && (
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{task.description}</p>
          )}
          {task.owner && (
            <Badge variant="outline" className="text-[9px] mt-0.5">{task.owner}</Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export function TaskBoard({ tasks, onSelect, selectedId, onRefresh }: TaskBoardProps) {
  const [filter, setFilter] = useState<TaskFilter>('all')

  const counts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  }

  const filtered = useMemo(() => {
    let result = [...tasks]
    switch (filter) {
      case 'active':
        result = result.filter(t => t.status === 'pending' || t.status === 'in_progress')
        break
      case 'completed':
        result = result.filter(t => t.status === 'completed')
        break
      case 'failed':
        result = result.filter(t => t.status === 'failed')
        break
    }
    return result.sort((a, b) => {
      const order = { in_progress: 0, pending: 1, failed: 2, completed: 3 }
      return order[a.status] - order[b.status]
    })
  }, [tasks, filter])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <ListTodo className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-secondary-foreground">Tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          {counts.in_progress > 0 && <Badge variant="default" className="text-[9px]">{counts.in_progress} active</Badge>}
          {counts.completed > 0 && <Badge variant="success" className="text-[9px]">{counts.completed} done</Badge>}
          {counts.failed > 0 && <Badge variant="error" className="text-[9px]">{counts.failed} failed</Badge>}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded text-muted-foreground hover:text-secondary-foreground hover:bg-secondary transition-colors"
              title="Refresh tasks"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border/50 bg-secondary/30">
        {FILTER_TABS.map(tab => {
          const count = tab.key === 'all'
            ? tasks.length
            : tab.key === 'active'
              ? counts.pending + counts.in_progress
              : counts[tab.key]
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'px-2 py-0.5 text-[10px] rounded transition-colors',
                filter === tab.key
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-secondary-foreground'
              )}
            >
              {tab.label} {count > 0 && `(${count})`}
            </button>
          )
        })}
      </div>

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-32 p-4">
            <p className="text-muted-foreground text-[11px]">
              {tasks.length === 0 ? 'No tasks' : 'No matching tasks'}
            </p>
          </div>
        ) : (
          filtered.map(task => (
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
          <div className="px-3 py-1.5 bg-secondary/50">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              <span>{counts.pending + counts.in_progress} remaining</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
