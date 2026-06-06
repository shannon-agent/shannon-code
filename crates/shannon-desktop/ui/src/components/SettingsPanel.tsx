// Settings panel for API key, base URL, theme, shortcuts, and other configurations
import { useState, useEffect, useCallback } from 'react'
import { Eye, EyeOff, Save, Palette, Keyboard, Wrench } from 'lucide-react'
import { configure, getConfig, getTools } from '../lib/tauri-api'
import { useTheme } from '../context/ThemeContext'
import type { ToolInfo } from '../types/tauri-events'

function getToolCategory(name: string): string {
  const prefix = name.split('_')[0]
  switch (prefix) {
    case 'bash':
    case 'shell':
      return 'Execution'
    case 'file':
    case 'read':
    case 'write':
    case 'edit':
      return 'File Operations'
    case 'search':
    case 'grep':
    case 'glob':
    case 'find':
      return 'Search'
    case 'web':
    case 'fetch':
      return 'Network'
    default:
      return 'Other'
  }
}

export function SettingsPanel() {
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [tools, setTools] = useState<ToolInfo[]>([])
  const [disabledTools, setDisabledTools] = useState<Set<string>>(new Set())
  const { theme, setTheme, themes } = useTheme()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await getConfig()
      setApiKey(data.api_key)
      setBaseUrl(data.base_url || '')
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  useEffect(() => {
    getTools().then(setTools).catch(() => {})
  }, [])

  const handleToggleTool = useCallback(async (toolName: string, enabled: boolean) => {
    setDisabledTools(prev => {
      const next = new Set(prev)
      if (enabled) {
        next.delete(toolName)
      } else {
        next.add(toolName)
      }
      return next
    })
    try {
      await configure({ key: 'disabled_tools', value: JSON.stringify([...disabledTools, ...(!enabled ? [toolName] : [])]) })
    } catch {
      // Revert on failure
      setDisabledTools(prev => {
        const next = new Set(prev)
        if (enabled) {
          next.add(toolName)
        } else {
          next.delete(toolName)
        }
        return next
      })
    }
  }, [disabledTools])

  const handleSave = async (key: string, value: string) => {
    try {
      setSaving(true)
      setSaveStatus('idle')
      await configure({ key, value })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error(`Failed to save ${key}:`, error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } finally {
      setSaving(false)
    }
  }

  const redactedKey = apiKey ? `${apiKey.slice(0, 8)}...` : ''

  return (
    <div className="p-4" role="region" aria-label="Settings panel">
      <h2 id="settings-title" className="text-lg font-semibold text-[#c0caf5] mb-4">Settings</h2>

      <div className="space-y-4" aria-labelledby="settings-title">
        {/* API Key */}
        <div>
          <label htmlFor="api-key-input" className="block text-sm font-medium text-[#a9b1d6] mb-1">
            API Key
          </label>
          <div className="relative">
            <input
              id="api-key-input"
              type={showApiKey ? 'text' : 'password'}
              value={showApiKey ? apiKey : redactedKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 pr-20 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#a9b1d6] placeholder-[#565f89] focus:outline-none focus:ring-2 focus:ring-[#7aa2f7] focus:border-transparent"
              aria-describedby="api-key-description"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-1 hover:bg-[#24283b] rounded transition-colors"
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                type="button"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4 text-[#565f89]" />
                ) : (
                  <Eye className="w-4 h-4 text-[#565f89]" />
                )}
              </button>
              <button
                onClick={() => handleSave('api_key', apiKey)}
                disabled={saving}
                className="p-1 hover:bg-[#9ece6a]/20 rounded transition-colors disabled:opacity-50"
                aria-label="Save API key"
                type="button"
              >
                <Save className="w-4 h-4 text-[#9ece6a]" />
              </button>
            </div>
          </div>
          <p id="api-key-description" className="text-xs text-[#565f89] mt-1">
            Your API key is stored locally and never shared
          </p>
        </div>

        {/* Base URL */}
        <div>
          <label htmlFor="base-url-input" className="block text-sm font-medium text-[#a9b1d6] mb-1">
            Base URL (optional)
          </label>
          <div className="relative">
            <input
              id="base-url-input"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full px-3 py-2 pr-10 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#a9b1d6] placeholder-[#565f89] focus:outline-none focus:ring-2 focus:ring-[#7aa2f7] focus:border-transparent"
              aria-describedby="base-url-description"
            />
            <button
              onClick={() => handleSave('base_url', baseUrl)}
              disabled={saving}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#9ece6a]/20 rounded transition-colors disabled:opacity-50"
              aria-label="Save base URL"
              type="button"
            >
              <Save className="w-4 h-4 text-[#9ece6a]" />
            </button>
          </div>
          <p id="base-url-description" className="text-xs text-[#565f89] mt-1">
            Custom API endpoint URL (leave empty for default)
          </p>
        </div>

        {/* Theme Selector */}
        <div>
          <label htmlFor="theme-select" className="block text-sm font-medium text-[#a9b1d6] mb-1 flex items-center gap-2">
            <Palette className="w-4 h-4" aria-hidden />
            Theme
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#a9b1d6] focus:outline-none focus:ring-2 focus:ring-[#7aa2f7] focus:border-transparent"
            aria-describedby="theme-description"
          >
            {themes.map((t) => (
              <option key={t} value={t}>
                {t === 'tokyo-night' && 'Tokyo Night'}
                {t === 'tokyo-night-light' && 'Tokyo Night Light'}
                {t === 'catppuccin' && 'Catppuccin Mocha'}
                {t === 'nord' && 'Nord'}
              </option>
            ))}
          </select>
          <p id="theme-description" className="text-xs text-[#565f89] mt-1">
            Choose your preferred color scheme
          </p>
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div
            role="status"
            aria-live="polite"
            className={`text-sm ${
              saveStatus === 'success' ? 'text-[#9ece6a]' : 'text-[#f7768e]'
            }`}
          >
            {saveStatus === 'success' ? '✓ Saved successfully' : '✗ Failed to save'}
          </div>
        )}

        {/* Global Shortcuts Section */}
        <div className="pt-4 border-t border-[#414868]">
          <h3 className="text-sm font-semibold text-[#c0caf5] mb-3 flex items-center gap-2">
            <Keyboard className="w-4 h-4" aria-hidden />
            Global Shortcuts
          </h3>
          <div className="space-y-2" role="list" aria-label="Keyboard shortcuts">
            <div className="flex items-center justify-between p-2 bg-[#1a1b26] rounded border border-[#414868]" role="listitem">
              <div className="text-sm text-[#a9b1d6]">
                <span className="font-medium">Show/Hide Window</span>
                <p className="text-xs text-[#565f89]">Toggle Shannon visibility</p>
              </div>
              <kbd className="px-2 py-1 bg-[#24283b] text-[#7aa2f7] text-xs rounded border border-[#414868]">
                Ctrl+Shift+S
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#1a1b26] rounded border border-[#414868]" role="listitem">
              <div className="text-sm text-[#a9b1d6]">
                <span className="font-medium">New Session</span>
                <p className="text-xs text-[#565f89]">Create a new conversation</p>
              </div>
              <kbd className="px-2 py-1 bg-[#24283b] text-[#7aa2f7] text-xs rounded border border-[#414868]">
                Ctrl+Shift+N
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#1a1b26] rounded border border-[#414868]" role="listitem">
              <div className="text-sm text-[#a9b1d6]">
                <span className="font-medium">Focus Input</span>
                <p className="text-xs text-[#565f89]">Focus message input field</p>
              </div>
              <kbd className="px-2 py-1 bg-[#24283b] text-[#7aa2f7] text-xs rounded border border-[#414868]">
                Ctrl+Shift+K
              </kbd>
            </div>
          </div>
          <p className="text-xs text-[#565f89] mt-2" role="note">
            Shortcuts work even when Shannon is minimized to tray
          </p>
        </div>

        {/* Tools Section */}
        {tools.length > 0 && (
          <div className="pt-4 border-t border-[#414868]">
            <h3 className="text-sm font-semibold text-[#c0caf5] mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4" aria-hidden />
              Tools
            </h3>
            <div className="space-y-1">
              {Object.entries(
                tools.reduce<Record<string, ToolInfo[]>>((groups, tool) => {
                  const cat = getToolCategory(tool.name)
                  ;(groups[cat] ??= []).push(tool)
                  return groups
                }, {})
              ).map(([category, categoryTools]) => (
                <div key={category}>
                  <div className="text-xs font-medium text-[#565f89] uppercase tracking-wider mb-1 mt-2">{category}</div>
                  {categoryTools.map(tool => (
                    <div key={tool.name} className="flex items-center justify-between p-2 bg-[#1a1b26] rounded border border-[#414868]">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-[#a9b1d6] font-medium">{tool.name}</span>
                        {tool.description && (
                          <p className="text-xs text-[#565f89] truncate">{tool.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleTool(tool.name, disabledTools.has(tool.name))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ml-2 ${
                          !disabledTools.has(tool.name) ? 'bg-[#9ece6a]' : 'bg-[#414868]'
                        }`}
                        role="switch"
                        aria-checked={!disabledTools.has(tool.name)}
                        aria-label={`Toggle ${tool.name}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                            !disabledTools.has(tool.name) ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="pt-4 border-t border-[#414868]">
          <h3 className="text-sm font-semibold text-[#c0caf5] mb-2">About</h3>
          <div className="text-xs text-[#565f89] space-y-1">
            <div>Shannon Desktop v0.1.0</div>
            <div>Rust-based AI code assistant</div>
            <div>
              <a
                href="https://github.com/shannon-code/shannon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7aa2f7] hover:underline"
              >
                GitHub
              </a>
              {' • '}
              <a
                href="https://docs.shannon-code.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7aa2f7] hover:underline"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
