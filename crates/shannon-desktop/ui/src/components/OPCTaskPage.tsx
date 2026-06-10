// OPC Task Detail — Agent workflow pipeline, execution log, human-in-loop, artifacts, metrics
import { cn } from '../lib/utils'

interface WorkflowStep {
  icon: string
  label: string
  sublabel: string
  active?: boolean
  pending?: boolean
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { icon: 'emoji_objects', label: 'Architect', sublabel: 'Design' },
  { icon: 'badge', label: 'PM', sublabel: 'Stories', pending: true },
  { icon: 'code', label: 'Engineer', sublabel: 'Active', active: true },
  { icon: 'verified_user', label: 'QA', sublabel: 'Verify', pending: true },
]

interface LogEvent {
  icon: string
  title: string
  time: string
  description: string
  active?: boolean
  pending?: boolean
  detail?: string
}

const EXECUTION_LOG: LogEvent[] = [
  {
    icon: 'emoji_objects',
    title: 'Architect Initialized Proposal',
    time: '10:24 AM',
    description: 'Generated technical specification. Identified key performance metrics.',
  },
  {
    icon: 'badge',
    title: 'PM Defined User Stories',
    time: '10:25 AM',
    description: 'Broke down spec into 4 sprint tasks. Assigned creative assets to designer.',
  },
  {
    icon: 'code',
    title: 'Engineer Committing Code',
    time: '10:32 AM',
    description: 'Applying CSS refinements. Pushing layout changes to feature branch.',
    active: true,
    detail: '+142 -22 lines  lint: success',
  },
  {
    icon: 'verified_user',
    title: 'QA Verification Pending',
    time: 'Scheduled',
    description: 'Waiting for engineer to finalize deployment to sandbox...',
    pending: true,
  },
]

