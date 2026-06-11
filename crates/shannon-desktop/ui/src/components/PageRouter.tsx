// Page router — maps PageId to rendered content
import { useState, useEffect, useMemo } from 'react'
import { cn } from '../lib/utils'
import { listSkills, listAgents, listMcpServers, addMcpServer, removeMcpServer, restartMcpServer } from '../lib/tauri-api'
import type { SkillInfo } from '../lib/tauri-api'
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

// --- Skills Hub — wired to listSkills() API ---

const CATEGORY_COLORS = [
  { iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  { iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  { iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
]

function SkillsHubContent() {
  const [activeTab, setActiveTab] = useState('All')
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSkills = () => {
    setLoading(true)
    setError(null)
    listSkills()
      .then(setSkills)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load skills'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadSkills() }, [])

  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, SkillInfo[]> = {}
    for (const skill of skills) {
      const cat = skill.category || 'general'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(skill)
    }
    return grouped
  }, [skills])

  return (
    <div className="max-w-[1200px] mx-auto px-md3-lg pt-md3-lg pb-md3-xl">
      <section className="mb-md3-xl mt-4">
        <div className="flex items-center justify-between mb-md3-lg">
          <h3 className="text-headline-md text-[20px] font-bold text-md3-on-surface">Available Skills</h3>
          <div className="flex gap-sm">
            {['All', ...Object.keys(skillsByCategory)].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
                'px-md3-md py-sm rounded-full text-label-md text-[14px] font-bold cursor-pointer',
                activeTab === tab ? 'bg-md3-surface-container-high text-md3-on-surface' : 'text-md3-on-surface-variant hover:bg-md3-surface-container-high transition-colors'
              )}>{tab}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-xl text-md3-on-surface-variant">Loading skills...</div>
        ) : error ? (
          <div className="text-center py-xl">
            <p className="text-md3-error mb-sm">{error}</p>
            <button onClick={loadSkills} className="px-md3-md py-sm bg-md3-primary text-md3-on-primary rounded-lg text-label-md font-bold cursor-pointer">Retry</button>
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-xl text-md3-on-surface-variant">No skills available</div>
        ) : (
          Object.entries(skillsByCategory)
            .filter(([cat]) => activeTab === 'All' || cat === activeTab)
            .map(([category, catSkills], catIdx) => (
              <div key={category} className="mb-md3-lg">
                <h4 className="text-label-md text-[14px] text-md3-on-surface-variant uppercase tracking-widest mb-md3-md">{category}</h4>
                <div className="flex flex-wrap gap-md3-md">
                  {catSkills.map((skill, skillIdx) => {
                    const colorSet = CATEGORY_COLORS[(catIdx + skillIdx) % CATEGORY_COLORS.length]
                    return (
                      <div key={skill.name} className="group cursor-pointer bg-white border border-md3-outline-variant/50 rounded-xl p-md3-md flex items-center gap-md3-md hover:border-md3-primary transition-all shadow-sm">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorSet.iconBg, colorSet.iconColor)}>
                          <span className="material-symbols-outlined">terminal</span>
                        </div>
                        <div>
                          <p className="text-label-md text-[14px] font-bold text-md3-on-surface">{skill.name}</p>
                          <p className="text-label-sm text-[12px] text-md3-on-surface-variant">{skill.description}</p>
                        </div>
                        <span className="material-symbols-outlined text-md3-on-surface-variant group-hover:text-md3-primary ml-sm transition-transform group-hover:scale-125">add_circle</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
        )}
      </section>
    </div>
  )
}

// --- My Agents — wired to listAgents() API ---

const AGENT_ICONS = ['smart_toy', 'code', 'psychology', 'science', 'engineering', 'schedule']
const AGENT_COLORS = [
  { iconBg: 'bg-md3-primary/10', iconColor: 'text-md3-primary' },
  { iconBg: 'bg-md3-secondary/10', iconColor: 'text-md3-secondary' },
  { iconBg: 'bg-md3-tertiary/10', iconColor: 'text-md3-tertiary' },
]

function MyAgentsContent() {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAgents = () => {
    setLoading(true)
    setError(null)
    listAgents()
      .then(setAgents)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load agents'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAgents() }, [])

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

      {loading ? (
        <div className="text-center py-xl text-md3-on-surface-variant">Loading agents...</div>
      ) : error ? (
        <div className="text-center py-xl">
          <p className="text-md3-error mb-sm">{error}</p>
          <button onClick={loadAgents} className="px-md3-md py-sm bg-md3-primary text-md3-on-primary rounded-lg text-label-md font-bold cursor-pointer">Retry</button>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-xl text-md3-on-surface-variant">No agents available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md3-lg">
          {agents.map((agent, i) => {
            const colorSet = AGENT_COLORS[i % AGENT_COLORS.length]
            const isActive = agent.status === 'running'
            return (
              <div key={agent.id} className="glass-card bg-white/70 backdrop-blur-md p-md3-lg rounded-xl shadow-sm flex flex-col group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-md3-md">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorSet.iconBg, colorSet.iconColor)}>
                    <span className="material-symbols-outlined text-[28px]">{AGENT_ICONS[i % AGENT_ICONS.length]}</span>
                  </div>
                  <div className={cn('flex items-center gap-xs px-sm py-1 rounded-full', isActive ? 'bg-green-100 text-green-700' : 'bg-md3-surface-container-high text-md3-on-surface-variant')}>
                    <span className={cn('w-2 h-2 rounded-full', isActive ? 'bg-green-500 animate-pulse' : 'bg-md3-outline-variant')} />
                    <span className="text-label-sm text-[12px] capitalize">{agent.status}</span>
                  </div>
                </div>

                <div className="mb-md3-lg">
                  <h3 className="text-headline-md text-[18px] font-bold text-md3-on-surface">{agent.name}</h3>
                  <p className="text-label-sm text-[12px] text-md3-on-surface-variant">{agent.model}</p>
                </div>

                {agent.task && (
                  <div className="space-y-sm mb-md3-lg">
                    <div className="flex justify-between items-center text-label-md text-[14px]">
                      <span className="text-md3-on-surface-variant">Current Task</span>
                      <span className="font-bold truncate max-w-[180px]">{agent.task}</span>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-md3-md border-t border-md3-outline-variant flex gap-sm">
                  <button className="flex-grow py-2 rounded-lg font-bold text-label-md text-[14px] cursor-pointer transition-all bg-md3-surface-container-high text-md3-on-surface hover:bg-md3-surface-container-high/80">Configure</button>
                  <button className="p-2 rounded-lg border border-md3-outline-variant hover:text-md3-primary transition-colors cursor-pointer flex items-center justify-center">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add New Agent */}
          <div className="border-2 border-dashed border-md3-outline-variant p-md3-lg rounded-xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-md3-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-md3-surface-container flex items-center justify-center text-md3-on-surface-variant group-hover:bg-md3-primary/10 group-hover:text-md3-primary transition-colors mb-md3-md">
              <span className="material-symbols-outlined text-[32px]">add</span>
            </div>
            <h3 className="text-body-lg text-[16px] font-bold text-md3-on-surface">New Specialization</h3>
            <p className="text-label-md text-[14px] text-md3-on-surface-variant max-w-[200px]">Define a custom prompt or import a model to create a new agent.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Data Sources — matches design/src/components/extensions/DataSources.tsx ---

export function DataSourcesContent() {
  const [servers, setServers] = useState<McpServerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newServer, setNewServer] = useState({ name: '', command: '' })
  const [restarting, setRestarting] = useState<string | null>(null)

  const refreshServers = () => {
    setLoading(true)
    setError(null)
    listMcpServers()
      .then(setServers)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load servers'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refreshServers() }, [])

  const handleAddServer = async () => {
    if (!newServer.name || !newServer.command) return
    try {
      await addMcpServer(newServer.name, newServer.command, [], {})
      setNewServer({ name: '', command: '' })
      setShowAddForm(false)
      refreshServers()
    } catch (err) {
      console.error('Failed to add server:', err)
    }
  }

  const handleRemoveServer = async (name: string) => {
    try {
      await removeMcpServer(name)
      refreshServers()
    } catch (err) {
      console.error('Failed to remove server:', err)
    }
  }

  const handleRestartServer = async (name: string) => {
    setRestarting(name)
    try {
      await restartMcpServer(name)
      refreshServers()
    } catch (err) {
      console.error('Failed to restart server:', err)
    } finally {
      setRestarting(null)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-md3-lg py-md3-xl">
      <div className="mb-md3-lg">
        <h2 className="text-headline-lg text-[28px] font-bold text-md3-on-surface">Data Sources</h2>
        <p className="text-body-md text-[15px] text-md3-on-surface-variant max-w-2xl">Manage MCP server connections that provide tools and data to your agents.</p>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-md3-md px-md3-md py-sm bg-md3-primary text-md3-on-primary rounded-lg text-label-md font-bold hover:bg-md3-primary/90 transition-all cursor-pointer"
        >
          + Add Server
        </button>
      </div>

      {showAddForm && (
        <div className="bg-md3-surface-container-lowest border border-md3-outline-variant/50 rounded-xl p-md3-lg mb-md3-lg shadow-sm">
          <h3 className="text-label-lg font-bold text-md3-on-surface mb-md3-md">Add MCP Server</h3>
          <div className="space-y-sm">
            <input
              placeholder="Server name (e.g., filesystem)"
              value={newServer.name}
              onChange={e => setNewServer(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-md3-md py-sm bg-md3-surface-container border border-md3-outline-variant rounded-lg text-body-sm text-md3-on-surface"
            />
            <input
              placeholder="Command (e.g., npx @modelcontextprotocol/server-filesystem /path)"
              value={newServer.command}
              onChange={e => setNewServer(prev => ({ ...prev, command: e.target.value }))}
              className="w-full px-md3-md py-sm bg-md3-surface-container border border-md3-outline-variant rounded-lg text-body-sm text-md3-on-surface font-mono"
            />
            <div className="flex gap-sm pt-sm">
              <button onClick={handleAddServer} disabled={!newServer.name || !newServer.command} className="px-md3-md py-sm bg-md3-primary text-md3-on-primary rounded-lg text-label-md font-bold disabled:opacity-50 cursor-pointer">Add</button>
              <button onClick={() => { setShowAddForm(false); setNewServer({ name: '', command: '' }) }} className="px-md3-md py-sm border border-md3-outline-variant rounded-lg text-label-md text-md3-on-surface cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-md3-xl">
          <span className="material-symbols-outlined animate-spin text-md3-primary">progress_activity</span>
          <span className="ml-sm text-md3-on-surface-variant">Loading servers...</span>
        </div>
      ) : error ? (
        <div className="text-center py-md3-xl">
          <span className="material-symbols-outlined text-[48px] text-md3-error">error</span>
          <p className="text-body-md text-md3-error mt-sm">{error}</p>
          <button onClick={refreshServers} className="mt-md3-md px-md3-md py-sm bg-md3-primary text-md3-on-primary rounded-lg text-label-md font-bold cursor-pointer">Retry</button>
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-md3-xl">
          <span className="material-symbols-outlined text-[48px] text-md3-on-surface-variant">cloud_off</span>
          <p className="text-body-md text-md3-on-surface-variant mt-sm">No MCP servers configured</p>
          <p className="text-label-sm text-[12px] text-md3-on-surface-variant mt-xs">Add servers in your .mcp.json or settings.json</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-md3-lg pb-10">
          {/* Featured server — first connected server gets the large card */}
          {servers.filter(s => s.connected).slice(0, 1).map(server => (
            <div key={server.name} className="col-span-12 lg:col-span-8 bg-md3-surface-container-lowest border border-md3-outline-variant/50 rounded-xl p-md3-lg shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-md3-xl relative z-10">
                <div className="flex items-center gap-md3-md">
                  <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                    <span className="material-symbols-outlined text-blue-600 text-[32px]">dns</span>
                  </div>
                  <div>
                    <h3 className="text-headline-md text-[20px] font-bold text-md3-on-surface">{server.name}</h3>
                    <div className="flex items-center gap-sm mt-xs">
                      <span className="px-sm py-[2px] bg-emerald-50 text-emerald-700 rounded-full text-label-sm text-[12px] font-bold flex items-center gap-xs border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                      {server.last_connected && (
                        <span className="text-label-sm text-[12px] text-md3-on-surface-variant">{server.last_connected}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="px-md3-md py-sm border border-md3-outline-variant rounded-lg text-label-md text-[14px] font-bold text-md3-on-surface hover:bg-md3-surface-container-high transition-all cursor-pointer">Configure</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-md3-lg relative z-10">
                <div className="p-md3-md rounded-xl bg-md3-surface-container-low border border-md3-outline-variant/30">
                  <p className="text-label-sm text-[12px] text-md3-on-surface-variant uppercase tracking-wider mb-sm">Tools Available</p>
                  <p className="text-headline-md text-[20px] font-bold text-md3-on-surface">{server.tool_count}</p>
                </div>
                <div className="p-md3-md rounded-xl bg-md3-surface-container-low border border-md3-outline-variant/30">
                  <p className="text-label-sm text-[12px] text-md3-on-surface-variant uppercase tracking-wider mb-sm">Status</p>
                  <p className="text-headline-md text-[20px] font-bold text-emerald-600">Active</p>
                </div>
                <div className="p-md3-md rounded-xl bg-md3-surface-container-low border border-md3-outline-variant/30">
                  <p className="text-label-sm text-[12px] text-md3-on-surface-variant uppercase tracking-wider mb-sm">Command</p>
                  <p className="text-label-sm text-[12px] text-md3-on-surface font-mono truncate" title={server.command}>{server.command}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Summary panel when connected servers exist */}
          {servers.some(s => s.connected) && (
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-md3-lg">
              <div className="bg-white border border-md3-outline-variant/50 rounded-xl p-md3-lg shadow-sm flex-1">
                <div className="flex items-center gap-sm mb-md3-md">
                  <span className="material-symbols-outlined text-md3-primary">bolt</span>
                  <h3 className="text-label-md text-[14px] font-bold text-md3-on-surface">Server Overview</h3>
                </div>
                <div className="space-y-md3-md">
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm text-[12px] text-md3-on-surface-variant">Connected</span>
                    <span className="text-label-md text-[14px] font-bold text-emerald-600">{servers.filter(s => s.connected).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm text-[12px] text-md3-on-surface-variant">Total Servers</span>
                    <span className="text-label-md text-[14px] font-bold text-md3-on-surface">{servers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-label-sm text-[12px] text-md3-on-surface-variant">Total Tools</span>
                    <span className="text-label-md text-[14px] font-bold text-md3-primary">{servers.reduce((sum, s) => sum + s.tool_count, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Server cards */}
          {servers.map(server => (
            <div key={server.name} className={cn(
              'col-span-12 md:col-span-6 lg:col-span-4 rounded-xl p-md3-md shadow-sm hover:shadow-md transition-shadow cursor-pointer',
              server.connected
                ? 'bg-white border border-md3-outline-variant/50'
                : 'bg-white border border-md3-error/20'
            )}>
              <div className="flex items-center justify-between mb-md3-md">
                <div className="flex items-center gap-md3-md">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    server.connected ? 'bg-md3-on-surface text-white' : 'bg-md3-error/10 text-md3-error'
                  )}>
                    <span className="material-symbols-outlined">dns</span>
                  </div>
                  <div>
                    <h4 className="text-label-md text-[14px] font-bold text-md3-on-surface">{server.name}</h4>
                    <p className="text-label-sm text-[12px] text-md3-on-surface-variant">{server.tool_count} tools</p>
                  </div>
                </div>
                <span className={cn(
                  'material-symbols-outlined',
                  server.connected ? 'text-emerald-600' : 'text-md3-error'
                )}>
                  {server.connected ? 'check_circle' : 'error'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-sm border-t border-md3-outline-variant/30">
                <span className="text-label-sm text-[12px] text-md3-on-surface-variant truncate max-w-[40%]" title={server.command}>{server.command}</span>
                <div className="flex items-center gap-xs">
                  <span className={cn(
                    'text-label-sm text-[12px] font-bold',
                    server.connected ? 'text-emerald-600' : 'text-md3-error'
                  )}>
                    {server.connected ? 'Healthy' : 'Disconnected'}
                  </span>
                  <button
                    onClick={() => handleRestartServer(server.name)}
                    disabled={restarting === server.name}
                    title="Restart server"
                    className="p-1 rounded hover:bg-md3-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px] text-md3-on-surface-variant">{restarting === server.name ? 'progress_activity' : 'refresh'}</span>
                  </button>
                  <button
                    onClick={() => handleRemoveServer(server.name)}
                    title="Remove server"
                    className="p-1 rounded hover:bg-md3-error/10 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-md3-error">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
