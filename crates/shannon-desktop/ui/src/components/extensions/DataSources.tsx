import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'
import * as api from '@/lib/tauri-api'
import type { McpServerInfo } from '@/types'

export default function DataSources() {
  const { mcpServers, refreshMcpServers } = useApp()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCommand, setNewCommand] = useState('')
  const [newArgs, setNewArgs] = useState('')
  const [restarting, setRestarting] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!newName.trim() || !newCommand.trim()) return
    try {
      await api.addMcpServer(newName.trim(), newCommand.trim(), newArgs.trim() ? newArgs.trim().split(/\s+/) : [], {})
      setNewName('')
      setNewCommand('')
      setNewArgs('')
      setAdding(false)
      await refreshMcpServers()
    } catch (e) { console.warn("DataSources error:", e) }
  }

  const handleRemove = async (name: string) => {
    if (!confirm(`Remove data source "${name}"?`)) return
    try {
      await api.removeMcpServer(name)
      await refreshMcpServers()
    } catch (e) { console.warn("DataSources error:", e) }
  }

  const handleRestart = async (name: string) => {
    setRestarting(name)
    try { await api.restartMcpServer(name) } catch (e) { console.warn("DataSources error:", e) }
    setRestarting(null)
    await refreshMcpServers()
  }

  return (
    <div className="max-w-[1200px] mx-auto px-lg py-xl">
      <div className="mb-lg flex items-center justify-between">
        <div>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Data Sources</h2>
          <p className="text-body-md text-on-surface-variant max-w-2xl">Manage MCP servers that provide tools and data to your agents.</p>
        </div>
        <Button
          className="px-lg py-sm bg-primary text-white rounded-xl font-bold flex items-center gap-sm hover:shadow-md active:scale-95 transition-all cursor-pointer"
          onClick={() => setAdding(true)}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Source
        </Button>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="mb-lg bg-white border border-primary/30 rounded-xl p-lg shadow-sm">
          <h3 className="font-headline-md text-on-surface mb-md">Add MCP Server</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
            <Input className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-md py-sm font-body-sm" placeholder="Name (e.g. my-server)" value={newName} onChange={e => setNewName(e.target.value)} />
            <Input className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-md py-sm font-body-sm" placeholder="Command (e.g. npx my-mcp-server)" value={newCommand} onChange={e => setNewCommand(e.target.value)} />
            <Input className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-md py-sm font-body-sm" placeholder="Args (space-separated, optional)" value={newArgs} onChange={e => setNewArgs(e.target.value)} />
          </div>
          <div className="flex gap-sm">
            <Button className="px-lg py-sm bg-primary text-white rounded-lg font-label-md cursor-pointer" onClick={handleAdd}>Add Server</Button>
            <Button className="px-lg py-sm border border-outline-variant rounded-lg font-label-md text-on-surface cursor-pointer" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-lg pb-10">
        {mcpServers.length === 0 && !adding && (
          <div className="col-span-12 text-center py-xl">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">cloud_off</span>
            <p className="font-body-md text-on-surface-variant mt-md">No MCP servers configured.</p>
            <p className="font-body-sm text-on-surface-variant opacity-60">Click "Add Source" to connect a data source.</p>
          </div>
        )}

        {mcpServers.map(server => (
          <McpServerCard
            key={server.name}
            server={server}
            restarting={restarting}
            onRestart={handleRestart}
            onRemove={handleRemove}
          />
        ))}

        {/* Add New Source Card */}
        {!adding && (
          <div className="col-span-12 lg:col-span-4 bg-surface-container-low/50 border border-dashed border-outline-variant rounded-xl p-md flex flex-col justify-center items-center gap-md min-h-[140px] group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setAdding(true)}>
            <p className="font-label-md text-label-md font-medium text-on-surface-variant">Add New Source</p>
            <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-variant border-dashed flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container/20 group-hover:text-primary transition-all">
              <span className="material-symbols-outlined text-[28px]">add</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function McpServerCard({ server, restarting, onRestart, onRemove }: {
  server: McpServerInfo
  restarting: string | null
  onRestart: (name: string) => void
  onRemove: (name: string) => void
}) {
  const statusColor = server.connected ? 'bg-emerald-500' : 'bg-error'
  const statusText = server.connected ? 'Connected' : 'Disconnected'
  const statusBg = server.connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'

  return (
    <div className={`col-span-12 md:col-span-6 lg:col-span-4 bg-white border rounded-xl p-md shadow-sm hover:shadow-md transition-shadow ${server.connected ? 'border-outline-variant/50' : 'border-error/20'}`}>
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-md">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${server.connected ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'}`}>
            <span className="material-symbols-outlined">database</span>
          </div>
          <div>
            <h4 className="font-label-md text-label-md font-bold text-on-surface">{server.name}</h4>
            <p className="text-label-sm font-label-sm text-on-surface-variant">{server.tool_count} tools</p>
          </div>
        </div>
        <span className={`px-sm py-[2px] rounded-full text-label-sm font-label-sm flex items-center gap-xs border ${statusBg}`}>
          <span className={`w-2 h-2 rounded-full ${statusColor} ${server.connected ? '' : ''}`} />
          {statusText}
        </span>
      </div>
      <div className="flex items-center gap-sm pt-sm border-t border-outline-variant/30">
        <Button
          variant="ghost"
          className="flex-1 py-xs rounded-lg font-label-sm text-on-surface-variant hover:text-primary cursor-pointer"
          onClick={() => onRestart(server.name)}
          disabled={restarting === server.name}
        >
          {restarting === server.name ? (
            <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[16px]">sync</span>
          )}
        </Button>
        <Button variant="ghost" className="py-xs rounded-lg text-on-surface-variant hover:text-error cursor-pointer" onClick={() => onRemove(server.name)}>
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </Button>
      </div>
    </div>
  )
}
