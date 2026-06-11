// Task board — Scheduled tasks with calendar, execution log, and efficiency metrics
import { useState, useMemo } from 'react'
import { cn } from '../lib/utils'
import { startBackgroundTask } from '../lib/tauri-api'

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

const STATUS_CONFIG: Record<string, { icon: string; color: string; badgeBg: string; badgeText: string; dotColor: string; animate?: boolean }> = {
  pending: { icon: 'radio_button_unchecked', color: 'text-md3-on-surface-variant', badgeBg: 'bg-md3-surface-container-highest', badgeText: 'text-md3-on-surface-variant', dotColor: 'bg-md3-outline' },
  in_progress: { icon: 'hourglass_top', color: 'text-md3-primary', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', dotColor: 'bg-blue-500', animate: true },
  completed: { icon: 'check_circle', color: 'text-md3-secondary', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', dotColor: 'bg-emerald-500' },
  failed: { icon: 'error', color: 'text-md3-error', badgeBg: 'bg-red-100', badgeText: 'text-red-800', dotColor: 'bg-red-500' },
}

const TASK_ICONS = ['newspaper', 'payments', 'search_check', 'code', 'storage', 'analytics']

// Calendar day grid for current month
function CalendarWidget() {
  const [view, setView] = useState<'month' | 'week'>('month')
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const todayDate = today.getDate()
  const isCurrentMonth = calYear === today.getFullYear() && calMonth === today.getMonth()

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
    else setCalMonth(calMonth - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
    else setCalMonth(calMonth + 1)
  }

  const days: (number | null)[] = []
  if (view === 'month') {
    for (let i = 0; i < offset; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
  } else {
    const dayOfWeek = new Date(calYear, calMonth, 1).getDay() === 0 ? 6 : new Date(calYear, calMonth, 1).getDay() - 1
    for (let i = 0; i < 7; i++) {
      const d = 1 - dayOfWeek + i
      if (d >= 1 && d <= daysInMonth) days.push(d)
      else days.push(null)
    }
  }

  const eventDays = isCurrentMonth ? [todayDate, Math.min(todayDate + 7, daysInMonth)] : []
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="bg-white border border-md3-outline-variant/30 rounded-2xl p-md3-lg shadow-sm">
      <div className="flex items-center justify-between mb-md3-lg">
        <div>
          <h4 className="text-headline-md text-[18px] text-md3-on-surface">{monthNames[calMonth]} {calYear}</h4>
        </div>
        <div className="flex items-center gap-sm">
          <div className="flex rounded-lg border border-md3-outline-variant/30 overflow-hidden">
            <button onClick={() => setView('month')} className={cn('px-sm py-1 text-label-sm transition-colors', view === 'month' ? 'bg-md3-primary text-md3-on-primary' : 'text-md3-on-surface-variant hover:bg-md3-surface-container-high/50')}>Month</button>
            <button onClick={() => setView('week')} className={cn('px-sm py-1 text-label-sm transition-colors', view === 'week' ? 'bg-md3-primary text-md3-on-primary' : 'text-md3-on-surface-variant hover:bg-md3-surface-container-high/50')}>Week</button>
          </div>
          <button onClick={prevMonth} className="material-symbols-outlined text-md3-on-surface-variant text-[20px] cursor-pointer hover:text-md3-primary transition-colors">chevron_left</button>
          <button onClick={nextMonth} className="material-symbols-outlined text-md3-on-surface-variant text-[20px] cursor-pointer hover:text-md3-primary transition-colors">chevron_right</button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center mb-sm">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <span key={d} className="text-[10px] font-bold text-md3-on-surface-variant/60 uppercase">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-label-md">
        {days.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} className="py-2 text-md3-on-surface-variant/30" />
          const isToday = day === todayDate
          const hasEvent = eventDays.includes(day)
          return (
            <div key={day} className={cn(
              'py-2 rounded-lg cursor-pointer relative',
              isToday && 'bg-md3-primary text-md3-on-primary font-bold',
              hasEvent && !isToday && 'bg-md3-primary-container/20 text-md3-primary font-bold'
            )}>
              {day}
              {hasEvent && (
                <div className={cn('absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full', isToday ? 'bg-white' : 'bg-md3-primary')} />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-md3-lg pt-md3-lg border-t border-md3-outline-variant/20">
        <h5 className="text-label-sm text-md3-on-surface-variant uppercase tracking-wider mb-md3-md">Upcoming Today</h5>
        <div className="space-y-md3-md">
          <div className="flex items-start gap-md3-md">
            <div className="w-1 bg-md3-secondary h-8 rounded-full" />
            <div>
              <p className="text-body-sm font-semibold text-md3-on-surface">Build Verification</p>
              <p className="text-[12px] text-md3-on-surface-variant">03:00 PM</p>
            </div>
          </div>
          <div className="flex items-start gap-md3-md">
            <div className="w-1 bg-md3-tertiary h-8 rounded-full" />
            <div>
              <p className="text-body-sm font-semibold text-md3-on-surface">Lint & Format Check</p>
              <p className="text-[12px] text-md3-on-surface-variant">06:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TaskBoard({ tasks, onSelect, selectedId, onRefresh }: TaskBoardProps) {
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null)
  const [successTaskId, setSuccessTaskId] = useState<string | null>(null)
  const [errorTaskId, setErrorTaskId] = useState<string | null>(null)

  const handleRun = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    setRunningTaskId(taskId)
    setErrorTaskId(null)
    try {
      await startBackgroundTask(task.description || task.subject)
      setRunningTaskId(null)
      setSuccessTaskId(taskId)
      setTimeout(() => setSuccessTaskId(null), 2000)
      onRefresh?.()
    } catch {
      setRunningTaskId(null)
      setErrorTaskId(taskId)
      setTimeout(() => setErrorTaskId(null), 3000)
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return tasks
    if (filter === 'active') return tasks.filter(t => t.status === 'in_progress' || t.status === 'pending')
    return tasks.filter(t => t.status === filter)
  }, [tasks, filter])

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const efficiency = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className="max-w-[1200px] mx-auto px-md3-lg py-md3-xl w-full animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-md3-xl gap-md3-md">
        <div>
          <h2 className="text-headline-lg text-md3-on-surface">Scheduled Tasks</h2>
          <p className="text-md3-on-surface-variant mt-xs">Manage and monitor your automated workflows.</p>
        </div>
        <div className="flex gap-sm">
          <button
            onClick={onRefresh}
            className="px-md3-md py-sm rounded-xl border border-md3-outline-variant/50 flex items-center gap-sm hover:bg-md3-surface-container-high/30 transition-all text-label-md"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Refresh
          </button>
          <button className="px-md3-md py-sm rounded-xl border border-md3-outline-variant/50 flex items-center gap-sm hover:bg-md3-surface-container-high/30 transition-all text-label-md">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filters
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-sm mb-md3-lg">
        {(['all', 'active', 'completed', 'failed'] as TaskFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-md3-md py-sm rounded-lg text-label-sm font-medium capitalize transition-all',
              filter === f
                ? 'bg-md3-primary/10 text-md3-primary border border-md3-primary/20'
                : 'text-md3-on-surface-variant hover:bg-md3-surface-container-low'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-md3-lg">
        {/* Tasks List */}
        <div className="col-span-12 lg:col-span-8 space-y-md3-md">
          {filtered.length === 0 ? (
            <div className="text-center py-xl">
              <span className="material-symbols-outlined text-[48px] text-md3-on-surface-variant/30">task_alt</span>
              <p className="text-md3-on-surface-variant mt-sm">No tasks found</p>
            </div>
          ) : (
            filtered.map((task, i) => {
              const cfg = STATUS_CONFIG[task.status]
              return (
                <div
                  key={task.id}
                  onClick={() => onSelect?.(task.id)}
                  className={cn(
                    'glass-panel border rounded-xl p-md3-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group bg-white/80 cursor-pointer',
                    selectedId === task.id ? 'border-md3-primary/50' : 'border-md3-outline-variant/10'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-md3-md">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', i % 3 === 0 ? 'bg-md3-primary/10 text-md3-primary' : i % 3 === 1 ? 'bg-md3-secondary/10 text-md3-secondary' : 'bg-md3-tertiary/10 text-md3-tertiary')}>
                        <span className="material-symbols-outlined text-[28px]">{TASK_ICONS[i % TASK_ICONS.length]}</span>
                      </div>
                      <div>
                        <h3 className="text-body-lg font-semibold text-md3-on-surface group-hover:text-md3-primary transition-colors">{task.subject}</h3>
                        <div className="flex items-center gap-md3-md mt-1">
                          <span className="text-label-sm text-md3-on-surface-variant flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                            {task.owner ?? 'System'}
                          </span>
                          {task.description && (
                            <span className="text-label-sm text-md3-on-surface-variant/60 truncate max-w-[300px]">{task.description}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-md3-lg">
                      <div className={cn('flex items-center gap-xs px-sm py-1 rounded-full', cfg.badgeBg, cfg.badgeText, 'border')}>
                        <span className={cn('w-2 h-2 rounded-full', cfg.dotColor, cfg.animate && 'animate-pulse')} />
                        <span className="text-label-sm text-[11px] font-bold uppercase tracking-wider">{task.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        <button className="p-2 rounded-lg hover:bg-md3-surface-container-high text-md3-on-surface-variant transition-colors">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        {task.status === 'pending' && runningTaskId === task.id && (
                          <button className="bg-md3-primary/70 text-md3-on-primary px-md3-md py-sm rounded-lg text-label-md flex items-center gap-xs cursor-wait">
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                            Running...
                          </button>
                        )}
                        {task.status === 'pending' && successTaskId === task.id && (
                          <button className="bg-emerald-500 text-white px-md3-md py-sm rounded-lg text-label-md flex items-center gap-xs animate-in fade-in duration-300">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Done
                          </button>
                        )}
                        {task.status === 'pending' && errorTaskId === task.id && (
                          <button className="bg-md3-error text-white px-md3-md py-sm rounded-lg text-label-md flex items-center gap-xs animate-in fade-in duration-300">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            Failed
                          </button>
                        )}
                        {task.status === 'pending' && runningTaskId !== task.id && successTaskId !== task.id && errorTaskId !== task.id && (
                          <button onClick={(e) => { e.stopPropagation(); handleRun(task.id) }} className="bg-md3-primary text-md3-on-primary px-md3-md py-sm rounded-lg text-label-md flex items-center gap-xs hover:brightness-110 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                            Run
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button className="p-2 rounded-lg hover:bg-md3-surface-container-high text-md3-on-surface-variant">
                            <span className="material-symbols-outlined">stop_circle</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {/* Execution Log */}
          {filtered.some(t => t.status === 'completed' || t.status === 'in_progress') && (
            <div className="pt-md3-lg">
              <h4 className="text-label-md text-md3-on-surface-variant uppercase tracking-[0.1em] mb-md3-md pl-xs">Task Execution Log</h4>
              <div className="relative pl-8 border-l border-md3-outline-variant/30 space-y-md3-lg ml-md3-md">
                {filtered.filter(t => t.status === 'completed' || t.status === 'in_progress').map((task) => {
                  const isCompleted = task.status === 'completed'
                  return (
                    <div key={task.id} className="relative">
                      <div className={cn(
                        'absolute -left-[41px] top-1 w-4 h-4 rounded-full border-2 bg-white z-10',
                        isCompleted ? 'border-md3-primary' : 'border-blue-500 animate-pulse'
                      )} />
                      <p className={cn('text-label-sm mb-1', isCompleted ? 'text-md3-primary' : 'text-blue-500')}>
                        {isCompleted ? 'COMPLETED' : 'PROCESSING'} — {task.subject}
                      </p>
                      <p className="text-md3-on-surface-variant text-body-sm italic">
                        {isCompleted ? `Task "${task.subject}" finished successfully.` : `Task "${task.subject}" is currently running...`}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-md3-lg">
          {/* Calendar */}
          <CalendarWidget />

          {/* Efficiency Card */}
          <div className="bg-md3-primary overflow-hidden rounded-2xl relative p-md3-lg text-md3-on-primary">
            <div className="relative z-10">
              <h4 className="text-label-md text-md3-on-primary/80 uppercase tracking-widest mb-md3-md">AI Efficiency</h4>
              <div className="text-display-lg text-[40px] mb-xs">{efficiency}%</div>
              <p className="text-body-sm text-md3-on-primary/70">Tasks completed autonomously this session.</p>
              <div className="mt-md3-lg h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${efficiency}%` }} />
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12 pointer-events-none">
              <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
          </div>

          {/* Agent Allocation */}
          <div className="bg-md3-surface-container-low rounded-2xl p-md3-lg border border-md3-outline-variant/20">
            <h4 className="text-headline-md text-[16px] text-md3-on-surface mb-md3-md">Agent Allocation</h4>
            <div className="space-y-sm">
              {[
                { name: 'Architect', pct: 35, color: 'bg-md3-primary' },
                { name: 'Engineer', pct: 45, color: 'bg-md3-secondary' },
                { name: 'QA Agent', pct: 20, color: 'bg-md3-tertiary' },
              ].map(agent => (
                <div key={agent.name} className="pt-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body-sm text-md3-on-surface-variant">{agent.name}</span>
                    <span className="text-label-md text-md3-primary">{agent.pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-md3-outline-variant/30 rounded-full">
                    <div className={cn('h-full rounded-full', agent.color)} style={{ width: `${agent.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
