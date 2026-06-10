// Page router — maps PageId to rendered content
import { useState } from 'react'
import { cn } from '../lib/utils'
import type { PageId } from './AppSidebar'
import type { SessionInfo } from '../types/tauri-events'
import type { AgentInfo } from './AgentDashboard'
import type { TaskItem } from './TaskBoard'
import type { McpServerInfo } from '../types/tauri-events'
import { AgentDashboard } from './AgentDashboard'
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
        <ExtensionsLayout searchPlaceholder="Search extensions..." ctaText="Create Skill" ctaIcon="add">
          <div className="flex-1 overflow-y-auto p-md3-xl animate-in">
            <SkillsHubContent />
          </div>
        </ExtensionsLayout>
      )

    case 'extensions-agents':
      return (
        <ExtensionsLayout searchPlaceholder="Search agents..." ctaText="Create Agent" ctaIcon="add">
          <div className="flex-1 overflow-y-auto p-md3-xl animate-in">
            <AgentDashboard agents={props.agents} onCancel={props.onCancelAgent} />
          </div>
        </ExtensionsLayout>
      )

    case 'extensions-datasources':
      return (
        <ExtensionsLayout searchPlaceholder="Search knowledge..." ctaText="Add Data Source" ctaIcon="add_circle">
          <div className="flex-1 overflow-y-auto p-md3-xl animate-in">
            <DataSourcesContent />
          </div>
        </ExtensionsLayout>
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

function ExtensionsLayout({ children, searchPlaceholder, ctaText, ctaIcon }: {
  children: React.ReactNode
  searchPlaceholder: string
  ctaText?: string
  ctaIcon?: string
}) {
  return (
    <div className="flex-1 flex flex-col h-full bg-md3-surface pb-8">
      {/* Context header */}
      <div className="flex justify-between items-center w-full px-md3-lg py-sm border-b border-md3-outline-variant/20 bg-md3-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-md3-xl w-full">
          <div className="hidden lg:flex items-center bg-md3-surface-container-lowest/50 rounded-full px-md3-md py-xs border border-md3-outline-variant/30 flex-1 max-w-md">
            <span className="material-symbols-outlined text-md3-on-surface-variant mr-sm">search</span>
            <input
              className="bg-transparent border-none outline-none focus:ring-0 text-label-md w-full placeholder:text-md3-on-surface-variant/60"
              placeholder={searchPlaceholder}
              type="text"
            />
          </div>
        </div>
        {ctaText && ctaIcon && (
          <button className="bg-md3-primary text-md3-on-primary px-md3-lg py-sm rounded-full font-bold text-label-md hover:bg-md3-primary/90 flex items-center gap-1 whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px]">{ctaIcon}</span>
            {ctaText}
          </button>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {children}
      </div>
    </div>
  )
}

const SKILLS_DATA = [
  { id: 's1', name: 'Code Review', icon: 'rate_review', description: 'Automated PR review with security and performance analysis', category: 'Quality', status: 'installed', author: 'Shannon Team' },
  { id: 's2', name: 'TDD Generator', icon: 'science', description: 'Generate test suites following test-driven development patterns', category: 'Testing', status: 'installed', author: 'Community' },
  { id: 's3', name: 'Refactor Pro', icon: 'auto_fix_high', description: 'Intelligent code refactoring with SOLID principle enforcement', category: 'Quality', status: 'available', author: 'Shannon Team' },
  { id: 's4', name: 'API Designer', icon: 'api', description: 'REST/GraphQL API design with OpenAPI spec generation', category: 'Backend', status: 'available', author: 'Community' },
  { id: 's5', name: 'DB Migration', icon: 'database', description: 'Safe database migration generation and validation', category: 'Backend', status: 'available', author: 'Shannon Team' },
  { id: 's6', name: 'Security Audit', icon: 'shield', description: 'OWASP Top 10 vulnerability scanning and remediation', category: 'Security', status: 'installed', author: 'Security Labs' },
  { id: 's7', name: 'Doc Writer', icon: 'description', description: 'Generate JSDoc, TSDoc, and README documentation', category: 'Docs', status: 'available', author: 'Community' },
  { id: 's8', name: 'Performance', icon: 'speed', description: 'Bundle analysis and performance optimization suggestions', category: 'Quality', status: 'available', author: 'Shannon Team' },
]

const SKILL_CATEGORIES = ['All', 'Quality', 'Testing', 'Backend', 'Security', 'Docs']

function SkillsHubContent() {
  const [category, setCategory] = useState('All')

  const filtered = category === 'All' ? SKILLS_DATA : SKILLS_DATA.filter(s => s.category === category)

  return (
    <div className="animate-in fade-in duration-700">
      <h2 className="text-headline-lg text-md3-on-surface mb-xs">Skills Hub</h2>
      <p className="text-md3-on-surface-variant mb-md3-lg">Browse, install, and manage AI skill extensions.</p>

      <div className="flex gap-sm mb-md3-lg flex-wrap">
        {SKILL_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={cn(
            'px-md3-md py-sm rounded-lg text-label-sm font-medium transition-all',
            category === cat ? 'bg-md3-primary/10 text-md3-primary border border-md3-primary/20' : 'text-md3-on-surface-variant hover:bg-md3-surface-container-low border border-transparent'
          )}>{cat}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md3-md">
        {filtered.map(skill => (
          <div key={skill.id} className="glass-card bg-white/80 rounded-xl p-md3-lg border border-md3-outline-variant/20 hover:border-md3-primary/30 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-md3-md">
              <div className="w-12 h-12 rounded-xl bg-md3-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-md3-primary">{skill.icon}</span>
              </div>
              {skill.status === 'installed' ? (
                <span className="px-sm py-xs bg-emerald-100 text-emerald-700 text-label-sm rounded-full flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Installed
                </span>
              ) : (
                <button className="px-sm py-xs bg-md3-primary text-md3-on-primary text-label-sm rounded-full hover:bg-md3-primary/90 transition-colors flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">download</span> Install
                </button>
              )}
            </div>
            <h3 className="text-label-md text-[15px] font-bold text-md3-on-surface mb-xs group-hover:text-md3-primary transition-colors">{skill.name}</h3>
            <p className="text-body-sm text-md3-on-surface-variant mb-md3-sm line-clamp-2">{skill.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-label-sm text-md3-on-surface-variant/60">by {skill.author}</span>
              <span className="px-xs py-[2px] bg-md3-surface-container text-md3-on-surface-variant text-[10px] rounded">{skill.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const DATASOURCES_DATA = [
  { id: 'd1', name: 'PostgreSQL', icon: 'database', description: 'Connect to PostgreSQL databases for schema-aware queries', type: 'Database', status: 'connected', lastSync: '2 min ago' },
  { id: 'd2', name: 'GitHub Repos', icon: 'code', description: 'Index repository code, issues, and pull requests', type: 'VCS', status: 'connected', lastSync: '5 min ago' },
  { id: 'd3', name: 'Google Drive', icon: 'folder_open', description: 'Access documents, spreadsheets, and presentations', type: 'Storage', status: 'available', lastSync: null },
  { id: 'd4', name: 'Slack Workspace', icon: 'forum', description: 'Index channels and messages for context-aware responses', type: 'Communication', status: 'available', lastSync: null },
  { id: 'd5', name: 'Jira Projects', icon: 'task_alt', description: 'Sync issues, sprints, and project metadata', type: 'Project Management', status: 'available', lastSync: null },
  { id: 'd6', name: 'Notion Workspace', icon: 'edit_note', description: 'Connect Notion pages and databases for knowledge retrieval', type: 'Knowledge', status: 'available', lastSync: null },
]

function DataSourcesContent() {
  return (
    <div className="animate-in fade-in duration-700">
      <h2 className="text-headline-lg text-md3-on-surface mb-xs">Data Sources</h2>
      <p className="text-md3-on-surface-variant mb-md3-lg">Connect and manage data sources for AI context and retrieval.</p>

      {/* Connected Sources Summary */}
      <div className="flex gap-md3-md mb-md3-xl">
        <div className="flex-1 glass-card bg-white/80 rounded-xl p-md3-md border border-md3-outline-variant/20 text-center">
          <div className="text-display-sm text-md3-primary">{DATASOURCES_DATA.filter(d => d.status === 'connected').length}</div>
          <div className="text-label-sm text-md3-on-surface-variant">Connected</div>
        </div>
        <div className="flex-1 glass-card bg-white/80 rounded-xl p-md3-md border border-md3-outline-variant/20 text-center">
          <div className="text-display-sm text-md3-on-surface-variant">{DATASOURCES_DATA.filter(d => d.status === 'available').length}</div>
          <div className="text-label-sm text-md3-on-surface-variant">Available</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md3-md">
        {DATASOURCES_DATA.map(source => (
          <div key={source.id} className="glass-card bg-white/80 rounded-xl p-md3-lg border border-md3-outline-variant/20 hover:border-md3-primary/30 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-md3-md">
              <div className="flex items-center gap-md3-md">
                <div className="w-12 h-12 rounded-xl bg-md3-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px] text-md3-tertiary">{source.icon}</span>
                </div>
                <div>
                  <h3 className="text-label-md text-[15px] font-bold text-md3-on-surface group-hover:text-md3-primary transition-colors">{source.name}</h3>
                  <span className="text-label-sm text-md3-on-surface-variant/60">{source.type}</span>
                </div>
              </div>
              {source.status === 'connected' ? (
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 mt-2" title="Connected" />
              ) : (
                <span className="w-3 h-3 rounded-full bg-md3-outline-variant shrink-0 mt-2" title="Not connected" />
              )}
            </div>
            <p className="text-body-sm text-md3-on-surface-variant mb-md3-sm">{source.description}</p>
            <div className="flex items-center justify-between">
              {source.status === 'connected' ? (
                <>
                  <span className="text-label-sm text-emerald-600 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px]">sync</span> Synced {source.lastSync}
                  </span>
                  <button className="text-label-sm text-md3-error hover:underline">Disconnect</button>
                </>
              ) : (
                <button className="px-md3-md py-sm bg-md3-primary text-md3-on-primary rounded-lg text-label-sm hover:bg-md3-primary/90 transition-colors flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">link</span> Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
