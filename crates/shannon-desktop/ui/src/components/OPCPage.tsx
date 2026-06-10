// OPC Page — Agent swarm overview with kanban board
import { cn } from '../lib/utils'
import type { PageId } from './AppSidebar'

interface AgentCard {
  role: string
  func: string
  status: string
  statusColor: string
  dotColor: string
  iconBg: string
  icon?: string
}

const AGENTS: AgentCard[] = [
  { role: 'CEO', func: 'Strategic Planning', status: 'Finalizing Q4 Roadmap', statusColor: 'text-md3-primary', dotColor: 'bg-emerald-500', iconBg: 'bg-md3-primary/10' },
  { role: 'CTO', func: 'Architecture', status: 'Deploying Edge V2.4', statusColor: 'text-md3-secondary', dotColor: 'bg-emerald-500', iconBg: 'bg-md3-secondary/10' },
  { role: 'PM', func: 'User Experience', status: 'Idle — waiting for output', statusColor: 'text-md3-on-surface-variant', dotColor: 'bg-md3-outline-variant', iconBg: 'bg-md3-surface-container', icon: 'edit_square' },
  { role: 'SDE', func: 'Feature Implementation', status: 'Reviewing Code: PR-422', statusColor: 'text-emerald-600', dotColor: 'bg-emerald-500', iconBg: 'bg-orange-100', icon: 'code' },
  { role: 'Designer', func: 'Experience Design', status: 'Designing User Flow v2.0', statusColor: 'text-md3-primary', dotColor: 'bg-emerald-500', iconBg: 'bg-md3-primary/10', icon: 'palette' },
  { role: 'QA', func: 'Quality Assurance', status: 'Running regression tests', statusColor: 'text-emerald-600', dotColor: 'bg-emerald-500', iconBg: 'bg-blue-100', icon: 'bug_report' },
  { role: 'Operations', func: 'Growth & Ops', status: 'Preparing Launch Campaign', statusColor: 'text-emerald-600', dotColor: 'bg-emerald-500', iconBg: 'bg-orange-50', icon: 'trending_up' },
  { role: 'DevOps', func: 'Infrastructure', status: 'Scaling edge clusters', statusColor: 'text-emerald-600', dotColor: 'bg-emerald-500', iconBg: 'bg-md3-surface-container', icon: 'cloud' },
]

interface KanbanTask {
  id: string
  title: string
  priority: string
  priorityColor: string
  icon?: string
  proposer?: string
  time?: string
  progress?: number
  agent?: string
}

const KANBAN_COLUMNS: { title: string; dotColor: string; tasks: KanbanTask[] }[] = [
  {
    title: 'To Do',
    dotColor: 'bg-md3-secondary',
    tasks: [
      { id: 'T-1', title: 'Revamp Landing Page Hero', priority: 'Moderate', priorityColor: 'bg-md3-secondary/10 text-md3-secondary', icon: 'edit_square', proposer: 'PM', time: '45m ago' },
    ],
  },
  {
    title: 'Pending',
    dotColor: 'bg-orange-500',
    tasks: [
      { id: 'T-2', title: 'Upgrade API Rate Limits', priority: 'Critical', priorityColor: 'bg-red-100 text-red-700', icon: 'api', proposer: 'CTO', time: '2h ago' },
    ],
  },
  {
    title: 'In Progress',
    dotColor: 'bg-md3-primary',
    tasks: [
      { id: 'T-3', title: 'Refactoring Module v2', priority: 'Active', priorityColor: 'bg-md3-primary/10 text-md3-primary', progress: 65, agent: 'Engineer' },
      { id: 'T-4', title: 'Database Indexing Sweep', priority: 'Active', priorityColor: 'bg-md3-secondary/10 text-md3-secondary', progress: 20, agent: 'DevOps' },
    ],
  },
  {
    title: 'Done',
    dotColor: 'bg-emerald-500',
    tasks: [
      { id: 'T-5', title: 'Domain Registration', priority: 'Done', priorityColor: 'bg-emerald-100 text-emerald-700', proposer: 'Operations', time: '1d ago' },
    ],
  },
  {
    title: 'Deprecated',
    dotColor: 'bg-md3-outline-variant',
    tasks: [],
  },
]

interface OPCPageProps {
  onNavigate?: (page: PageId) => void
}

