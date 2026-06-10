// OPC Task Detail — Agent workflow pipeline, execution log, wired to real task/agent data
import { useState, useEffect } from 'react'
import { cn } from '../lib/utils'
import { listAgents, listTasks } from '../lib/tauri-api'
import type { TaskItem } from '../lib/tauri-api'
import { Spinner } from './ui/spinner'

interface WorkflowStep {
  icon: string
  label: string
  sublabel: string
  active?: boolean
  pending?: boolean
}

interface LogEvent {
  icon: string
  title: string
  description: string
  active?: boolean
  pending?: boolean
}

interface OPCTaskPageProps {
  taskId?: string
}

export function OPCTaskPage({ taskId }: OPCTaskPageProps) {
  const [task, setTask] = useState<TaskItem | null>(null)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [executionLog, setExecutionLog] = useState<LogEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      listTasks().catch((): TaskItem[] => []),
      listAgents().catch(() => []),
    ]).then(([tasks, agents]) => {
      // Find specific task or use first in-progress / first task
      const target = taskId
        ? tasks.find(t => t.id === taskId) ?? null
        : tasks.find(t => t.status === 'in_progress') ?? tasks[0] ?? null
      setTask(target)

      // Build workflow from agent statuses
      const steps: WorkflowStep[] = agents.length > 0
        ? agents.map(a => ({
            icon: 'smart_toy',
            label: a.name,
            sublabel: a.status === 'running' ? 'Running' : a.status === 'completed' ? 'Done' : 'Idle',
            active: a.status === 'running',
            pending: a.status !== 'running' && a.status !== 'completed',
          }))
        : [
            { icon: 'account_tree', label: 'Planning', sublabel: 'Analysis', pending: true },
            { icon: 'code', label: 'Implementation', sublabel: 'Building', pending: true },
            { icon: 'verified_user', label: 'Review', sublabel: 'Verification', pending: true },
          ]
      setWorkflowSteps(steps)

      // Build execution log from tasks
      const log: LogEvent[] = tasks.slice(0, 6).map(t => ({
        icon: t.status === 'completed' ? 'check_circle' : t.status === 'in_progress' ? 'sync' : t.status === 'failed' ? 'error' : 'schedule',
        title: t.title || t.id,
        description: t.description || `Task ${t.status}`,
        active: t.status === 'in_progress',
        pending: t.status === 'pending',
      }))
      setExecutionLog(log)
      setLoading(false)
    })
  }, [taskId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center space-y-md3-md">
          <Spinner className="h-8 w-8 mx-auto" />
          <p className="text-body-md text-md3-on-surface-variant">Loading task details...</p>
        </div>
      </div>
    )
  }

  const activeStepIndex = workflowSteps.findIndex(s => s.active)

  return (
    <div className="flex-1 w-full bg-md3-background overflow-y-auto h-full px-md3-lg py-md3-xl">
      <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-md3-lg pb-10">

          {/* Left Column — Main Content */}
          <div className="xl:col-span-8 flex flex-col gap-md3-lg">

            {/* Agent Workflow Card */}
            <div className="bg-white rounded-2xl p-md3-xl border border-md3-outline-variant/30 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-[20px] text-md3-on-surface">account_tree</span>
                <h3 className="text-headline-md text-[20px] font-bold text-md3-on-surface">Agent Workflow</h3>
              </div>

              <div className="relative flex items-center justify-between mb-10 px-4 md:px-10">
                <div className="absolute left-10 md:left-16 right-10 md:right-16 top-6 h-0.5 bg-md3-outline-variant/20 z-0" />
                <div className="absolute left-10 md:left-16 top-6 h-0.5 bg-md3-primary z-0" style={{ width: `${(activeStepIndex / Math.max(workflowSteps.length - 1, 1)) * 100}%` }} />

                {workflowSteps.map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                    {step.active ? (
                      <div className="w-16 h-16 rounded-full bg-md3-primary/10 flex items-center justify-center -mt-2">
                        <div className="w-12 h-12 rounded-full bg-md3-primary text-md3-on-primary flex items-center justify-center shadow-md">
                          <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                        step.pending
                          ? 'border border-md3-outline-variant bg-md3-surface-container text-md3-on-surface-variant'
                          : 'border border-md3-primary bg-white text-md3-primary'
                      )}>
                        <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                      </div>
                    )}
                    <span className={cn(
                      'text-label-sm text-[12px]',
                      step.active ? 'text-md3-primary font-bold' : step.pending ? 'text-md3-on-surface-variant' : 'text-md3-on-surface'
                    )}>{step.label}</span>
                  </div>
                ))}
              </div>

              {/* Score Bar */}
              <div className="bg-md3-surface-container/50 rounded-xl p-md3-md border border-md3-outline-variant/30 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-body-sm text-[13px] text-md3-on-surface">Workflow Progress</span>
                  <span className="text-label-md text-[14px] font-bold text-md3-primary">{workflowSteps.length > 0 ? Math.round(((activeStepIndex + 1) / workflowSteps.length) * 100) : 0}%</span>
                </div>
                <div className="h-2 w-full bg-md3-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-md3-primary rounded-full" style={{ width: `${workflowSteps.length > 0 ? ((activeStepIndex + 1) / workflowSteps.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Task Description */}
            <div className="bg-white rounded-2xl p-md3-xl border border-md3-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-md3-on-surface">description</span>
                  <h3 className="text-headline-md text-[20px] font-bold text-md3-on-surface">Task Description</h3>
                </div>
              </div>
              <div className="text-body-md text-[15px] text-md3-on-surface-variant space-y-4 leading-relaxed">
                {task ? (
                  <>
                    <h4 className="text-headline-sm text-md3-on-surface">{task.title || task.id}</h4>
                    <p>{task.description || 'No description provided.'}</p>
                    <div className="flex gap-sm flex-wrap">
                      <span className={cn(
                        'px-sm py-xs text-label-sm rounded-lg',
                        task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        task.status === 'in_progress' ? 'bg-md3-primary/10 text-md3-primary' :
                        task.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-md3-surface-container-high text-md3-on-surface-variant'
                      )}>
                        {task.status}
                      </span>
                      {task.assignee && <span className="px-sm py-xs text-label-sm rounded-lg bg-md3-surface-container text-md3-on-surface-variant">Assigned: {task.assignee}</span>}
                    </div>
                  </>
                ) : (
                  <p className="text-md3-on-surface-variant italic">No task selected. Select a task from the Kanban board.</p>
                )}
              </div>
            </div>

            {/* Execution Log */}
            <div className="bg-white rounded-2xl p-md3-xl border border-md3-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-md3-on-surface">receipt_long</span>
                  <h3 className="text-headline-md text-[20px] font-bold text-md3-on-surface">Execution Log</h3>
                </div>
                <span className="bg-md3-surface-container text-md3-on-surface-variant text-label-sm text-[11px] px-3 py-1 rounded-full border border-md3-outline-variant/20">{executionLog.length} Events</span>
              </div>

              {executionLog.length > 0 ? (
                <div className="relative pl-0 md:pl-2 space-y-10">
                  <div className="absolute left-[15px] md:left-[23px] top-4 bottom-8 w-px bg-md3-outline-variant/30" />
                  {executionLog.map((event, i) => (
                    <div key={i} className={cn('relative flex items-start gap-4', event.pending && 'opacity-50')}>
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 md:ml-2',
                        event.active
                          ? 'bg-md3-primary text-md3-on-primary shadow-sm ring-4 ring-md3-primary/10'
                          : event.pending
                            ? 'border-2 border-dashed border-md3-outline-variant/60 bg-md3-surface text-md3-on-surface-variant'
                            : 'border-2 border-md3-outline-variant/40 bg-white text-md3-primary'
                      )}>
                        <span className="material-symbols-outlined text-[16px]">{event.icon}</span>
                      </div>
                      <div className="flex-1 -mt-1">
                        <h4 className={cn(
                          'text-label-md text-[14px]',
                          event.active ? 'text-md3-primary font-bold' : event.pending ? 'text-md3-on-surface-variant' : 'text-md3-on-surface'
                        )}>{event.title}</h4>
                        <p className={cn('text-body-sm text-[14px] mt-1 leading-relaxed', event.pending ? 'text-md3-on-surface-variant italic' : 'text-md3-on-surface-variant')}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-md3-lg">
                  <p className="text-label-sm text-md3-on-surface-variant/60 italic">No execution events yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Sidebar Panels */}
          <div className="xl:col-span-4 flex flex-col gap-md3-lg">

            {/* Task Info Panel */}
            <div className="bg-white rounded-2xl p-md3-xl border border-md3-outline-variant/30 shadow-sm flex flex-col gap-md3-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[20px] text-md3-primary">inventory_2</span>
                <h3 className="text-headline-md text-[18px] font-bold text-md3-on-surface">Task Info</h3>
              </div>
              {task ? (
                <div className="space-y-sm text-label-sm">
                  <div className="flex justify-between">
                    <span className="text-md3-on-surface-variant">ID</span>
                    <span className="text-md3-on-surface font-mono">{task.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-md3-on-surface-variant">Status</span>
                    <span className="text-md3-on-surface capitalize">{task.status}</span>
                  </div>
                  {task.assignee && (
                    <div className="flex justify-between">
                      <span className="text-md3-on-surface-variant">Assignee</span>
                      <span className="text-md3-on-surface">{task.assignee}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-label-sm text-md3-on-surface-variant/60 italic">No task selected</p>
              )}
            </div>

            {/* Efficiency Metrics */}
            <div className="bg-white rounded-2xl p-md3-xl border border-md3-outline-variant/30 shadow-sm flex flex-col gap-md3-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[20px] text-md3-primary">monitoring</span>
                <h3 className="text-headline-md text-[18px] font-bold text-md3-on-surface">Metrics</h3>
              </div>
              <div className="grid grid-cols-2 gap-sm">
                <div className="bg-md3-surface-container/50 rounded-xl p-md3-md border border-md3-outline-variant/20">
                  <div className="text-label-sm text-[10px] text-md3-on-surface-variant uppercase tracking-wider mb-2">Agents</div>
                  <div className="text-headline-md text-[18px] font-bold text-md3-on-surface mb-1">{workflowSteps.length}</div>
                  <div className="text-label-sm text-[10px] text-md3-on-surface-variant">{workflowSteps.filter(s => s.active).length} active</div>
                </div>
                <div className="bg-md3-surface-container/50 rounded-xl p-md3-md border border-md3-outline-variant/20">
                  <div className="text-label-sm text-[10px] text-md3-on-surface-variant uppercase tracking-wider mb-2">Progress</div>
                  <div className="text-headline-md text-[18px] font-bold text-md3-on-surface mb-1">{workflowSteps.length > 0 ? Math.round(((activeStepIndex + 1) / workflowSteps.length) * 100) : 0}%</div>
                  <div className="text-label-sm text-[10px] text-md3-on-surface-variant">{activeStepIndex + 1}/{workflowSteps.length} steps</div>
                </div>
                <div className="bg-md3-surface-container/50 rounded-xl p-md3-md border border-md3-outline-variant/20">
                  <div className="text-label-sm text-[10px] text-md3-on-surface-variant uppercase tracking-wider mb-2">Tasks</div>
                  <div className="text-headline-md text-[18px] font-bold text-md3-on-surface mb-1">{executionLog.length}</div>
                  <div className="text-label-sm text-[10px] text-md3-on-surface-variant">{executionLog.filter(e => e.active).length} active</div>
                </div>
                <div className="bg-md3-surface-container/50 rounded-xl p-md3-md border border-md3-outline-variant/20">
                  <div className="text-label-sm text-[10px] text-md3-on-surface-variant uppercase tracking-wider mb-2">Status</div>
                  <div className="text-headline-md text-[18px] font-bold text-md3-on-surface mb-1 capitalize">{task?.status || 'N/A'}</div>
                  <div className="text-label-sm text-[10px] text-md3-on-surface-variant">{task?.assignee || 'Unassigned'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
