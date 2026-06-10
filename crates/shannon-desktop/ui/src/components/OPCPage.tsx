// OPC Page — Agent swarm overview with kanban board, wired to real task/agent data
import { useState, useEffect } from 'react'
import { cn } from '../lib/utils'
import type { PageId } from './AppSidebar'
import { listTasks, listAgents } from '../lib/tauri-api'
import type { TaskItem } from '../lib/tauri-api'
import { Spinner } from './ui/spinner'

interface AgentCard {
  name: string
  status: string
  task?: string
  model: string
}

interface KanbanTask {
  id: string
  title: string
  status: string
  assignee?: string
  description?: string
}

const STATUS_COLUMNS: { key: string; title: string; dotColor: string }[] = [
  { key: 'pending', title: 'To Do', dotColor: 'bg-md3-secondary' },
  { key: 'in_progress', title: 'In Progress', dotColor: 'bg-md3-primary' },
  { key: 'completed', title: 'Done', dotColor: 'bg-emerald-500' },
  { key: 'failed', title: 'Failed', dotColor: 'bg-md3-error' },
]

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-md3-surface-container-high text-md3-on-surface-variant' },
  in_progress: { label: 'Active', color: 'bg-md3-primary/10 text-md3-primary' },
  completed: { label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
}

interface OPCPageProps {
  onNavigate?: (page: PageId) => void
}