export function OPCPage({ onNavigate }: OPCPageProps) {
  return (
    <div className="flex-1 w-full bg-md3-background overflow-y-auto h-full px-md3-lg py-md3-xl">
      <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">

        {/* Mission Statement */}
        <div className="glass-card bg-white/70 backdrop-blur-md rounded-2xl p-md3-xl mb-md3-lg border border-md3-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-2 mb-2 uppercase text-label-sm text-md3-on-surface-variant font-bold tracking-widest">
            <span className="w-1.5 h-1.5 bg-md3-outline-variant rotate-45 block" />
            Project Mission
            <button className="ml-auto p-1 rounded-md hover:bg-md3-surface-container-high transition-colors" title="Edit mission">
              <span className="material-symbols-outlined text-[16px] text-md3-on-surface-variant">edit</span>
            </button>
          </div>
          <h2 className="text-headline-lg text-[28px] font-bold text-md3-on-surface mt-2 max-w-5xl">
            Build a high-performance AI code assistant with multi-provider LLM support and autonomous agent orchestration.
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-md3-lg items-start">

          {/* Agent Swarm List */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-label-md text-[14px] font-bold text-md3-on-surface-variant">Agent Swarm</h3>
              <span className="bg-md3-secondary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{AGENTS.length} Active</span>
            </div>

            <div className="space-y-sm">
              {AGENTS.map((agent) => (
                <div key={agent.role} className="glass-card bg-white/70 backdrop-blur-md border border-md3-outline-variant/20 rounded-xl p-md3-md flex flex-col shadow-sm cursor-pointer hover:border-md3-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-sm">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', agent.iconBg)}>
                        <span className="material-symbols-outlined text-[20px] text-md3-on-surface-variant opacity-70">{agent.icon ?? 'smart_toy'}</span>
                      </div>
                      <div>
                        <div className="text-label-md text-[14px] font-bold text-md3-on-surface">{agent.role}</div>
                        <div className="text-label-sm text-[11px] text-md3-on-surface-variant">{agent.func}</div>
                      </div>
                    </div>
                    <span className={cn('w-2 h-2 rounded-full shrink-0', agent.dotColor)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-1 h-3 rounded-full shrink-0', agent.dotColor)} />
                    <span className={cn('text-label-sm text-[12px]', agent.statusColor, agent.statusColor === 'text-md3-on-surface-variant' && 'italic opacity-80')}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 w-full flex flex-col min-w-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-label-md text-[14px] font-bold text-md3-on-surface-variant uppercase tracking-widest">Kanban</h3>
              <div className="flex items-center gap-xs">
                <button className="p-1.5 rounded-lg border border-md3-outline-variant/30 text-md3-on-surface-variant hover:bg-md3-surface-container-high hover:text-md3-primary transition-colors" title="Filter tasks">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                </button>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Quick inject task..."
                    className="bg-md3-surface-container-low border-none rounded-lg py-1.5 pl-3 pr-8 w-[200px] text-[13px] focus:ring-2 focus:ring-md3-primary/20 transition-all outline-none"
                  />
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-md3-primary text-md3-on-primary rounded-[4px] flex items-center justify-center hover:bg-md3-primary/90 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
              {KANBAN_COLUMNS.map((col) => (
                <div key={col.title} className="w-[280px] shrink-0 bg-md3-surface-container/30 rounded-xl p-xs">
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
                    col.tasks.map((task) => (
                      <div key={task.id} className="bg-white rounded-xl p-md3-md border border-md3-outline-variant/30 shadow-sm mb-3 cursor-pointer hover:border-md3-primary/50 hover:shadow-md transition-all group" onClick={() => onNavigate?.('opc-task')}>
                        <div className="flex justify-between items-start mb-2">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', task.priorityColor)}>
                            <span className="material-symbols-outlined text-[16px]">{task.icon ?? 'task_alt'}</span>
                          </div>
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider', task.priorityColor)}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="text-label-md text-[15px] font-bold mb-3 leading-tight group-hover:text-md3-primary transition-colors">{task.title}</h4>

                        {task.progress !== undefined && (
                          <div className="mb-2">
                            <div className="h-1.5 w-full bg-md3-surface-container rounded-full overflow-hidden mb-1">
                              <div className="h-full bg-md3-primary rounded-full" style={{ width: `${task.progress}%` }} />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-label-sm text-[10px] text-md3-on-surface-variant">{task.agent}</span>
                              <span className="text-label-sm text-[10px] font-bold text-md3-on-surface-variant">{task.progress}%</span>
                            </div>
                          </div>
                        )}

                        {(task.proposer || task.time) && (
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-label-sm text-[11px] text-md3-on-surface-variant">
                              {task.proposer && <>Proposed by <strong className="text-md3-on-surface">{task.proposer}</strong></>}
                            </span>
                            {task.time && (
                              <div className="flex items-center gap-1 text-md3-on-surface-variant">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                <span className="text-label-sm text-[10px]">{task.time}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
