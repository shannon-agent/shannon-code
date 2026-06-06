// Plugin browser for managing MCP servers
import { useState, useEffect } from 'react'
import { Plus, Search, RefreshCw, PlayCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { PluginCard } from './PluginCard'
import { useTauriEvent } from '../hooks/useTauriEvent'

interface Plugin {
  name: string
  command: string
  enabled: boolean
  connected: boolean
  toolCount: number
  tools?: { name: string; description: string }[]
  lastConnected?: number
}

interface PluginBrowserProps {
  plugins: Plugin[]
  onAddPlugin: (plugin: Omit<Plugin, 'connected' | 'toolCount' | 'tools' | 'lastConnected'>) => void
  onTogglePlugin: (name: string) => void
  onRemovePlugin: (name: string) => void
  onRefreshTools?: (name: string) => void
  onTestConnection?: (name: string) => Promise<boolean>
  onEditServer?: (name: string, config: Partial<Plugin>) => void
  onRestartServer?: (name: string) => Promise<boolean>
}

/**
 * Plugin browser for managing MCP servers
 * - List of MCP server cards with status indicator, tool count badge, last connected timestamp
 * - Add server form: name, command, args (JSON textarea), env vars (key-value pairs)
 * - Test Connection button that calls backend to validate server starts
 * - Edit server config inline (command, args, env)
 * - Remove server with confirmation dialog (using shadcn Dialog)
 * - Restart server button on each card
 * - Tokyo Night styling
 */
export function PluginBrowser({
  plugins,
  onAddPlugin,
  onTogglePlugin,
  onRemovePlugin,
  onRefreshTools,
  onTestConnection,
  onEditServer,
  onRestartServer
}: PluginBrowserProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newPlugin, setNewPlugin] = useState({
    name: '',
    command: '',
    args: '',
    env: {} as Record<string, string>,
    enabled: true
  })
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  
  // Listen to MCP server connection events
  useTauriEvent<{ server_name: string; connected: boolean }>('mcp-server-connected', (payload) => {
    setTestResults(prev => ({ ...prev, [payload.server_name]: true }))
  })

  useTauriEvent<{ server_name: string; error?: string }>('mcp-server-disconnected', (payload) => {
    setTestResults(prev => ({ ...prev, [payload.server_name]: false }))
  })

  // Filter plugins by search query
  const safePlugins = plugins || []
  const filteredPlugins = safePlugins.filter(plugin =>
    plugin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.tools?.some(tool =>
      tool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleAddPlugin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPlugin.name && newPlugin.command) {
      try {
        // Parse args as JSON
        let args: string[] = []
        if (newPlugin.args.trim()) {
          args = JSON.parse(newPlugin.args)
        }

        const plugin = {
          name: newPlugin.name,
          command: newPlugin.command,
          enabled: newPlugin.enabled
        }

        onAddPlugin(plugin)

        // Test connection after adding
        if (onTestConnection) {
          setTestingConnection(newPlugin.name)
          const success = await onTestConnection(newPlugin.name)
          setTestResults(prev => ({ ...prev, [newPlugin.name]: success }))
          setTestingConnection(null)
        }

        setNewPlugin({ name: '', command: '', args: '', env: {}, enabled: true })
        setShowAddForm(false)
      } catch (err) {
        console.error('Invalid args JSON:', err)
        alert('Args must be valid JSON array, e.g., ["--arg1", "value1"]')
      }
    }
  }

  const handleTestConnection = async (name: string) => {
    if (onTestConnection) {
      setTestingConnection(name)
      try {
        const success = await onTestConnection(name)
        setTestResults(prev => ({ ...prev, [name]: success }))
      } catch (err) {
        console.error('Connection test failed:', err)
        setTestResults(prev => ({ ...prev, [name]: false }))
      }
      setTestingConnection(null)
    }
  }

  const handleRestartServer = async (name: string) => {
    if (onRestartServer) {
      const success = await onRestartServer(name)
      if (success) {
        setTestResults(prev => ({ ...prev, [name]: true }))
      }
    }
  }

  const handleEnvChange = (key: string, value: string) => {
    setNewPlugin(prev => ({
      ...prev,
      env: { ...prev.env, [key]: value }
    }))
  }

  const handleAddEnvVar = () => {
    const key = prompt('Enter environment variable name:')
    if (key && key.trim()) {
      handleEnvChange(key.trim(), '')
    }
  }

  const handleRemoveEnvVar = (key: string) => {
    setNewPlugin(prev => {
      const newEnv = { ...prev.env }
      delete newEnv[key]
      return { ...prev, env: newEnv }
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="space-y-4">
      {/* Header with Add button and Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#7aa2f7] text-[#1a1b26] rounded-lg hover:bg-[#7aa2f7]/80 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Server
        </button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565f89]" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search servers and tools..."
            className="w-full pl-10 pr-4 py-2 bg-[#1f2335] border border-[#414868] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7]"
          />
        </div>
      </div>

      {/* Add Plugin Form */}
      {showAddForm && (
        <div className="p-4 bg-[#24283b] border border-[#414868] rounded-lg">
          <h3 className="text-[#c0caf5] font-semibold mb-3">Add MCP Server</h3>
          <form onSubmit={handleAddPlugin} className="space-y-3">
            <div>
              <label className="block text-sm text-[#a9b1d6] mb-1">Server Name</label>
              <input
                type="text"
                value={newPlugin.name}
                onChange={(e) => setNewPlugin({ ...newPlugin, name: e.target.value })}
                placeholder="e.g., filesystem"
                className="w-full px-3 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7]"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#a9b1d6] mb-1">Command or URL</label>
              <input
                type="text"
                value={newPlugin.command}
                onChange={(e) => setNewPlugin({ ...newPlugin, command: e.target.value })}
                placeholder="e.g., npx @modelcontextprotocol/server-filesystem /path"
                className="w-full px-3 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7] font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#a9b1d6] mb-1">Arguments (JSON array)</label>
              <textarea
                value={newPlugin.args}
                onChange={(e) => setNewPlugin({ ...newPlugin, args: e.target.value })}
                placeholder='e.g., ["--arg1", "value1", "--arg2", "value2"]'
                className="w-full px-3 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7] font-mono text-sm h-20 resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-[#a9b1d6]">Environment Variables</label>
                <button
                  type="button"
                  onClick={handleAddEnvVar}
                  className="text-xs px-2 py-1 bg-[#7aa2f7] text-[#1a1b26] rounded hover:bg-[#7aa2f7]/80 transition-colors"
                >
                  + Add Variable
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(newPlugin.env).map(([key, value]) => (
                  <div key={key} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={key}
                      readOnly
                      className="w-1/3 px-2 py-1 bg-[#1a1b26] border border-[#414868] rounded text-[#565f89] text-sm"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleEnvChange(key, e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-2 py-1 bg-[#1a1b26] border border-[#414868] rounded text-[#c0caf5] text-sm focus:outline-none focus:border-[#7aa2f7]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEnvVar(key)}
                      className="text-[#f7768e] hover:text-[#db4b4b] transition-colors"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={newPlugin.enabled}
                onChange={(e) => setNewPlugin({ ...newPlugin, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-[#414868] bg-[#1a1b26] text-[#7aa2f7] focus:ring-[#7aa2f7]"
              />
              <label htmlFor="enabled" className="text-sm text-[#a9b1d6]">Enable on add</label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#7aa2f7] text-[#1a1b26] rounded-lg hover:bg-[#7aa2f7]/80 transition-colors font-medium"
              >
                Add Server
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-[#414868] text-[#c0caf5] rounded-lg hover:bg-[#565f89] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plugins List */}
      <div className="space-y-3">
        {filteredPlugins.length === 0 ? (
          <div className="text-center py-8 text-[#565f89]">
            {searchQuery ? 'No matching servers or tools found' : 'No MCP servers configured'}
          </div>
        ) : (
          filteredPlugins.map((plugin) => (
            <PluginCard
              key={plugin.name}
              plugin={plugin}
              onToggle={onTogglePlugin}
              onRemove={onRemovePlugin}
              onTestConnection={onTestConnection ? () => handleTestConnection(plugin.name) : undefined}
              onRestart={onRestartServer ? () => handleRestartServer(plugin.name) : undefined}
              testingConnection={testingConnection === plugin.name}
              testResult={testResults[plugin.name]}
            />
          ))
        )}
      </div>

      {/* Stats Footer */}
      {plugins.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-[#565f89] pt-2 border-t border-[#2a2f44]">
          <span>{plugins.length} servers</span>
          <span>•</span>
          <span>{plugins.filter(p => p.connected).length} connected</span>
          <span>•</span>
          <span>{plugins.reduce((sum, p) => sum + p.toolCount, 0)} total tools</span>
          {onRefreshTools && (
            <button
              onClick={() => plugins.forEach(p => onRefreshTools(p.name))}
              className="ml-auto flex items-center gap-1 text-[#7aa2f7] hover:text-[#9aa5ce] transition-colors"
              title="Refresh all tools"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
        </div>
      )}
    </div>
  )
}
