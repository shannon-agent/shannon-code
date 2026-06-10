// Goals Page — 3-column layout with task decomposition tree, agent call path, and resource sidebar
import { useState } from 'react'
import { cn } from '../lib/utils'

interface Goal {
  title: string
  progress: number
  active?: boolean
}

const GOALS: Goal[] = [
  { title: 'Launch Desktop App v1.0', progress: 34, active: true },
  { title: 'Q3 Test Coverage Audit', progress: 82 },
  { title: 'MCP Integration Milestone', progress: 15 },
  { title: 'Documentation Overhaul', progress: 50 },
]

interface TreeStep {
  icon: string
  label: string
  sublabel: string
  active?: boolean
}

const AGENT_CALL_PATH: TreeStep[] = [
  { icon: 'search', label: 'Researcher', sublabel: 'Analysis Bot' },
  { icon: 'edit_note', label: 'Copywriter', sublabel: 'Drafting Logic' },
  { icon: 'schedule', label: 'Scheduler', sublabel: 'Wait-state', active: true },
]

interface TreeNode {
  title: string
  status: 'done' | 'active' | 'pending'
  description: string
  reasoningSteps?: { text: string; active?: boolean }[]
}

const TASK_TREE: TreeNode[] = [
  {
    title: 'Market Analysis',
    status: 'done',
    description: 'Comprehensive review of competitor landscape and architecture patterns for the desktop release.',
  },
  {
    title: 'Implement UI Components',
    status: 'active',
    description: 'Building all page-level components with MD3 styling, glass morphism, and Material Symbols.',
    reasoningSteps: [
      { text: 'Identifying components from design specification...' },
      { text: 'Awaiting verification of design token mapping.', active: true },
    ],
  },
  {
    title: 'Integration Testing',
    status: 'pending',
    description: 'End-to-end testing of Tauri bridge integration with UI components.',
  },
]

const STATUS_CONFIG = {
  done: { label: 'Done', color: 'bg-emerald-100 text-emerald-700', icon: 'check_circle' },
  active: { label: 'In Progress', color: 'bg-md3-primary/10 text-md3-primary', icon: 'sync' },
  pending: { label: 'Pending', color: 'bg-md3-surface-container-high text-md3-on-surface-variant', icon: 'lock' },
}

