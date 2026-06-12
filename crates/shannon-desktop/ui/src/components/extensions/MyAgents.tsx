import { Button } from '@/components/ui/button'
import { useApp } from '@/context/AppContext'

export default function MyAgents() {
  const { agents } = useApp()

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

  return (
    <div className="max-w-[1200px] mx-auto px-lg py-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg mb-xl">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">My Agents</h2>
          <p className="text-body-md text-on-surface-variant">Manage and monitor your deployed autonomous intelligence units.</p>
        </div>
        <div className="flex items-center gap-md">
          <span className="font-label-md text-on-surface-variant">{agents.length} agent{agents.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-xl">
          <span className="material-symbols-outlined text-[48px] text-outline-variant">smart_toy</span>
          <p className="font-body-md text-on-surface-variant mt-md">No agents running.</p>
          <p className="font-body-sm text-on-surface-variant opacity-60">Agents will appear here when spawned via team coordination or background tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {agents.map(agent => {
            const st = statusFor(agent.status)
            return (
              <div key={agent.id} className="glass-card p-lg rounded-xl shadow-sm flex flex-col group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-md">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>{iconFor(agent.name)}</span>
                  </div>
                  <div className={`flex items-center gap-xs px-sm py-1 rounded-full ${st.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${st.color}`} />
                    <span className="text-label-sm">{st.label}</span>
                  </div>
                </div>

                <div className="mb-lg">
                  <h3 className="text-headline-md font-headline-md">{agent.name}</h3>
                  <p className="text-label-sm text-on-surface-variant">ID: {agent.id}</p>
                </div>

                {agent.task ? (
                  <div className="mb-lg p-sm bg-surface-container-low rounded-lg">
                    <p className="text-label-sm text-on-surface-variant">Current task</p>
                    <p className="text-label-md text-on-surface font-medium truncate">{agent.task}</p>
                  </div>
                ) : null}

                <div className="mt-auto pt-md border-t border-outline-variant flex gap-sm">
                  <Button variant="ghost" className="flex-grow py-2 rounded-lg bg-surface-variant/50 font-bold text-label-md hover:bg-surface-variant transition-colors cursor-pointer">
                    Details
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
