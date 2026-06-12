import { useState } from 'react'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { CardSkeleton } from '@/components/SkeletonLoader'
import { useApp } from '@/context/AppContext'
import * as api from '@/lib/tauri-api'

type FilterStatus = 'all' | 'pending' | 'running' | 'completed'

export default function Tasks() {
  const { tasks, backgroundTasks, agents, refreshTasks, loading } = useApp()
  const [running, setRunning] = useState<string | null>(null)
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [showFilters, setShowFilters] = useState(false)
  const [calendarView, setCalendarView] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTaskPrompt, setNewTaskPrompt] = useState('')
  const [taskPage, setTaskPage] = useState(1)
  const TASKS_PER_PAGE = 10

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) ?? backgroundTasks.find(t => t.task_id === selectedTaskId) : null

  const statusMatchesFilter = (status: string): boolean => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'pending') return status === 'pending' || status === 'todo'
    if (activeFilter === 'running') return status === 'running' || status === 'in_progress'
    if (activeFilter === 'completed') return status === 'completed'
    return true
  }

  const filteredTasks = tasks.filter(t => statusMatchesFilter(t.status))
  const taskTotalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE)
  const pagedFilteredTasks = filteredTasks.slice((taskPage - 1) * TASKS_PER_PAGE, taskPage * TASKS_PER_PAGE)

  const handleStartTask = async () => {
    if (!newTaskPrompt.trim()) return
    try {
      setErrorMsg(null)
      await api.startBackgroundTask(newTaskPrompt.trim())
      setNewTaskPrompt('')
      setShowNewTask(false)
      await refreshTasks()
    } catch (e) { setErrorMsg(e instanceof Error ? e.message : 'Failed to start task') }
  }

  const handleCancelTask = async (id: string) => {
    try {
      setErrorMsg(null)
      await api.cancelBackgroundTask(id)
    } catch (e) { setErrorMsg(e instanceof Error ? e.message : 'Failed to cancel task') }
    await refreshTasks()
  }

  const handleRunNow = async (id: string) => {
    setRunning(id)
    try {
      setErrorMsg(null)
      await api.startBackgroundTask(`Execute task: ${tasks.find(t => t.id === id)?.title ?? id}`)
      await refreshTasks()
    } catch (e) { setErrorMsg(e instanceof Error ? e.message : 'Failed to run task') }
    setTimeout(() => setRunning(null), 1500)
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', label: 'Completed', icon: 'check_circle' }
      case 'running': case 'in_progress': return { bg: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500 animate-pulse', label: 'Running', icon: 'autorenew' }
      case 'failed': case 'error': return { bg: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500', label: 'Failed', icon: 'error' }
      case 'pending': return { bg: 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30', dot: 'bg-outline', label: 'Pending', icon: 'schedule' }
      default: return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', label: status, icon: 'task_alt' }
    }
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Calendar helper
  const today = new Date()
  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const startOfMonth = new Date(viewYear, viewMonth, 1)
  const startDay = (startOfMonth.getDay() + 6) % 7 // Monday-based
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) } else { setViewMonth(viewMonth - 1) } }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) } else { setViewMonth(viewMonth + 1) } }

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const totalCount = tasks.length
  const efficiencyPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Agent allocation
  const agentAllocs = agents.length > 0
    ? agents.slice(0, 3).map((a, i) => ({
        name: a.name,
        pct: Math.round(100 / agents.length),
        color: ['bg-primary', 'bg-secondary', 'bg-tertiary'][i],
        textColor: ['text-primary', 'text-secondary', 'text-tertiary'][i],
      }))
    : []

  return (
    <div className="flex-1 overflow-y-auto w-full pb-16">
      <div className="max-w-[1200px] mx-auto px-lg py-xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-xl gap-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Scheduled Tasks</h2>
            <p className="text-on-surface-variant mt-xs">Manage and monitor your automated intelligence workflows.</p>
          </div>
          <div className="flex gap-sm">
            <Button onClick={() => setShowFilters(!showFilters)} className={`px-md py-sm border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl flex items-center gap-sm font-label-md cursor-pointer hover:bg-surface-container transition-colors ${showFilters ? 'ring-2 ring-primary' : ''}`}>
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
            </Button>
            <Button onClick={() => setCalendarView(!calendarView)} className={`px-md py-sm border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl flex items-center gap-sm font-label-md cursor-pointer hover:bg-surface-container transition-colors ${calendarView ? 'ring-2 ring-primary' : ''}`}>
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              {calendarView ? 'List View' : 'Month View'}
            </Button>
            <Button className="px-md py-sm bg-primary text-white rounded-xl flex items-center gap-sm font-label-md cursor-pointer hover:shadow-md active:scale-95 transition-all" onClick={() => setShowNewTask(!showNewTask)}>
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Background Task
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-sm px-md py-sm rounded-xl bg-red-50 border border-red-200 text-red-700 font-label-md mb-lg">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errorMsg}
            <button className="ml-auto text-red-400 hover:text-red-600 cursor-pointer" onClick={() => setErrorMsg(null)}>
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {showNewTask && (
          <div className="bg-surface-container-lowest border border-primary/30 rounded-xl p-lg mb-lg flex flex-col gap-md shadow-sm">
            <h3 className="font-body-lg font-bold text-on-surface">Create Background Task</h3>
            <textarea
              className="w-full h-20 p-sm bg-surface-container-low rounded-lg border border-outline-variant/30 text-body-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Describe the task for background execution..."
              value={newTaskPrompt}
              onChange={e => setNewTaskPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStartTask() } }}
              autoFocus
            />
            <div className="flex gap-sm">
              <Button className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md cursor-pointer" onClick={handleStartTask}>Create Task</Button>
              <Button variant="ghost" className="px-md py-sm rounded-lg border border-outline-variant font-label-md cursor-pointer" onClick={() => { setShowNewTask(false); setNewTaskPrompt('') }}>Cancel</Button>
            </div>
          </div>
        )}

        {showFilters && (
          <div className="flex gap-sm mb-lg flex-wrap">
            {([['all', 'All'], ['pending', 'Pending'], ['running', 'Running'], ['completed', 'Completed']] as const).map(([value, label]) => (
              <Button key={value} variant="ghost" onClick={() => setActiveFilter(value as FilterStatus)} className={`px-sm py-xs rounded-full text-label-sm transition-colors cursor-pointer ${activeFilter === value ? 'bg-primary/10 text-primary font-bold' : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-primary/10'}`}>
                {label}
              </Button>
            ))}
          </div>
        )}

        {/* Calendar View or List View */}
        {calendarView ? (
          <div className="space-y-lg">
            {/* Full-Width Calendar Grid */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg shadow-sm">
              <div className="grid grid-cols-7 text-center mb-sm">
                {dayNames.map(d => <span key={d} className="text-[11px] font-bold text-outline uppercase py-sm">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }, (_, i) => (
                  <div key={`prev-${i}`} className="min-h-[80px] p-xs rounded-lg" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const isToday = viewMonth === today.getMonth() && viewYear === today.getFullYear() && day === today.getDate()
                  const dayTasks = filteredTasks.filter(t => {
                    if (t.status === 'running' || t.status === 'in_progress') return true
                    if (t.status === 'completed') return true
                    return t.status === 'pending'
                  })
                  const isSelected = selectedDay === day
                  return (
                    <div
                      key={day}
                      className={`min-h-[80px] p-xs rounded-lg border cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' :
                        isToday ? 'border-primary/30 bg-primary/5' :
                        'border-outline-variant/10 hover:bg-surface-container-low'
                      }`}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                    >
                      <div className={`text-[12px] font-bold mb-xs ${isToday ? 'w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center' : 'text-on-surface-variant'}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayTasks.slice(0, 3).map((t, ti) => (
                          <div key={ti} className={`h-1 rounded-full ${
                            t.status === 'running' || t.status === 'in_progress' ? 'bg-primary' :
                            t.status === 'completed' ? 'bg-emerald-500' :
                            'bg-outline-variant'
                          }`} />
                        ))}
                        {dayTasks.length > 3 && <span className="text-[9px] text-on-surface-variant">+{dayTasks.length - 3}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tasks for Selected Day */}
            {selectedDay !== null && (
              <div>
                <h4 className="font-label-md text-label-md text-outline uppercase tracking-[0.1em] mb-md pl-xs">
                  {monthNames[viewMonth]} {selectedDay} — Tasks
                </h4>
                <div className="space-y-md">
                  {filteredTasks.length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant text-center py-lg">No tasks for this view.</p>
                  ) : (
                    filteredTasks.slice(0, 5).map(task => {
                      const badge = statusBadge(task.status)
                      return (
                        <div key={task.id} className="glass-panel border border-outline-variant/10 rounded-xl p-md shadow-sm hover:shadow-md transition-all group bg-surface-container-lowest/80 cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-md">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[24px]">task_alt</span>
                              </div>
                              <div>
                                <h3 className="font-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors">{task.title}</h3>
                                {task.assignee ? <span className="font-label-sm text-on-surface-variant">{task.assignee}</span> : null}
                              </div>
                            </div>
                            <div className={`flex items-center gap-xs px-sm py-1 rounded-full border ${badge.bg}`}>
                              <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                              <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">{badge.label}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Bottom Widgets in Calendar Mode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="bg-primary overflow-hidden rounded-2xl relative p-lg text-on-primary">
                <div className="relative z-10">
                  <h4 className="font-label-md text-on-primary/80 uppercase tracking-widest mb-md">AI Efficiency</h4>
                  <div className="text-display-lg text-[40px] mb-xs">{efficiencyPct}%</div>
                  <div className="mt-lg h-2 bg-surface-container-lowest/20 rounded-full overflow-hidden">
                    <div className="h-full bg-surface-container-lowest" style={{ width: `${efficiencyPct}%` }} />
                  </div>
                </div>
              </div>
              {agentAllocs.length > 0 ? (
                <div className="bg-surface-container-low rounded-2xl p-lg border border-outline-variant/20">
                  <h4 className="font-headline-md text-[16px] text-on-surface mb-md">Agent Allocation</h4>
                  <div className="space-y-sm">
                    {agentAllocs.map(a => (
                      <div key={a.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-body-sm text-on-surface-variant">{a.name}</span>
                          <span className={`font-label-md ${a.textColor}`}>{a.pct}%</span>
                        </div>
                        <div className="w-full h-1 bg-outline-variant/30 rounded-full">
                          <div className={`h-full ${a.color} rounded-full`} style={{ width: `${a.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg">
                <h4 className="font-headline-md text-[16px] text-on-surface mb-md">Active Now</h4>
                <div className="space-y-md">
                  {tasks.filter(t => t.status === 'running' || t.status === 'in_progress').slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-start gap-md">
                      <div className="w-1 bg-primary h-8 rounded-full" />
                      <div>
                        <p className="text-body-sm font-semibold">{t.title}</p>
                        <p className="text-[12px] text-on-surface-variant">{t.assignee || 'Unassigned'}</p>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === 'running' || t.status === 'in_progress').length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant italic opacity-60">No active tasks</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-12 gap-gutter">
          {/* Tasks List */}
          <div className="col-span-12 lg:col-span-8 space-y-md">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : filteredTasks.length === 0 && backgroundTasks.length === 0 ? (
              <EmptyState
                icon="task_alt"
                title="No tasks yet."
              />
            ) : null}

            {pagedFilteredTasks.map(task => {
              const badge = statusBadge(task.status)
              const isRunning = running === task.id
              return (
                <div key={task.id} className="glass-panel border border-outline-variant/10 rounded-xl p-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group bg-surface-container-lowest/80 cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[28px]">task_alt</span>
                      </div>
                      <div>
                        <h3 className="font-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors">{task.title}</h3>
                        <div className="flex items-center gap-md mt-1">
                          {task.assignee ? (
                            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                              <span className="material-symbols-outlined text-[14px]">smart_toy</span>
                              {task.assignee}
                            </span>
                          ) : null}
                          {task.priority ? (
                            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                              <span className="material-symbols-outlined text-[14px]">flag</span>
                              {task.priority}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-lg">
                      <div className={`flex items-center gap-xs px-sm py-1 rounded-full border ${badge.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                        <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">{badge.label}</span>
                      </div>
                      <div className="flex items-center gap-sm">
                        {task.status === 'running' || task.status === 'in_progress' ? (
                          <Button aria-label="Cancel task" className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer" onClick={() => handleCancelTask(task.id)}>
                            <span className="material-symbols-outlined" aria-hidden="true">stop_circle</span>
                          </Button>
                        ) : null}
                        <Button
                          className={`text-on-primary px-md py-sm rounded-lg font-label-md flex items-center gap-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer ${isRunning ? 'bg-emerald-500' : 'bg-primary'}`}
                          onClick={() => handleRunNow(task.id)}
                          disabled={isRunning}
                        >
                          {isRunning ? (
                            <>
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                              Success
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                              Run Now
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {task.description ? <p className="mt-sm text-body-sm text-on-surface-variant pl-[72px]">{task.description}</p> : null}
                </div>
              )
            })}

            <Pagination page={taskPage} totalPages={taskTotalPages} onPageChange={setTaskPage} />
            {/* Background Tasks Execution Log */}
            {backgroundTasks.length > 0 ? (
              <div className="pt-lg">
                <h4 className="font-label-md text-label-md text-outline uppercase tracking-[0.1em] mb-md pl-xs">Task Execution Log</h4>
                <div className="relative pl-8 border-l border-outline-variant/30 space-y-lg ml-md">
                  {backgroundTasks.map(bt => {
                    const badge = statusBadge(bt.status)
                    return (
                      <div key={bt.task_id} className="relative">
                        <div className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-2 bg-surface-container-lowest z-10 ${bt.status === 'running' ? 'border-blue-500 animate-pulse' : bt.status === 'completed' ? 'border-emerald-500' : bt.status === 'failed' ? 'border-red-500' : 'border-outline-variant'}`} />
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className={`font-label-sm text-label-sm mb-1 ${badge.bg.includes('blue') ? 'text-blue-500' : badge.bg.includes('emerald') ? 'text-emerald-600' : badge.bg.includes('red') ? 'text-error' : 'text-on-surface-variant'}`}>
                              {formatDate(bt.started_at)} — {badge.label.toUpperCase()}
                            </p>
                            <p className="text-on-surface-variant text-body-sm italic">{bt.prompt}</p>
                            {bt.output ? <pre className="mt-sm text-body-sm text-on-surface bg-surface-container-low p-sm rounded-lg max-h-[120px] overflow-auto">{bt.output}</pre> : null}
                          </div>
                          {bt.status === 'running' ? (
                            <Button aria-label="Cancel background task" className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant cursor-pointer" onClick={() => handleCancelTask(bt.task_id)}>
                              <span className="material-symbols-outlined" aria-hidden="true">stop_circle</span>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            {/* Calendar Widget */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg shadow-sm">
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <h4 className="font-headline-md text-[18px] text-on-surface">Schedule</h4>
                  <span className="font-label-sm text-on-surface-variant">{monthNames[viewMonth]} {viewYear}</span>
                </div>
                <div className="flex gap-sm">
                  <button aria-label="Previous month" className="material-symbols-outlined text-on-surface-variant text-[20px] cursor-pointer hover:text-primary transition-colors" onClick={prevMonth}>chevron_left</button>
                  <button aria-label="Next month" className="material-symbols-outlined text-on-surface-variant text-[20px] cursor-pointer hover:text-primary transition-colors" onClick={nextMonth}>chevron_right</button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center mb-sm">
                {dayNames.map(d => <span key={d} className="text-[10px] font-bold text-outline uppercase">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center font-label-md">
                {Array.from({ length: startDay }, (_, i) => (
                  <span key={`prev-${i}`} className="py-2 text-outline/30">{prevMonthDays - startDay + i + 1}</span>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const isToday = viewMonth === today.getMonth() && viewYear === today.getFullYear() && day === today.getDate()
                  const hasTask = tasks.some(t => {
                    // Simple heuristic: highlight days with tasks
                    return t.status === 'running' || t.status === 'in_progress'
                  })
                  return (
                    <span key={day} className={`py-2 rounded-lg cursor-pointer relative ${isToday ? 'bg-primary text-on-primary font-bold' : hasTask && day <= today.getDate() ? 'bg-primary-container/20 text-primary font-bold' : 'hover:bg-surface-container'}`}>
                      {day}
                    </span>
                  )
                })}
              </div>

              <div className="mt-lg pt-lg border-t border-outline-variant/20">
                <h5 className="font-label-sm text-outline uppercase tracking-wider mb-md">Active Now</h5>
                <div className="space-y-md">
                  {tasks.filter(t => t.status === 'running' || t.status === 'in_progress').slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-start gap-md">
                      <div className="w-1 bg-primary h-8 rounded-full" />
                      <div>
                        <p className="text-body-sm font-semibold">{t.title}</p>
                        <p className="text-[12px] text-on-surface-variant">{t.assignee || 'Unassigned'}</p>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === 'running' || t.status === 'in_progress').length === 0 ? (
                    <p className="text-body-sm text-on-surface-variant italic opacity-60">No active tasks</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* AI Efficiency Card */}
            <div className="bg-primary overflow-hidden rounded-2xl relative p-lg text-on-primary">
              <div className="relative z-10">
                <h4 className="font-label-md text-on-primary/80 uppercase tracking-widest mb-md">AI Efficiency</h4>
                <div className="text-display-lg text-[40px] mb-xs">{efficiencyPct}%</div>
                <p className="font-body-sm text-on-primary/70">Autonomous tasks completed without human intervention this week.</p>
                <div className="mt-lg h-2 bg-surface-container-lowest/20 rounded-full overflow-hidden">
                  <div className="h-full bg-surface-container-lowest" style={{ width: `${efficiencyPct}%` }} />
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
              </div>
            </div>

            {/* Agent Allocation */}
            {agentAllocs.length > 0 ? (
              <div className="bg-surface-container-low rounded-2xl p-lg border border-outline-variant/20">
                <h4 className="font-headline-md text-[16px] text-on-surface mb-md">Agent Allocation</h4>
                <div className="space-y-sm">
                  {agentAllocs.map(a => (
                    <div key={a.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-body-sm text-on-surface-variant">{a.name}</span>
                        <span className={`font-label-md ${a.textColor}`}>{a.pct}%</span>
                      </div>
                      <div className="w-full h-1 bg-outline-variant/30 rounded-full">
                        <div className={`h-full ${a.color} rounded-full`} style={{ width: `${a.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        )}
      </div>

      {/* Task Detail Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedTaskId(null)}>
          <div className="bg-black/20 absolute inset-0" />
          <div className="relative w-[400px] bg-surface-container-lowest shadow-2xl border-l border-outline-variant/20 p-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-headline-md text-on-surface font-bold">Task Detail</h3>
              <button aria-label="Close drawer" className="p-sm rounded-lg hover:bg-surface-container text-on-surface-variant" onClick={() => setSelectedTaskId(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-md">
              <div>
                <span className="text-label-sm text-on-surface-variant">Title</span>
                <p className="font-body-lg text-on-surface font-bold mt-xs">{'title' in selectedTask ? selectedTask.title : (selectedTask as any).prompt?.slice(0, 80) ?? 'Background Task'}</p>
              </div>
              <div>
                <span className="text-label-sm text-on-surface-variant">Status</span>
                <p className="font-body-md text-on-surface mt-xs capitalize">{selectedTask.status}</p>
              </div>
              {'description' in selectedTask && selectedTask.description && (
                <div>
                  <span className="text-label-sm text-on-surface-variant">Description</span>
                  <p className="font-body-md text-on-surface mt-xs">{(selectedTask as any).description}</p>
                </div>
              )}
              {'priority' in selectedTask && selectedTask.priority && (
                <div>
                  <span className="text-label-sm text-on-surface-variant">Priority</span>
                  <p className="font-body-md text-on-surface mt-xs capitalize">{(selectedTask as any).priority}</p>
                </div>
              )}
              {'assignee' in selectedTask && selectedTask.assignee && (
                <div>
                  <span className="text-label-sm text-on-surface-variant">Assignee</span>
                  <p className="font-body-md text-on-surface mt-xs">{(selectedTask as any).assignee}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