export function OPCTaskPage() {
  const activeStepIndex = WORKFLOW_STEPS.findIndex(s => s.active)

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
                {/* Connecting lines */}
                <div className="absolute left-10 md:left-16 right-10 md:right-16 top-6 h-0.5 bg-md3-outline-variant/20 z-0" />
                <div className="absolute left-10 md:left-16 top-6 h-0.5 bg-md3-primary z-0" style={{ width: `${(activeStepIndex / (WORKFLOW_STEPS.length - 1)) * 100}%` }} />

                {WORKFLOW_STEPS.map((step, i) => (
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
                  <span className="text-body-sm text-[13px] text-md3-on-surface">Agent Harmony Score</span>
                  <span className="text-label-md text-[14px] font-bold text-md3-primary">98%</span>
                </div>
                <div className="h-2 w-full bg-md3-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-md3-primary rounded-full w-[98%]" />
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
                <button className="p-2 rounded-lg hover:bg-md3-surface-container-high text-md3-on-surface-variant transition-colors" title="Edit description">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
              <div className="text-body-md text-[15px] text-md3-on-surface-variant space-y-4 leading-relaxed">
                <p>Refactor the module architecture for better separation of concerns. This involves splitting the monolithic handler into discrete service modules, optimizing data flow between layers, and ensuring comprehensive test coverage for all new interfaces.</p>
                <p>Key requirements include maintaining backwards compatibility with existing APIs, achieving &gt;90% test coverage on new code, and documenting all public interfaces.</p>
              </div>
            </div>

            {/* Execution Log */}
            <div className="bg-white rounded-2xl p-md3-xl border border-md3-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-md3-on-surface">receipt_long</span>
                  <h3 className="text-headline-md text-[20px] font-bold text-md3-on-surface">Execution Log</h3>
                </div>
                <span className="bg-md3-surface-container text-md3-on-surface-variant text-label-sm text-[11px] px-3 py-1 rounded-full border border-md3-outline-variant/20">{EXECUTION_LOG.length} Events</span>
              </div>

              <div className="relative pl-0 md:pl-2 space-y-10">
                <div className="absolute left-[15px] md:left-[23px] top-4 bottom-8 w-px bg-md3-outline-variant/30" />

                {EXECUTION_LOG.map((event, i) => (
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
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={cn(
                          'text-label-md text-[14px]',
                          event.active ? 'text-md3-primary font-bold' : event.pending ? 'text-md3-on-surface-variant' : 'text-md3-on-surface'
                        )}>{event.title}</h4>
                        <span className={cn(
                          'text-label-sm text-[10px] uppercase tracking-wider',
                          event.active ? 'text-md3-primary font-bold' : 'text-md3-on-surface-variant'
                        )}>{event.time}</span>
                      </div>
                      <p className={cn('text-body-sm text-[14px] mt-1 leading-relaxed', event.pending ? 'text-md3-on-surface-variant italic' : 'text-md3-on-surface-variant')}>
                        {event.description}
                      </p>
                      {event.detail && (
                        <div className="flex items-center gap-3 mt-2">
                          <div className="bg-md3-surface-container px-2 py-1 rounded font-mono text-[11px] font-bold text-md3-on-surface">{event.detail.split('  ')[0]}</div>
                          <div className="bg-md3-primary/10 border border-md3-primary/20 text-md3-primary px-2 py-1 rounded font-mono text-[11px] font-bold">{event.detail.split('  ')[1]}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Sidebar Panels */}
          <div className="xl:col-span-4 flex flex-col gap-md3-lg">

            {/* Human-in-the-Loop Panel */}
            <div className="border border-md3-primary/30 bg-white rounded-2xl p-md3-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-md3-primary to-md3-secondary" />
              <div className="flex items-center gap-2 mb-6 mt-1">
                <span className="material-symbols-outlined text-md3-primary text-[20px]">lock_open</span>
                <h3 className="text-label-md text-[14px] font-bold text-md3-primary uppercase tracking-widest">Human-in-the-Loop Required</h3>
              </div>

              <button className="w-full bg-md3-primary text-md3-on-primary py-3 rounded-xl text-label-md font-bold text-[14px] mb-4 flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.98] transition-all">
                <span className="material-symbols-outlined text-[20px]">call_merge</span>
                Approve Final Merge
              </button>

              <div className="flex gap-3 mb-6">
                <button className="flex-1 bg-white border border-md3-outline-variant/30 text-md3-on-surface py-2.5 rounded-xl text-label-md text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-md3-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Rollback
                </button>
                <button className="flex-1 bg-white border border-md3-outline-variant/30 text-md3-on-surface py-2.5 rounded-xl text-label-md text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-md3-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  Revision
                </button>
              </div>

              <p className="text-label-sm text-[11px] text-md3-on-surface-variant leading-relaxed text-center opacity-80">
                Finalizing this action will trigger automatic deployment to production.
              </p>
            </div>

            {/* Task Artifacts */}
            <div className="bg-white rounded-2xl p-md3-xl border border-md3-outline-variant/30 shadow-sm flex flex-col gap-md3-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[20px] text-md3-primary">inventory_2</span>
                <h3 className="text-headline-md text-[18px] font-bold text-md3-on-surface">Task Artifacts</h3>
              </div>

              {[
                { icon: 'link', title: 'Preview Sandbox', detail: 'https://dev-feature.shannon.ai' },
                { icon: 'integration_instructions', title: 'Pull Request #42', detail: 'Status: Draft (Pending Review)' },
              ].map((artifact) => (
                <div key={artifact.title} className="border border-md3-outline-variant/30 rounded-xl p-4 flex items-start gap-4 hover:border-md3-primary/40 hover:bg-md3-surface-container/30 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-md3-surface-container flex items-center justify-center shrink-0 text-md3-on-surface-variant group-hover:text-md3-primary group-hover:bg-md3-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{artifact.icon}</span>
                  </div>
                  <div>
                    <div className="text-label-md text-[14px] font-bold text-md3-on-surface mb-0.5 group-hover:text-md3-primary transition-colors">{artifact.title}</div>
                    <div className="text-label-sm text-[11px] text-md3-on-surface-variant">{artifact.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Efficiency Metrics */}
            <div className="bg-white rounded-2xl p-md3-xl border border-md3-outline-variant/30 shadow-sm flex flex-col gap-md3-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[20px] text-md3-primary">monitoring</span>
                <h3 className="text-headline-md text-[18px] font-bold text-md3-on-surface">Efficiency Metrics</h3>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                {[
                  { label: 'Compute Cost', value: '$1.42', extra: 'text-emerald-600', extraIcon: 'trending_down', extraText: '-12% avg' },
                  { label: 'Token Usage', value: '14.8k', extra: 'text-md3-on-surface-variant', extraText: 'Multi-model' },
                  { label: 'Duration', value: '1h 12m', extra: 'text-md3-on-surface-variant', extraText: 'Est. human: 6h' },
                  { label: 'Agent Load', value: 'Med-High', extra: 'text-md3-on-surface-variant', extraText: 'Parallel enabled' },
                ].map((metric) => (
                  <div key={metric.label} className="bg-md3-surface-container/50 rounded-xl p-md3-md border border-md3-outline-variant/20">
                    <div className="text-label-sm text-[10px] text-md3-on-surface-variant uppercase tracking-wider mb-2">{metric.label}</div>
                    <div className="text-headline-md text-[18px] font-bold text-md3-on-surface mb-1">{metric.value}</div>
                    <div className={cn('text-label-sm text-[10px] font-bold flex items-center gap-1', metric.extra)}>
                      {metric.extraIcon && <span className="material-symbols-outlined text-[14px]">{metric.extraIcon}</span>}
                      {metric.extraText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
