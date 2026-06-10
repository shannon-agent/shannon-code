// Page router — maps PageId to rendered content
import { useState } from 'react'
import { cn } from '../lib/utils'
import type { PageId } from './AppSidebar'
import type { SessionInfo } from '../types/tauri-events'
import type { AgentInfo } from './AgentDashboard'
import type { TaskItem } from './TaskBoard'
import type { McpServerInfo } from '../types/tauri-events'
import { TaskBoard } from './TaskBoard'
import { GeneralSettingsPage, ThemeSettingsPage, ModelsSettingsPage, BillingSettingsPage, AdvancedSettingsPage } from './SettingsPanel'
import { OPCPage } from './OPCPage'
import { OPCTaskPage } from './OPCTaskPage'
import { GoalsPage } from './GoalsPage'

interface PageRouterProps {
  currentPage: PageId
  sendMessage: (message: string) => void
  isStreaming: boolean
  error: string | null
  clearError: () => void
  sessions: SessionInfo[]
  currentSessionId?: string
  onSessionSelect: (id: string) => void
  onNewSession: () => void
  agents: AgentInfo[]
  tasks: TaskItem[]
  mcpServers: McpServerInfo[]
  onRefreshTasks: () => void
  onRefreshMcp: () => void
  onCancelAgent: (id: string) => void
  onNavigate: (page: PageId) => void
}

export function PageRouter(props: PageRouterProps) {
  const { currentPage } = props

  switch (currentPage) {
    case 'chat':
      return null

    case 'tasks':
      return (
        <div className="flex-1 overflow-y-auto p-md3-xl animate-in">
          <TaskBoard tasks={props.tasks} onRefresh={props.onRefreshTasks} />
        </div>
      )

    case 'goals':
      return <GoalsPage />

    case 'opc':
      return <OPCPage onNavigate={props.onNavigate} />

    case 'opc-task':
      return <OPCTaskPage />

    case 'extensions-skills':
      return (
        <div className="flex-1 overflow-y-auto animate-in">
          <SkillsHubContent />
        </div>
      )

    case 'extensions-agents':
      return (
        <div className="flex-1 overflow-y-auto animate-in">
          <MyAgentsContent />
        </div>
      )

    case 'extensions-datasources':
      return (
        <div className="flex-1 overflow-y-auto animate-in">
          <DataSourcesContent />
        </div>
      )

    case 'settings-general':
      return (
        <div className="flex-1 overflow-y-auto animate-in">
          <GeneralSettingsPage />
        </div>
      )

    case 'settings-theme':
      return (
        <div className="flex-1 overflow-y-auto animate-in">
          <ThemeSettingsPage />
        </div>
      )

    case 'settings-models':
      return (
        <div className="flex-1 overflow-y-auto animate-in">
          <ModelsSettingsPage />
        </div>
      )

    case 'settings-advanced':
      return (
        <div className="flex-1 overflow-y-auto animate-in">
          <AdvancedSettingsPage />
        </div>
      )

    case 'settings-billing':
      return (
        <div className="flex-1 overflow-y-auto animate-in">
          <BillingSettingsPage />
        </div>
      )

    default:
      return null
  }
}

// --- Skills Hub — matches design/src/components/extensions/ExtensionsHub.tsx ---

