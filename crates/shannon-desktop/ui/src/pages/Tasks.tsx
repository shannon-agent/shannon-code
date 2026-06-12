import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import * as api from '@/lib/tauri-api'

export default function Tasks() {
  const { tasks, backgroundTasks, agents, refreshTasks } = useApp()
  const [running, setRunning] = useState<string | null>(null)
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  const handleStartTask = async () => {
    const taskPrompt = window.prompt('Enter a task prompt for background execution:')
    if (!taskPrompt) return
    try {
      await api.startBackgroundTask(taskPrompt)
      await refreshTasks()
    } catch (e) { console.warn("Tasks error:", e) }
  }

  const handleCancelTask = async (id: string) => {
    try { await api.cancelBackgroundTask(id) } catch (e) { console.warn("Tasks error:", e) }
    await refreshTasks()
  }

  const handleRunNow = async (id: string) => {
    setRunning(id)
    setTimeout(() => setRunning(null), 2000)
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
            <Button className="px-md py-sm border border-outline-variant bg-white text-on-surface rounded-xl flex items-center gap-sm font-label-md cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
            </Button>
            <Button className="px-md py-sm border border-outline-variant bg-white text-on-surface rounded-xl flex items-center gap-sm font-label-md cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              Month View
            </Button>
            <Button className="px-md py-sm bg-primary text-white rounded-xl flex items-center gap-sm font-label-md cursor-pointer hover:shadow-md active:scale-95 transition-all" onClick={handleStartTask}>
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Background Task
            </Button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Tasks List */}
          <div className="col-span-12 lg:col-span-8 space-y-md">
            {tasks.length === 0 && backgroundTasks.length === 0 ? (
              <div className="text-center py-xl">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">task_alt</span>
                <p className="font-body-md text-on-surface-variant mt-md">No tasks yet.</p>
              </div>
            ) : null}

            {tasks.map(task => {
              const badge = statusBadge(task.status)
              const isRunning = running === task.id
              return (
                <div key={task.id} className="glass-panel border border-outline-variant/10 rounded-xl p-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group bg-white/80">
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
                          <Button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer" onClick={() => handleCancelTask(task.id)}>
                            <span className="material-symbols-outlined">stop_circle</span>
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

            {/* Background Tasks Execution Log */}
            {backgroundTasks.length > 0 ? (
              <div className="pt-lg">
                <h4 className="font-label-md text-label-md text-outline uppercase tracking-[0.1em] mb-md pl-xs">Task Execution Log</h4>
                <div className="relative pl-8 border-l border-outline-variant/30 space-y-lg ml-md">
                  {backgroundTasks.map(bt => {
                    const badge = statusBadge(bt.status)
                    return (
                      <div key={bt.task_id} className="relative">
                        <div className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-2 bg-white z-10 ${bt.status === 'running' ? 'border-blue-500 animate-pulse' : bt.status === 'completed' ? 'border-emerald-500' : bt.status === 'failed' ? 'border-red-500' : 'border-outline-variant'}`} />
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className={`font-label-sm text-label-sm mb-1 ${badge.bg.includes('blue') ? 'text-blue-500' : badge.bg.includes('emerald') ? 'text-emerald-600' : badge.bg.includes('red') ? 'text-error' : 'text-on-surface-variant'}`}>
                              {formatDate(bt.started_at)} — {badge.label.toUpperCase()}
                            </p>
                            <p className="text-on-surface-variant text-body-sm italic">{bt.prompt}</p>
                            {bt.output ? <pre className="mt-sm text-body-sm text-on-surface bg-surface-container-low p-sm rounded-lg max-h-[120px] overflow-auto">{bt.output}</pre> : null}
                          </div>
                          {bt.status === 'running' ? (
                            <Button className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant cursor-pointer" onClick={() => handleCancelTask(bt.task_id)}>
                              <span className="material-symbols-outlined">stop_circle</span>
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
            <div className="bg-white border border-outline-variant/30 rounded-2xl p-lg shadow-sm">
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <h4 className="font-headline-md text-[18px] text-on-surface">Schedule</h4>
                  <span className="font-label-sm text-on-surface-variant">{monthNames[viewMonth]} {viewYear}</span>
                </div>
                <div className="flex gap-sm">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] cursor-pointer hover:text-primary transition-colors" onClick={prevMonth}>chevron_left</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px] cursor-pointer hover:text-primary transition-colors" onClick={nextMonth}>chevron_right</span>
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
                <div className="mt-lg h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${efficiencyPct}%` }} />
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
      </div>
    </div>
  )
}
