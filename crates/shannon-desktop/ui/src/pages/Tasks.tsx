import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'
import * as api from '@/lib/tauri-api'

export default function Tasks() {
  const { tasks, backgroundTasks, agents, refreshTasks } = useApp()

  const handleStartTask = async () => {
    const taskPrompt = window.prompt('Enter a task prompt for background execution:')
    if (!taskPrompt) return
    try {
      await api.startBackgroundTask(taskPrompt)
      await refreshTasks()
    } catch { /* ignore */ }
  }

  const handleCancelTask = async (id: string) => {
    try { await api.cancelBackgroundTask(id) } catch { /* ignore */ }
    await refreshTasks()
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', label: 'Completed' }
      case 'running': case 'in_progress': return { bg: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500 animate-pulse', label: 'Running' }
      case 'failed': case 'error': return { bg: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500', label: 'Failed' }
      case 'pending': return { bg: 'bg-surface-container-highest text-on-surface-variant border-outline-variant/30', dot: 'bg-outline', label: 'Pending' }
      default: return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', label: status }
    }
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex-1 overflow-y-auto w-full pb-16">
      <div className="max-w-[1200px] mx-auto px-lg py-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-xl gap-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Tasks</h2>
            <p className="text-on-surface-variant mt-xs">Manage tasks and background execution.</p>
          </div>
          <div className="flex gap-sm">
            <Button
              className="px-md py-sm bg-primary text-white rounded-xl flex items-center gap-sm font-label-md cursor-pointer hover:shadow-md active:scale-95 transition-all"
              onClick={handleStartTask}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Background Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          {/* Tasks List */}
          <div className="col-span-12 lg:col-span-8 space-y-md">
            {/* Task Items from API */}
            {tasks.length === 0 && backgroundTasks.length === 0 ? (
              <div className="text-center py-xl">
                <span className="material-symbols-outlined text-[48px] text-outline-variant">task_alt</span>
                <p className="font-body-md text-on-surface-variant mt-md">No tasks yet.</p>
              </div>
            ) : null}

            {tasks.map(task => {
              const badge = statusBadge(task.status)
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
                              <span className="material-symbols-outlined text-[14px]">person</span>
                              {task.assignee}
                            </span>
                          ) : null}
                          {task.priority ? (
                            <span className={`font-label-sm text-[11px] font-bold uppercase tracking-wider ${task.priority === 'high' ? 'text-error' : task.priority === 'medium' ? 'text-amber-600' : 'text-on-surface-variant'}`}>
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
                    </div>
                  </div>
                  {task.description ? (
                    <p className="mt-sm text-body-sm text-on-surface-variant pl-[72px]">{task.description}</p>
                  ) : null}
                </div>
              )
            })}

            {/* Background Tasks */}
            {backgroundTasks.length > 0 ? (
              <div className="pt-lg">
                <h4 className="font-label-md text-label-md text-outline uppercase tracking-[0.1em] mb-md pl-xs">Background Execution</h4>
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
                            <p className="text-on-surface-variant text-body-sm">{bt.prompt}</p>
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
            {/* Active Agents */}
            <div className="bg-surface-container-low rounded-2xl p-lg border border-outline-variant/20">
              <h4 className="font-headline-md text-[16px] text-on-surface mb-md">Active Agents</h4>
              {agents.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">No agents running.</p>
              ) : (
                <div className="space-y-sm">
                  {agents.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-xs">
                      <span className="text-body-sm text-on-surface-variant">{a.name}</span>
                      <span className={`font-label-sm font-bold ${a.status === 'active' || a.status === 'running' ? 'text-primary' : 'text-on-surface-variant'}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Task Stats */}
            <div className="bg-primary overflow-hidden rounded-2xl relative p-lg text-on-primary">
              <div className="relative z-10">
                <h4 className="font-label-md text-on-primary/80 uppercase tracking-widest mb-md">Task Summary</h4>
                <div className="text-display-lg text-[40px] mb-xs">{tasks.length}</div>
                <p className="font-body-sm text-on-primary/70">Total tasks across all statuses.</p>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]" style={{fontVariationSettings: "'FILL' 1"}}>task_alt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