function SkillsHubContent() {
  const [activeTab, setActiveTab] = useState('Trending')

  const SKILL_CATEGORIES = [
    {
      name: 'Productivity',
      skills: [
        { icon: 'picture_as_pdf', name: 'PDF Reader', subtitle: 'Token Base: 0.1k', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
        { icon: 'language', name: 'Web Search', subtitle: 'Real-time browse', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
      ],
    },
    {
      name: 'Design',
      skills: [
        { icon: 'palette', name: 'Vector Gen', subtitle: 'SVG Creator', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
      ],
    },
    {
      name: 'Data & Analysis',
      skills: [
        { icon: 'code', name: 'Python Sandbox', subtitle: 'Isolated Compute', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
        { icon: 'database', name: 'SQL Bridge', subtitle: 'Read-only access', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
      ],
    },
  ]

  return (
    <div className="max-w-[1200px] mx-auto px-md3-lg pt-md3-lg pb-md3-xl">
      <section className="mb-md3-xl mt-4">
        <div className="flex items-center justify-between mb-md3-lg">
          <h3 className="text-headline-md text-[20px] font-bold text-md3-on-surface">Available Skills</h3>
          <div className="flex gap-sm">
            <button onClick={() => setActiveTab('Trending')} className={cn(
              'px-md3-md py-sm rounded-full text-label-md text-[14px] font-bold cursor-pointer',
              activeTab === 'Trending' ? 'bg-md3-surface-container-high text-md3-on-surface' : 'text-md3-on-surface-variant hover:bg-md3-surface-container-high transition-colors'
            )}>Trending</button>
            <button onClick={() => setActiveTab('Recent')} className={cn(
              'px-md3-md py-sm rounded-full text-label-md text-[14px] font-bold cursor-pointer',
              activeTab === 'Recent' ? 'bg-md3-surface-container-high text-md3-on-surface' : 'text-md3-on-surface-variant hover:bg-md3-surface-container-high transition-colors'
            )}>Recent</button>
          </div>
        </div>

        {SKILL_CATEGORIES.map(category => (
          <div key={category.name} className="mb-md3-lg">
            <h4 className="text-label-md text-[14px] text-md3-on-surface-variant uppercase tracking-widest mb-md3-md">{category.name}</h4>
            <div className="flex flex-wrap gap-md3-md">
              {category.skills.map(skill => (
                <div key={skill.name} className="group cursor-pointer bg-white border border-md3-outline-variant/50 rounded-xl p-md3-md flex items-center gap-md3-md hover:border-md3-primary transition-all shadow-sm">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', skill.iconBg, skill.iconColor)}>
                    <span className="material-symbols-outlined">{skill.icon}</span>
                  </div>
                  <div>
                    <p className="text-label-md text-[14px] font-bold text-md3-on-surface">{skill.name}</p>
                    <p className="text-label-sm text-[12px] text-md3-on-surface-variant">{skill.subtitle}</p>
                  </div>
                  <span className="material-symbols-outlined text-md3-on-surface-variant group-hover:text-md3-primary ml-sm transition-transform group-hover:scale-125">add_circle</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

// --- My Agents — matches design/src/components/extensions/MyAgents.tsx ---

function MyAgentsContent() {
  const AGENTS_DATA = [
    { name: 'Researcher', icon: 'query_stats', iconBg: 'bg-md3-primary/10', iconColor: 'text-md3-primary', status: 'Active', statusBg: 'bg-green-100 text-green-700', dotActive: true, version: 'v2.4.1', type: 'Autonomous Intelligence', scope: 'Web, ArXiv', scopeIcon: 'public', cost: '$0.02', tasks: '1,284', primaryBtn: false, btnLabel: 'Configure', moreIcon: 'more_horiz' },
    { name: 'AutoCoder', icon: 'code', iconBg: 'bg-md3-secondary/10', iconColor: 'text-md3-secondary', status: 'Idle', statusBg: 'bg-md3-surface-container-high text-md3-on-surface-variant', dotActive: false, version: 'v1.1.0', type: 'Technical Architecture', scope: 'GitHub, Jira', scopeIcon: 'terminal', cost: '$0.08', tasks: '412', primaryBtn: true, btnLabel: 'Deploy Now', moreIcon: 'settings' },
    { name: 'PA Agent', icon: 'schedule', iconBg: 'bg-md3-tertiary/10', iconColor: 'text-md3-tertiary', status: 'Active', statusBg: 'bg-green-100 text-green-700', dotActive: true, version: 'v3.0.5', type: 'Logistics & Planning', scope: 'Email, PDFs', scopeIcon: 'description', cost: '$0.01', tasks: '2,910', primaryBtn: false, btnLabel: 'Configure', moreIcon: 'analytics' },
  ]

  return (
    <div className="max-w-[1200px] mx-auto px-md3-lg py-md3-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md3-lg mb-md3-xl">
        <div>
          <h2 className="text-headline-lg text-[28px] font-bold text-md3-on-surface">My Agents</h2>
          <p className="text-body-md text-[15px] text-md3-on-surface-variant">Manage and monitor your deployed autonomous intelligence units.</p>
        </div>
        <div className="flex items-center gap-md3-md">
          <button className="flex items-center gap-sm border border-md3-outline-variant px-md3-lg py-sm rounded-xl font-bold text-label-md text-[14px] text-md3-on-surface hover:bg-md3-surface-container-high transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">upload</span>
            Import Agent
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md3-lg">
        {AGENTS_DATA.map(agent => (
          <div key={agent.name} className="glass-card bg-white/70 backdrop-blur-md p-md3-lg rounded-xl shadow-sm flex flex-col group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-md3-md">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', agent.iconBg, agent.iconColor)}>
                <span className="material-symbols-outlined text-[28px]">{agent.icon}</span>
              </div>
              <div className={cn('flex items-center gap-xs px-sm py-1 rounded-full', agent.statusBg)}>
                <span className={cn('w-2 h-2 rounded-full', agent.dotActive ? 'bg-green-500 animate-pulse' : 'bg-md3-outline-variant')} />
                <span className="text-label-sm text-[12px]">{agent.status}</span>
              </div>
            </div>

            <div className="mb-md3-lg">
              <h3 className="text-headline-md text-[18px] font-bold text-md3-on-surface">{agent.name}</h3>
              <p className="text-label-sm text-[12px] text-md3-on-surface-variant">{agent.version} &bull; {agent.type}</p>
            </div>

            <div className="space-y-sm mb-md3-lg">
              <div className="flex justify-between items-center text-label-md text-[14px]">
                <span className="text-md3-on-surface-variant">Data Scope</span>
                <span className="font-bold flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm">{agent.scopeIcon}</span> {agent.scope}
                </span>
              </div>
              <div className="flex justify-between items-center text-label-md text-[14px]">
                <span className="text-md3-on-surface-variant">Cost per Request</span>
                <span className="font-bold">{agent.cost}</span>
              </div>
              <div className="flex justify-between items-center text-label-md text-[14px]">
                <span className="text-md3-on-surface-variant">Total Tasks</span>
                <span className="font-bold">{agent.tasks}</span>
              </div>
            </div>

            <div className="mt-auto pt-md3-md border-t border-md3-outline-variant flex gap-sm">
              <button className={cn(
                'flex-grow py-2 rounded-lg font-bold text-label-md text-[14px] cursor-pointer transition-all',
                agent.primaryBtn
                  ? 'bg-md3-primary text-md3-on-primary hover:opacity-90'
                  : 'bg-md3-surface-container-high text-md3-on-surface hover:bg-md3-surface-container-high/80'
              )}>{agent.btnLabel}</button>
              <button className="p-2 rounded-lg border border-md3-outline-variant hover:text-md3-primary transition-colors cursor-pointer flex items-center justify-center">
                <span className="material-symbols-outlined">{agent.moreIcon}</span>
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        <div className="border-2 border-dashed border-md3-outline-variant p-md3-lg rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-md3-primary/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-md3-surface-container flex items-center justify-center text-md3-on-surface-variant group-hover:bg-md3-primary/10 group-hover:text-md3-primary transition-colors mb-md3-md">
            <span className="material-symbols-outlined text-[32px]">add</span>
          </div>
          <h3 className="text-body-lg text-[16px] font-bold text-md3-on-surface">New Specialization</h3>
          <p className="text-label-md text-[14px] text-md3-on-surface-variant max-w-[200px]">Define a custom prompt or import a model to create a new agent.</p>
        </div>
      </div>

      {/* Insight Section */}
      <section className="mt-md3-xl grid grid-cols-1 lg:grid-cols-3 gap-md3-lg mb-8">
        <div className="lg:col-span-2 glass-card bg-white/70 backdrop-blur-md p-md3-xl rounded-xl">
          <h4 className="text-body-lg text-[16px] font-bold mb-md3-lg flex items-center gap-md3-md text-md3-on-surface">
            <span className="material-symbols-outlined text-md3-primary">insights</span>
            Cognitive Processing Performance
          </h4>

          <div className="relative h-48 w-full bg-md3-surface-container-low rounded-lg overflow-hidden flex items-end px-md3-lg pb-md3-lg gap-md3-md pt-10">
            <div className="flex-grow bg-md3-primary/20 h-[40%] rounded-t-sm relative group">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-md3-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Researcher</div>
            </div>
            <div className="flex-grow bg-md3-primary/40 h-[65%] rounded-t-sm relative group">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-md3-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">AutoCoder</div>
            </div>
            <div className="flex-grow bg-md3-primary/30 h-[90%] rounded-t-sm relative group">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-md3-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">PA Agent</div>
            </div>
            <div className="flex-grow bg-md3-primary/10 h-[25%] rounded-t-sm" />
            <div className="flex-grow bg-md3-primary/15 h-[55%] rounded-t-sm" />
            <div className="flex-grow bg-md3-primary/25 h-[75%] rounded-t-sm" />
          </div>

          <div className="flex justify-between mt-md3-md text-label-sm text-[12px] text-md3-on-surface-variant">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="glass-card bg-white/70 backdrop-blur-md p-md3-xl rounded-xl">
          <h4 className="text-body-lg text-[16px] font-bold mb-md3-lg text-md3-on-surface">Active Data Scopes</h4>
          <div className="space-y-md3-md">
            {[
              { label: 'Vector Database (SQL)', pct: 85, color: 'bg-md3-primary' },
              { label: 'Web Documentation', pct: 42, color: 'bg-md3-secondary' },
              { label: 'Local File Clusters', pct: 12, color: 'bg-md3-tertiary' },
            ].map(scope => (
              <div key={scope.label} className="flex items-center gap-md3-md">
                <div className={cn('w-2 h-8 rounded-full', scope.color)} />
                <div className="flex-grow">
                  <p className="text-label-md text-[14px] font-bold text-md3-on-surface">{scope.label}</p>
                  <div className="w-full bg-md3-surface-container-high h-1.5 rounded-full mt-1">
                    <div className={cn(scope.color, 'h-full rounded-full')} style={{ width: `${scope.pct}%` }} />
                  </div>
                </div>
                <span className="text-label-sm text-[12px] font-bold text-md3-on-surface">{scope.pct}%</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-md3-lg text-md3-primary text-label-md text-[14px] font-bold hover:underline cursor-pointer text-left">Manage All Scopes &rarr;</button>
        </div>
      </section>
    </div>
  )
}

// --- Data Sources — matches design/src/components/extensions/DataSources.tsx ---

function DataSourcesContent() {
  return (
    <div className="max-w-[1200px] mx-auto px-md3-lg py-md3-xl">
      <div className="mb-md3-lg">
        <h2 className="text-headline-lg text-[28px] font-bold text-md3-on-surface">Data Sources</h2>
        <p className="text-body-md text-[15px] text-md3-on-surface-variant max-w-2xl">Manage the connected knowledge bases your agents use to provide context-aware intelligence. Connect, sync, and index new data silos effortlessly.</p>
      </div>

      <div className="grid grid-cols-12 gap-md3-lg pb-10">
        {/* Featured: Google Drive */}
        <div className="col-span-12 lg:col-span-8 bg-md3-surface-container-lowest border border-md3-outline-variant/50 rounded-xl p-md3-lg shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-md3-xl relative z-10">
            <div className="flex items-center gap-md3-md">
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <span className="material-symbols-outlined text-blue-600 text-[32px]">cloud</span>
              </div>
              <div>
                <h3 className="text-headline-md text-[20px] font-bold text-md3-on-surface">Google Drive</h3>
                <div className="flex items-center gap-sm mt-xs">
                  <span className="px-sm py-[2px] bg-emerald-50 text-emerald-700 rounded-full text-label-sm text-[12px] font-bold flex items-center gap-xs border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Synced
                  </span>
                  <span className="text-label-sm text-[12px] text-md3-on-surface-variant">Last update: 12 minutes ago</span>
                </div>
              </div>
            </div>
            <button className="px-md3-md py-sm border border-md3-outline-variant rounded-lg text-label-md text-[14px] font-bold text-md3-on-surface hover:bg-md3-surface-container-high transition-all cursor-pointer">Configure</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md3-lg relative z-10">
            <div className="p-md3-md rounded-xl bg-md3-surface-container-low border border-md3-outline-variant/30">
              <p className="text-label-sm text-[12px] text-md3-on-surface-variant uppercase tracking-wider mb-sm">Files Indexed</p>
              <p className="text-headline-md text-[20px] font-bold text-md3-on-surface">1,284</p>
              <div className="w-full bg-md3-surface-container-high h-1 rounded-full mt-md3-md overflow-hidden">
                <div className="bg-md3-primary h-full w-3/4 rounded-full" />
              </div>
            </div>

            <div className="p-md3-md rounded-xl bg-md3-surface-container-low border border-md3-outline-variant/30">
              <p className="text-label-sm text-[12px] text-md3-on-surface-variant uppercase tracking-wider mb-sm">Storage Used</p>
              <p className="text-headline-md text-[20px] font-bold text-md3-on-surface">4.2 <span className="text-body-md text-[15px] text-md3-on-surface-variant">GB</span></p>
              <p className="text-label-sm text-[12px] text-md3-on-surface-variant mt-md3-md">84% of allocated buffer</p>
            </div>

            <div className="p-md3-md rounded-xl bg-md3-surface-container-low border border-md3-outline-variant/30">
              <p className="text-label-sm text-[12px] text-md3-on-surface-variant uppercase tracking-wider mb-sm">Permissions</p>
              <div className="flex -space-x-2 mt-sm items-center">
                <div className="w-8 h-8 rounded-full bg-md3-surface-container-highest border-2 border-md3-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-md3-on-surface-variant">person</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-md3-surface-container-highest border-2 border-md3-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-md3-on-surface-variant">person</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-md3-surface-container-high border-2 border-md3-surface-container-low flex items-center justify-center text-[10px] font-bold text-md3-on-surface-variant">+5</div>
              </div>
              <p className="text-label-sm text-[12px] text-md3-primary mt-md3-md cursor-pointer hover:underline">Manage Access</p>
            </div>
          </div>
        </div>

        {/* AI Insight Pipeline */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-md3-lg">
          <div className="bg-white border border-md3-outline-variant/50 rounded-xl p-md3-lg shadow-sm flex-1">
            <div className="flex items-center gap-sm mb-md3-md">
              <span className="material-symbols-outlined text-md3-primary">bolt</span>
              <h3 className="text-label-md text-[14px] font-bold text-md3-on-surface">AI Insight Pipeline</h3>
            </div>
            <div className="space-y-md3-md">
              <div className="flex gap-sm items-start">
                <div className="flex flex-col items-center mt-1">
                  <span className="w-6 h-6 rounded-full bg-md3-primary/10 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-md3-primary animate-pulse" />
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-label-md text-[14px] text-md3-on-surface font-medium">Analyzing Q4 Report PDF</p>
                  <p className="text-label-sm text-[12px] text-md3-on-surface-variant">Extracting financial metrics...</p>
                </div>
              </div>

              <div className="flex gap-sm items-start">
                <div className="flex flex-col items-center mt-1">
                  <span className="w-6 h-6 rounded-full bg-md3-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-md3-on-surface-variant">check</span>
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-label-md text-[14px] text-md3-on-surface-variant">Synced Notion Database</p>
                  <p className="text-label-sm text-[12px] text-md3-on-surface-variant opacity-70">214 new entries indexed</p>
                </div>
              </div>

              <div className="flex gap-sm items-start">
                <div className="flex flex-col items-center mt-1">
                  <span className="w-6 h-6 rounded-full bg-md3-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-md3-on-surface-variant">hourglass_empty</span>
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-label-md text-[14px] text-md3-on-surface-variant">Pending: Slack Archives</p>
                  <p className="text-label-sm text-[12px] text-md3-on-surface-variant opacity-70">Waiting for rate limit reset</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-md3-lg py-sm bg-md3-surface-container text-md3-on-surface-variant rounded-lg text-label-md text-[14px] font-bold hover:bg-md3-surface-container-high transition-colors cursor-pointer border border-md3-outline-variant/30">View Real-time Logs</button>
          </div>
        </div>

        {/* Secondary: Notion */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white border border-md3-outline-variant/50 rounded-xl p-md3-md shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-md3-md">
            <div className="flex items-center gap-md3-md">
              <div className="w-10 h-10 rounded-lg bg-md3-on-surface flex items-center justify-center text-white">
                <span className="material-symbols-outlined">sticky_note_2</span>
              </div>
              <div>
                <h4 className="text-label-md text-[14px] font-bold text-md3-on-surface">Notion Workspace</h4>
                <p className="text-label-sm text-[12px] text-md3-on-surface-variant">Personal &amp; Engineering</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-md3-on-surface-variant">more_vert</span>
          </div>
          <div className="flex items-center justify-between pt-sm border-t border-md3-outline-variant/30">
            <span className="text-label-sm text-[12px] text-md3-on-surface-variant">42 Pages indexed</span>
            <span className="text-label-sm text-[12px] text-emerald-600 font-bold">Healthy</span>
          </div>
        </div>

        {/* Secondary: MySQL (Error State) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white border border-md3-error/20 rounded-xl p-md3-md shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-md3-md">
            <div className="flex items-center gap-md3-md">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
                <span className="material-symbols-outlined">database</span>
              </div>
              <div>
                <h4 className="text-label-md text-[14px] font-bold text-md3-on-surface">MySQL Analytics</h4>
                <p className="text-label-sm text-[12px] text-md3-on-surface-variant">Production Read-only</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-md3-error">warning</span>
          </div>
          <div className="flex items-center justify-between pt-sm border-t border-md3-outline-variant/30">
            <span className="text-label-sm text-[12px] text-md3-on-surface-variant">Connection Timeout</span>
            <span className="text-label-sm text-[12px] text-md3-error font-bold underline cursor-pointer">Reconnect</span>
          </div>
        </div>

        {/* Add New Source */}
        <div className="col-span-12 lg:col-span-4 bg-md3-surface-container-low/50 border border-dashed border-md3-outline-variant rounded-xl p-md3-md flex flex-col justify-center items-center gap-md3-md min-h-[140px] group hover:border-md3-primary/50 transition-colors">
          <p className="text-label-md text-[14px] font-medium text-md3-on-surface-variant">Add New Source</p>
          <div className="flex gap-md3-md">
            {[
              { icon: 'upload_file', title: 'Local Files', dashed: false },
              { icon: 'terminal', title: 'GitHub', dashed: false },
              { icon: 'forum', title: 'Slack', dashed: false },
              { icon: 'add', title: 'More', dashed: true },
            ].map(item => (
              <div key={item.title} className={cn(
                'w-10 h-10 rounded-full bg-white border flex items-center justify-center text-md3-on-surface-variant hover:text-md3-primary hover:border-md3-primary cursor-pointer transition-all active:scale-95 shadow-sm',
                item.dashed ? 'border-dashed border-md3-outline-variant' : 'border-md3-outline-variant'
              )} title={item.title}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