export function OPCPage({ onNavigate }: OPCPageProps) {
  const [agents, setAgents] = useState<AgentCard[]>([])
  const [tasks, setTasks] = useState<KanbanTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      listAgents().catch(() => []),
      listTasks().catch((): TaskItem[] => []),
    ]).then(([agentList, taskList]) => {
      setAgents(agentList.map(a => ({
        name: a.name,
        status: a.status,
        task: a.task,
        model: a.model,
      })))
      setTasks(taskList.map(t => ({
        id: t.id,
        title: t.title || t.id,
        status: t.status,
        assignee: t.assignee,
        description: t.description,
      })))
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center space-y-md3-md">
          <Spinner className="h-8 w-8 mx-auto" />
          <p className="text-body-md text-md3-on-surface-variant">Loading project data...</p>
        </div>
      </div>
    )
  }

  const runningAgents = agents.filter(a => a.status === 'running')
  const tasksByStatus = STATUS_COLUMNS.map(col => ({
    ...col,
    tasks: tasks.filter(t => t.status === col.key),
  }))

  return (
    <div className="flex-1 w-full bg-md3-background overflow-y-auto h-full px-md3-lg py-md3-xl">
      <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">

        {/* Mission Statement */}
        <div className="glass-card bg-white/70 backdrop-blur-md rounded-2xl p-md3-xl mb-md3-lg border border-md3-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-2 mb-2 uppercase text-label-sm text-md3-on-surface-variant font-bold tracking-widest">
            <span className="w-1.5 h-1.5 bg-md3-outline-variant rotate-45 block" />
            Project Overview
            <span className="ml-auto text-label-sm font-normal normal-case">{agents.length} agents &middot; {tasks.length} tasks</span>
          </div>
          <h2 className="text-headline-lg text-[28px] font-bold text-md3-on-surface mt-2">
            {runningAgents.length > 0
              ? `${runningAgents.length} agent${runningAgents.length > 1 ? 's' : ''} currently active`
              : 'No agents currently running'}
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-md3-lg items-start">

          {/* Agent Swarm List */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-label-md text-[14px] font-bold text-md3-on-surface-variant">Agent Swarm</h3>
              <span className="bg-md3-secondary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{agents.length} Total</span>
            </div>

            {agents.length > 0 ? (
              <div className="space-y-sm">
                {agents.map((agent) => (
                  <div key={agent.name + agent.model} className="glass-card bg-white/70 backdrop-blur-md border border-md3-outline-variant/20 rounded-xl p-md3-md flex flex-col shadow-sm cursor-pointer hover:border-md3-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-sm">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          agent.status === 'running' ? 'bg-md3-primary/10' : 'bg-md3-surface-container'
                        )}>
                          <span className="material-symbols-outlined text-[20px] text-md3-on-surface-variant opacity-70">smart_toy</span>
                        </div>
                        <div>
                          <div className="text-label-md text-[14px] font-bold text-md3-on-surface">{agent.name}</div>
                          <div className="text-label-sm text-[11px] text-md3-on-surface-variant">{agent.model}</div>
                        </div>
                      </div>
                      <span className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        agent.status === 'running' ? 'bg-emerald-500' : agent.status === 'completed' ? 'bg-md3-outline-variant' : 'bg-md3-tertiary'
                      )} />
                    </div>
                    {agent.task && (
                      <div className="flex items-center gap-2">
                        <div className={cn('w-1 h-3 rounded-full shrink-0', agent.status === 'running' ? 'bg-emerald-500' : 'bg-md3-outline-variant')} />
                        <span className="text-label-sm text-[12px] text-md3-on-surface-variant truncate">
                          {agent.task}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-md3-xl">
                <span className="material-symbols-outlined text-[32px] text-md3-on-surface-variant/30">smart_toy</span>
                <p className="text-label-sm text-md3-on-surface-variant/60 mt-sm">No agents configured</p>
              </div>
            )}
          </div>

          {/* Kanban Board */}
          <div className="flex-1 w-full flex flex-col min-w-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-label-md text-[14px] font-bold text-md3-on-surface-variant uppercase tracking-widest">Kanban</h3>
              <span className="text-label-sm text-md3-on-surface-variant">{tasks.length} tasks</span>
            </div>

            {tasks.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
                {tasksByStatus.map((col) => (
                  <div key={col.key} className="w-[280px] shrink-0 bg-md3-surface-container/30 rounded-xl p-xs">
                    <div className="flex justify-between items-center px-2 py-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', col.dotColor)} />
                        <span className="text-label-md text-[14px] font-bold text-md3-on-surface">{col.title}</span>
                      </div>
                      <span className="text-label-sm text-[11px] text-md3-on-surface-variant">{col.tasks.length}</span>
                    </div>

                    {col.tasks.length === 0 ? (
                      <div className="flex items-center justify-center p-xl mt-xl">
                        <p className="text-label-sm text-[12px] text-md3-on-surface-variant italic opacity-60">Empty</p>
                      </div>
                    ) : (
                      col.tasks.map((task) => {
                        const cfg = PRIORITY_CONFIG[task.status] || PRIORITY_CONFIG.pending
                        return (
                          <div
                            key={task.id}
                            className="bg-white rounded-xl p-md3-md border border-md3-outline-variant/30 shadow-sm mb-3 cursor-pointer hover:border-md3-primary/50 hover:shadow-md transition-all group"
                            onClick={() => onNavigate?.('opc-task')}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', cfg.color)}>
                                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                              </div>
                              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider', cfg.color)}>
                                {cfg.label}
                              </span>
                            </div>
                            <h4 className="text-label-md text-[15px] font-bold mb-2 leading-tight group-hover:text-md3-primary transition-colors">{task.title}</h4>
                            {task.description && (
                              <p className="text-label-sm text-[11px] text-md3-on-surface-variant line-clamp-2">{task.description}</p>
                            )}
                            {task.assignee && (
                              <div className="flex justify-between items-center mt-3">
                                <span className="text-label-sm text-[11px] text-md3-on-surface-variant">
                                  Assigned to <strong className="text-md3-on-surface">{task.assignee}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-md3-xl">
                <span className="material-symbols-outlined text-[32px] text-md3-on-surface-variant/30">task_alt</span>
                <p className="text-label-sm text-md3-on-surface-variant/60 mt-sm">No tasks yet. Start a session to create tasks.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
