import { useApp } from '@/context/AppContext'

export default function OPC() {
  const { agents, tasks } = useApp()

  // Group tasks by status for kanban columns
  const todoTasks = tasks.filter(t => t.status === 'pending' || t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'running')
  const doneTasks = tasks.filter(t => t.status === 'completed')
  const failedTasks = tasks.filter(t => t.status === 'failed' || t.status === 'error')

  const iconForAgent = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('research')) return 'query_stats'
    if (n.includes('cod') || n.includes('dev')) return 'code'
    if (n.includes('test') || n.includes('qa')) return 'bug_report'
    if (n.includes('design')) return 'palette'
    return 'smart_toy'
  }

  return (
    <div className="flex-1 w-full bg-background overflow-y-auto h-full px-lg py-xl">
      <div className="max-w-[1600px] mx-auto">

        {/* Agent Swarm */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-xl mb-lg border border-outline-variant/30 relative shadow-sm">
          <div className="flex items-center gap-3 mb-lg">
            <h3 className="font-label-md text-[14px] font-bold text-on-surface-variant">Agent Swarm</h3>
            <span className="bg-secondary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{agents.length} Active</span>
          </div>
          {agents.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">No agents running. Start a team coordination to see agents here.</p>
          ) : (
            <div className="flex flex-wrap gap-md">
              {agents.map(agent => {
                const isActive = agent.status === 'active' || agent.status === 'running'
                return (
                  <div key={agent.id} className="bg-white/70 backdrop-blur-md border border-outline-variant/20 rounded-xl p-md flex items-center gap-md shadow-sm cursor-pointer hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px] text-primary">{iconForAgent(agent.name)}</span>
                    </div>
                    <div>
                      <div className="font-label-md text-[14px] font-bold">{agent.name}</div>
                      <div className="flex items-center gap-sm">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-outline-variant'}`} />
                        <span className="font-label-sm text-[11px] text-on-surface-variant">{agent.status}</span>
                      </div>
                    </div>
                    {agent.task ? <span className="font-label-sm text-[12px] text-primary truncate max-w-[200px]">{agent.task}</span> : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-lg items-start">
          {/* Kanban Board */}
          <div className="flex-1 w-full flex flex-col min-w-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-label-md text-[14px] font-bold text-on-surface-variant uppercase tracking-widest">KANBAN</h3>
              <span className="font-label-sm text-on-surface-variant">{tasks.length} tasks</span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start min-h-[400px]">
              {/* To Do */}
              <KanbanColumn title="To Do" color="bg-secondary" count={todoTasks.length}>
                {todoTasks.map(task => <KanbanCard key={task.id} task={task} />)}
              </KanbanColumn>

              {/* In Progress */}
              <KanbanColumn title="In Progress" color="bg-primary" count={inProgressTasks.length}>
                {inProgressTasks.map(task => <KanbanCard key={task.id} task={task} />)}
              </KanbanColumn>

              {/* Done */}
              <KanbanColumn title="Done" color="bg-green-500" count={doneTasks.length}>
                {doneTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-xl p-3 border border-green-500/20 shadow-sm mb-3 flex items-center justify-between bg-green-50/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
                      <span className="font-label-md text-[13px] text-on-surface">{task.title}</span>
                    </div>
                  </div>
                ))}
              </KanbanColumn>

              {/* Failed */}
              {failedTasks.length > 0 ? (
                <KanbanColumn title="Failed" color="bg-error" count={failedTasks.length}>
                  {failedTasks.map(task => <KanbanCard key={task.id} task={task} />)}
                </KanbanColumn>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ title, color, count, children }: { title: string; color: string; count: number; children: React.ReactNode }) {
  return (
    <div className="w-[300px] shrink-0 bg-surface-container-lowest/50 rounded-xl p-xs border border-transparent hover:bg-surface-container-low/30 transition-colors">
      <div className="flex justify-between items-center px-2 py-3 mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          <span className="font-label-md text-[14px] font-bold">{title}</span>
        </div>
        <span className="font-label-sm text-[11px] text-on-surface-variant">{count}</span>
      </div>
      {children}
      {count === 0 ? (
        <div className="flex items-center justify-center p-xl mt-xl">
          <p className="font-label-sm text-[12px] text-on-surface-variant italic opacity-60">Empty</p>
        </div>
      ) : null}
    </div>
  )
}

function KanbanCard({ task }: { task: { id: string; title: string; description?: string; assignee?: string; priority?: string } }) {
  return (
    <div className="bg-white rounded-xl p-md border border-outline-variant/30 shadow-sm mb-3 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className="font-label-sm text-[10px] font-bold text-on-surface-variant tracking-wider">{task.id.slice(0, 8)}</span>
        {task.priority ? (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
            task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-surface-container text-on-surface-variant'
          }`}>{task.priority}</span>
        ) : null}
      </div>
      <h4 className="font-label-md text-[15px] font-bold mb-2 leading-tight">{task.title}</h4>
      {task.description ? <p className="font-body-sm text-[12px] text-on-surface-variant mb-2 leading-snug line-clamp-2">{task.description}</p> : null}
      {task.assignee ? (
        <span className="font-label-sm text-[11px] text-on-surface-variant">Assigned to <strong className="text-on-surface">{task.assignee}</strong></span>
      ) : null}
    </div>
  )
}
