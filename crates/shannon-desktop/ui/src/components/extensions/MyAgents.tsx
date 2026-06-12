import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'

export default function MyAgents() {
  const { agents, backgroundTasks } = useApp()

  const statusFor = (status: string) => {
    switch (status) {
      case 'active': case 'running': return { color: 'bg-green-500 animate-pulse', bg: 'bg-green-100 text-green-700', label: 'Active' }
      case 'idle': return { color: 'bg-outline', bg: 'bg-surface-container-high text-on-surface-variant', label: 'Idle' }
      case 'error': return { color: 'bg-error', bg: 'bg-red-100 text-red-700', label: 'Error' }
      default: return { color: 'bg-outline', bg: 'bg-surface-container-high text-on-surface-variant', label: status }
    }
  }

  const iconFor = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('research')) return 'query_stats'
    if (n.includes('cod')) return 'code'
    if (n.includes('plan') || n.includes('sched')) return 'schedule'
    if (n.includes('test')) return 'bug_report'
    if (n.includes('design')) return 'palette'
    if (n.includes('data')) return 'database'
    return 'smart_toy'
  }

  const iconBgFor = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('research')) return 'bg-primary-container/20 text-primary'
    if (n.includes('cod') || n.includes('dev')) return 'bg-secondary-container/20 text-secondary'
    if (n.includes('plan') || n.includes('pa')) return 'bg-tertiary-container/20 text-tertiary'
    return 'bg-primary-container/20 text-primary'
  }

  const completedTasks = backgroundTasks.filter(t => t.status === 'completed').length
  const totalTasks = backgroundTasks.length

  return (
    <div className="max-w-[1200px] mx-auto px-lg py-xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg mb-xl">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">My Agents</h2>
          <p className="text-body-md text-on-surface-variant">Manage and monitor your deployed autonomous intelligence units.</p>
        </div>
        <div className="flex items-center gap-md">
          <span className="font-label-md text-on-surface-variant">{agents.length} agent{agents.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Agents Bento Grid */}
      {agents.length === 0 ? (
        <div className="text-center py-xl">
          <span className="material-symbols-outlined text-[48px] text-outline-variant">smart_toy</span>
          <p className="font-body-md text-on-surface-variant mt-md">No agents running.</p>
          <p className="font-body-sm text-on-surface-variant opacity-60">Agents will appear here when spawned via team coordination or background tasks.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {agents.map(agent => {
              const st = statusFor(agent.status)
              return (
                <div key={agent.id} className="glass-card p-lg rounded-xl shadow-sm flex flex-col group hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex justify-between items-start mb-md">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgFor(agent.name)}`}>
                      <span className="material-symbols-outlined text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>{iconFor(agent.name)}</span>
                    </div>
                    <div className={`flex items-center gap-xs px-sm py-1 rounded-full ${st.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${st.color}`} />
                      <span className="text-label-sm">{st.label}</span>
                    </div>
                  </div>

                  <div className="mb-lg">
                    <h3 className="text-headline-md font-headline-md">{agent.name}</h3>
                    <p className="text-label-sm text-on-surface-variant">{agent.model || 'Default Model'} · Autonomous</p>
                  </div>

                  <div className="space-y-sm mb-lg">
                    {agent.task ? (
                      <div className="flex justify-between items-center text-label-md">
                        <span className="text-on-surface-variant">Current Task</span>
                        <span className="font-bold truncate max-w-[140px]">{agent.task}</span>
                      </div>
                    ) : null}
                    {agent.progress != null ? (
                      <div className="flex justify-between items-center text-label-md">
                        <span className="text-on-surface-variant">Progress</span>
                        <div className="flex items-center gap-sm">
                          <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${agent.progress}%` }} />
                          </div>
                          <span className="font-bold">{agent.progress}%</span>
                        </div>
                      </div>
                    ) : null}
                    {agent.tools_used != null ? (
                      <div className="flex justify-between items-center text-label-md">
                        <span className="text-on-surface-variant">Tools Used</span>
                        <span className="font-bold">{agent.tools_used}</span>
                      </div>
                    ) : null}
                    {agent.duration != null ? (
                      <div className="flex justify-between items-center text-label-md">
                        <span className="text-on-surface-variant">Duration</span>
                        <span className="font-bold">{agent.duration > 60000 ? `${(agent.duration / 60000).toFixed(1)}m` : `${(agent.duration / 1000).toFixed(0)}s`}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-auto pt-md border-t border-outline-variant flex gap-sm">
                    <Button variant="ghost" className="flex-grow py-2 rounded-lg bg-surface-variant/50 font-bold text-label-md hover:bg-surface-variant transition-colors cursor-pointer">Configure</Button>
                    <Button variant="ghost" className="p-2 rounded-lg border border-outline-variant hover:text-primary transition-colors cursor-pointer flex items-center justify-center">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </Button>
                  </div>
                </div>
              )
            })}

            {/* Add New Agent */}
            <div className="border-2 border-dashed border-outline-variant p-lg rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container/20 group-hover:text-primary transition-colors mb-md">
                <span className="material-symbols-outlined text-[32px]">add</span>
              </div>
              <h3 className="text-body-lg font-bold">New Specialization</h3>
              <p className="text-label-md text-on-surface-variant max-w-[200px]">Define a custom prompt or import a model to create a new agent.</p>
            </div>
          </div>

          {/* Performance Section */}
          <section className="mt-xl grid grid-cols-1 lg:grid-cols-3 gap-lg mb-8">
            <div className="lg:col-span-2 glass-card p-xl rounded-xl">
              <h4 className="text-body-lg font-bold mb-lg flex items-center gap-md">
                <span className="material-symbols-outlined text-primary">insights</span>
                Agent Performance
              </h4>

              {backgroundTasks.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-on-surface-variant opacity-60">
                  <p className="text-body-sm">No task execution data yet.</p>
                </div>
              ) : (
                <div className="space-y-sm">
                  {backgroundTasks.slice(0, 5).map(bt => (
                    <div key={bt.task_id} className="flex items-center gap-md">
                      <span className="font-label-sm text-on-surface-variant w-24 truncate">{bt.prompt.slice(0, 20)}</span>
                      <div className="flex-grow h-4 bg-surface-container-low rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${bt.status === 'completed' ? 'bg-primary' : bt.status === 'running' ? 'bg-primary/60 animate-pulse' : 'bg-error/60'}`}
                          style={{ width: bt.status === 'completed' ? '100%' : bt.status === 'running' ? '60%' : '30%' }}
                        />
                      </div>
                      <span className={`font-label-sm font-bold w-16 text-right ${bt.status === 'completed' ? 'text-primary' : bt.status === 'running' ? 'text-primary/60' : 'text-error'}`}>
                        {bt.status === 'completed' ? 'Done' : bt.status === 'running' ? 'Active' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-xl rounded-xl">
              <h4 className="text-body-lg font-bold mb-lg">Task Completion</h4>
              <div className="text-center py-lg">
                <div className="text-display-lg text-[48px] text-primary font-bold">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</div>
                <p className="text-on-surface-variant text-body-sm mt-sm">{completedTasks} of {totalTasks} tasks completed</p>
              </div>
              <div className="mt-lg h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }} />
              </div>
              <Button variant="ghost" className="w-full mt-lg text-primary text-label-md font-bold hover:underline cursor-pointer text-left">View All Tasks →</Button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