export function GoalsPage() {
  const [activeGoalIdx, setActiveGoalIdx] = useState(GOALS.findIndex(g => g.active) || 0)
  const activeGoal = GOALS[activeGoalIdx]

  return (
    <div className="flex-1 flex w-full h-full pb-10 animate-in fade-in duration-700">
      {/* Left Sidebar — Goal List */}
      <aside className="w-[320px] h-full border-r border-md3-outline-variant/20 bg-md3-surface-container-low/30 flex flex-col overflow-hidden shrink-0">
        <div className="p-md3-md border-b border-md3-outline-variant/20">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-md3-on-surface-variant/60 text-[20px]">search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-md3-surface-container-lowest border border-md3-outline-variant/50 rounded-lg text-body-sm focus:outline-none focus:border-md3-primary transition-all"
              placeholder="Search goals..."
              type="text"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-sm">
          <div className="px-md3-md py-xs">
            <p className="text-label-sm text-md3-on-surface-variant/60 uppercase tracking-wider">Active Goals</p>
          </div>
          <div className="px-sm space-y-1">
            {GOALS.map((goal, idx) => (
              <button
                key={goal.title}
                onClick={() => setActiveGoalIdx(idx)}
                className={cn(
                  'w-full flex flex-col gap-1 p-md3-md rounded-xl text-left cursor-pointer transition-all duration-300',
                  idx === activeGoalIdx
                    ? 'bg-md3-primary/10 border border-md3-primary/20'
                    : 'hover:bg-md3-surface-container-high/60 hover:shadow-sm hover:-translate-y-0.5'
                )}
              >
                <div className="flex justify-between items-start">
                  <span className={cn('text-label-md font-bold', idx === activeGoalIdx ? 'text-md3-primary' : 'text-md3-on-surface')}>
                    {goal.title}
                  </span>
                  <span className={cn('text-label-sm', idx === activeGoalIdx ? 'text-md3-primary' : 'text-md3-on-surface-variant')}>
                    {goal.progress}%
                  </span>
                </div>
                <div className="w-full h-1 bg-md3-surface-container-highest rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', idx === activeGoalIdx ? 'bg-md3-primary' : 'bg-emerald-500')} style={{ width: `${goal.progress}%` }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col overflow-y-auto p-md3-xl relative">
        <div className="flex items-end justify-between mb-md3-xl">
          <div>
            <div className="flex items-center gap-sm mb-xs">
              <span className="px-sm py-xs bg-md3-primary/10 text-md3-primary text-label-sm rounded-full">Active Goal</span>
              <span className="text-label-sm text-md3-on-surface-variant/60">Started 2 days ago</span>
            </div>
            <h2 className="text-headline-lg text-[28px] text-md3-on-surface">{activeGoal.title}</h2>
          </div>
          <div className="flex items-center gap-md3-md">
            <div className="text-right">
              <p className="text-label-sm text-md3-on-surface-variant">Completion</p>
              <p className="text-headline-md text-md3-primary">{activeGoal.progress}%</p>
            </div>
            <div className="w-32 h-2 bg-md3-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-md3-primary" style={{ width: `${activeGoal.progress}%` }} />
            </div>
          </div>
        </div>

        {/* Goal Tree */}
        <div className="flex gap-md3-lg w-full">
          {/* Agent Call Path */}
          <div className="w-1/4 max-w-[280px]">
            <div className="glass-card bg-white/70 p-md3-md rounded-xl sticky top-0">
              <h3 className="text-label-md text-md3-on-surface mb-md3-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-md3-primary text-[20px]">hub</span>
                Agent Call Path
              </h3>
              <div className="space-y-md3-lg relative">
                <div className="absolute left-[15px] top-6 bottom-6 w-px border-l border-dashed border-md3-primary/30" />
                {AGENT_CALL_PATH.map((step) => (
                  <div key={step.label} className={cn('relative flex items-center gap-md3-md', step.active && 'opacity-40')}>
                    <div className={cn(
                      'z-10 w-8 h-8 rounded-full flex items-center justify-center text-[18px]',
                      step.active
                        ? 'bg-md3-surface-container-highest text-md3-on-surface'
                        : 'bg-md3-primary text-md3-on-primary'
                    )}>
                      <span className="material-symbols-outlined">{step.icon}</span>
                    </div>
                    <div>
                      <p className="text-label-md text-md3-on-surface">{step.label}</p>
                      <p className="text-label-sm text-md3-on-surface-variant/70">{step.sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Decomposition Tree */}
          <div className="flex-1 space-y-md3-md">
            {TASK_TREE.map((node, i) => {
              const cfg = STATUS_CONFIG[node.status]
              return (
                <div key={node.title} className={cn('flex items-start gap-md3-lg', node.status === 'pending' && 'opacity-60 grayscale-[0.5]')}>
                  <div className="mt-4 flex flex-col items-center">
                    <div className={cn(
                      'w-4 h-4 rounded-full z-10',
                      node.status === 'done' && 'border-2 border-md3-primary bg-md3-background shadow-sm',
                      node.status === 'active' && 'border-2 border-md3-primary bg-md3-primary shadow-lg',
                      node.status === 'pending' && 'border-2 border-md3-outline-variant bg-md3-surface-container-highest'
                    )} />
                    {i < TASK_TREE.length - 1 && <div className="w-px h-24 bg-md3-outline-variant/30" />}
                  </div>
                  <div className={cn(
                    'flex-1 glass-card p-md3-lg rounded-xl flex justify-between items-center group hover:shadow-md transition-all',
                    node.status === 'active' && 'bg-white border-md3-primary/30 ring-1 ring-md3-primary/10 shadow-lg relative overflow-hidden'
                  )}>
                    <div>
                      {node.status === 'active' && <div className="absolute top-lg right-lg"><div className="animate-pulse-amber w-3 h-3 rounded-full bg-md3-tertiary shadow-lg" /></div>}
                      <div className="flex items-center gap-md3-md mb-xs">
                        <h4 className={cn('text-headline-md', node.status === 'active' ? 'text-md3-primary' : 'text-md3-on-surface')}>{node.title}</h4>
                        <span className={cn('px-sm py-xs text-label-sm rounded-lg flex items-center gap-1', cfg.color)}>
                          <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span> {cfg.label}
                        </span>
                      </div>
                      <p className="text-md3-on-surface-variant max-w-lg">{node.description}</p>

                      {/* Reasoning steps for active node */}
                      {node.reasoningSteps && (
                        <div className="bg-md3-surface-container-low/50 rounded-lg p-md3-md space-y-md3-md mt-md3-md">
                          <p className="text-label-sm text-md3-primary uppercase tracking-wider mb-sm">Agent Reasoning Steps</p>
                          {node.reasoningSteps.map((step, si) => (
                            <div key={si} className="flex items-start gap-md3-md">
                              <div className="mt-1 flex flex-col items-center">
                                <div className={cn('w-2 h-2 rounded-full', step.active ? 'bg-md3-primary animate-pulse' : 'bg-md3-primary')} />
                                {si < node.reasoningSteps!.length - 1 && <div className="w-px h-8 bg-md3-outline-variant/50" />}
                              </div>
                              <span className={cn('text-label-sm', step.active ? 'text-md3-on-surface font-bold' : 'text-md3-on-surface-variant')}>
                                {step.text}
                              </span>
                            </div>
                          ))}
                          <div className="mt-md3-md flex gap-sm">
                            <button className="px-md3-md py-sm bg-md3-tertiary text-md3-on-tertiary rounded-lg text-label-md shadow-sm hover:brightness-110 active:scale-95 transition-all">Approve</button>
                            <button className="px-md3-md py-sm border border-md3-outline-variant text-md3-on-surface rounded-lg text-label-md hover:bg-md3-surface-container-high/50 transition-all">Adjust</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <button className="p-sm text-md3-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom input */}
        <div className="absolute bottom-6 left-md3-xl right-md3-xl z-20 max-w-4xl mx-auto shadow-lg bg-white/90 backdrop-blur-md border border-md3-outline-variant/30 rounded-2xl flex items-center p-xs group focus-within:border-md3-primary focus-within:shadow-md3-primary/10 transition-all duration-300">
          <button className="p-3 text-md3-on-surface-variant hover:text-md3-primary transition-colors hover:bg-md3-surface-container-low rounded-xl">
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <input
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-body-lg py-md3-md px-sm placeholder:text-md3-on-surface-variant/60"
            placeholder="Add a sub-task or message the Agent..."
            type="text"
          />
          <div className="flex items-center gap-2 px-sm">
            <button className="p-3 text-md3-on-surface-variant hover:text-md3-primary rounded-xl transition-colors hover:bg-md3-surface-container-low">
              <span className="material-symbols-outlined">auto_awesome</span>
            </button>
            <button className="bg-md3-primary text-md3-on-primary p-3 rounded-xl active:scale-95 transition-all shadow-md hover:shadow-md3-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[300px] border-l border-md3-outline-variant/20 bg-md3-surface-container-low/30 p-md3-lg shrink-0 flex flex-col gap-md3-lg">
        <div className="glass-card bg-white/70 p-md3-lg rounded-xl">
          <h5 className="text-label-md text-md3-on-surface-variant mb-md3-md">Connected Resources</h5>
          <div className="flex flex-wrap gap-sm">
            {['Google Analytics 4', 'Meta Ads API', 'Notion Workspace'].map((resource) => (
              <span key={resource} className="px-md3-md py-sm bg-md3-surface-container-highest rounded-full text-label-sm">{resource}</span>
            ))}
          </div>
        </div>
        <div className="glass-card bg-white/70 p-md3-lg rounded-xl flex flex-col justify-between">
          <div>
            <h5 className="text-label-md text-md3-on-surface-variant mb-xs">Agent Efficiency Report</h5>
            <p className="text-md3-on-surface-variant text-body-sm">
              Estimated time saved: <span className="text-md3-primary font-bold">14.5 hours</span> this week.
            </p>
          </div>
          <div className="flex gap-xs items-end h-16 mt-md3-md">
            {[40, 60, 30, 80, 100].map((h, i) => (
              <div key={i} className={cn('w-4 rounded-t-sm', i === 4 ? 'bg-md3-primary' : `bg-md3-primary/${20 + i * 20}`)} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
