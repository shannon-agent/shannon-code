// Context panel — right sidebar showing real session context, active tools, and stats
import { useState, useEffect } from 'react'
import { useAppState } from '../context/AppState'
import { getTools, getWorkingDirInfo } from '../lib/tauri-api'
import type { ToolInfo } from '../types/tauri-events'

export function ContextPanel() {
  const { messages, usage, activeToolCalls } = useAppState()
  const [tools, setTools] = useState<ToolInfo[]>([])
  const [modifiedFiles, setModifiedFiles] = useState<string[]>([])
  const [branch, setBranch] = useState<string>('')

  useEffect(() => {
    getTools().then(setTools).catch(() => {})
    getWorkingDirInfo().then(info => {
      setModifiedFiles(info.modified_files)
      setBranch(info.branch)
    }).catch(() => {})
  }, [])

  const enabledTools = tools.filter(t => t.enabled)
  const totalTokens = usage ? usage.inputTokens + usage.outputTokens : 0
  const toolCallCount = activeToolCalls.length

  return (
    <aside className="w-[300px] border-l border-md3-outline-variant/10 glass-panel shrink-0 p-md3-lg overflow-y-auto">
      <div className="space-y-md3-xl">

        {/* Working Directory */}
        {branch && (
          <section>
            <div className="flex items-center justify-between mb-md3-md">
              <h3 className="text-label-md text-md3-on-surface uppercase tracking-wider opacity-60">Working Dir</h3>
              <span className="px-xs py-[2px] bg-md3-primary/10 text-md3-primary text-[10px] font-bold rounded flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">branch</span>
                {branch}
              </span>
            </div>
            {modifiedFiles.length > 0 ? (
              <div className="space-y-sm">
                {modifiedFiles.slice(0, 6).map((file) => (
                  <div key={file} className="p-md3-sm bg-md3-surface-container rounded-lg flex items-center gap-md3-sm border border-md3-outline-variant/10">
                    <span className="material-symbols-outlined text-[16px] text-md3-tertiary">edit_note</span>
                    <span className="text-label-sm truncate">{file}</span>
                  </div>
                ))}
                {modifiedFiles.length > 6 && (
                  <p className="text-label-sm text-md3-on-surface-variant opacity-60">+{modifiedFiles.length - 6} more</p>
                )}
              </div>
            ) : (
              <p className="text-label-sm text-md3-on-surface-variant opacity-50 italic">No modified files</p>
            )}
          </section>
        )}

        {/* Active Tools */}
        <section>
          <div className="flex items-center justify-between mb-md3-md">
            <h3 className="text-label-md text-md3-on-surface uppercase tracking-wider opacity-60">Active Tools</h3>
            <span className="px-xs py-[2px] bg-md3-tertiary/10 text-md3-tertiary text-[10px] font-bold rounded">{enabledTools.length}</span>
          </div>
          <div className="flex flex-wrap gap-xs">
            {enabledTools.length > 0 ? enabledTools.slice(0, 8).map(tool => (
              <span key={tool.name} className="px-md3-sm py-xs bg-md3-primary/10 text-md3-primary text-label-sm rounded-full border border-md3-primary/20 flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">build</span>
                {tool.name}
              </span>
            )) : (
              <p className="text-label-sm text-md3-on-surface-variant opacity-50 italic">Loading tools...</p>
            )}
          </div>
        </section>

        {/* Session Stats */}
        <section>
          <h3 className="text-label-md text-md3-on-surface uppercase tracking-wider opacity-60 mb-md3-md">Session Stats</h3>
          <div className="bg-md3-surface-container rounded-xl p-md3-md border border-md3-outline-variant/10 space-y-sm">
            {[
              { label: 'Messages', value: String(messages.length), icon: 'chat' },
              { label: 'Tokens Used', value: totalTokens > 0 ? totalTokens.toLocaleString() : '--', icon: 'data_usage' },
              { label: 'Tool Calls', value: String(toolCallCount), icon: 'build' },
              { label: 'Cost', value: usage?.costUsd ? `$${usage.costUsd.toFixed(4)}` : '--', icon: 'payments' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between py-xs">
                <div className="flex items-center gap-sm text-md3-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">{stat.icon}</span>
                  <span className="text-label-sm">{stat.label}</span>
                </div>
                <span className="text-label-sm font-medium text-md3-on-surface">{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Visual Analysis */}
        <section className="space-y-md3-md">
          <h3 className="text-label-md text-md3-on-surface uppercase tracking-wider opacity-60">Visual Analysis</h3>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-inner border border-md3-outline-variant/20 relative group bg-md3-surface-container">
            <div className="w-full h-full bg-gradient-to-br from-md3-primary/10 via-md3-secondary/5 to-md3-tertiary/10 flex items-center justify-center">
              <div className="text-center space-y-md3-sm">
                <span className="material-symbols-outlined text-[40px] text-md3-primary/40">analytics</span>
                <p className="text-label-sm text-md3-on-surface-variant/60">Agent-generated visualizations will appear here</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-md3-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <button className="bg-white text-md3-primary px-md3-lg py-md3-md rounded-xl text-label-md shadow-lg">
                Expand Visual
              </button>
            </div>
          </div>
          <p className="text-body-sm text-center opacity-60">Analysis Preview</p>
        </section>
      </div>
    </aside>
  )
}
