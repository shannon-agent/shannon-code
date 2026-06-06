// Plugin browser for managing MCP servers
import { useState } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { PluginCard } from './PluginCard'

interface Plugin {
  name: string
  command: string
  enabled: boolean
  connected: boolean
  toolCount: number
  tools?: string[]
}

interface PluginBrowserProps {
  plugins: Plugin[]
  onAddPlugin: (plugin: Omit<Plugin, 'connected' | 'toolCount'>) => void
  onTogglePlugin: (name: string) => void
  onRemovePlugin: (name: string) => void
  onRefreshTools?: (name: string) => void
}

/**
 * Plugin browser for managing MCP servers
 * - List of MCP server cards with status indicator
 * - Add server form: name, command/URL, toggle enabled
 * - Remove server button with confirmation
 * - Search bar to filter tools across all servers
 * - Tokyo Night styling
 */
export function PluginBrowser({
  plugins,
  onAddPlugin,
  onTogglePlugin,
  onRemovePlugin,
  onRefreshTools
}: PluginBrowserProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newPlugin, setNewPlugin] = useState({
    name: '',
    command: '',
    enabled: true
  })

  // Filter plugins by search query
  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.tools?.some(tool =>
      tool.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleAddPlugin = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPlugin.name && newPlugin.command) {
      onAddPlugin(newPlugin)
      setNewPlugin({ name: '', command: '', enabled: true })
      setShowAddForm(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
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
