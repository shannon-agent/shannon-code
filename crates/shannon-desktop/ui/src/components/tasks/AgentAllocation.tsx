// Agent workload breakdown — shows top agents and their equal-share percentage.
//
// MD3 tokens only. Renders nothing when no agents are present (caller controls
// visibility, but we also guard here).

import type { AgentInfo } from '@/types'

interface AgentAllocationProps {
  agents: AgentInfo[]
}

interface AgentAlloc {
  name: string
  pct: number
  color: string
  textColor: string
}

function computeAllocs(agents: AgentInfo[]): AgentAlloc[] {
  if (agents.length === 0) return []
  return agents.slice(0, 3).map((a, i) => ({
    name: a.name,
    pct: Math.round(100 / agents.length),
    color: ['bg-primary', 'bg-secondary', 'bg-tertiary'][i] ?? 'bg-primary',
    textColor: ['text-primary', 'text-secondary', 'text-tertiary'][i] ?? 'text-primary',
  }))
}

export default function AgentAllocation({ agents }: AgentAllocationProps) {
  const allocs = computeAllocs(agents)
  if (allocs.length === 0) return null
  return (
    <div className="bg-surface-container-low rounded-2xl p-lg border border-outline-variant/20">
      <h4 className="font-headline-md text-[16px] text-on-surface mb-md">Agent Allocation</h4>
      <div className="space-y-sm">
        {allocs.map(a => (
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
  )
}
