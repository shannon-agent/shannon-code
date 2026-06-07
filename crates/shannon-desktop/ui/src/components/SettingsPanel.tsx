// Settings panel for API key, base URL, theme, shortcuts, and other configurations
import { useState, useEffect, useCallback } from 'react'
import { Eye, EyeOff, Save, Palette, Keyboard, Wrench } from 'lucide-react'
import { configure, getConfig, getTools } from '../lib/tauri-api'
import { useTheme } from '../context/ThemeContext'
import type { ToolInfo } from '../types/tauri-events'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Switch } from './ui/switch'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion'
import { Skeleton } from './ui/skeleton'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip'
import { Kbd } from './ui/kbd'

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
  const [loadingTools, setLoadingTools] = useState(true)
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
    setLoadingTools(true)
    getTools()
      .then(setTools)
      .catch(() => {})
      .finally(() => setLoadingTools(false))
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
      <h2 id="settings-title" className="text-lg font-semibold text-foreground mb-4">Settings</h2>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div
          role="status"
          aria-live="polite"
          className={`text-sm mb-4 ${
            saveStatus === 'success' ? 'text-success' : 'text-destructive'
          }`}
        >
          {saveStatus === 'success' ? 'Saved successfully' : 'Failed to save'}
        </div>
      )}

      <Accordion type="multiple" defaultValue={['api', 'base-url', 'theme', 'shortcuts', 'tools', 'about']} className="w-full" aria-labelledby="settings-title">
        {/* API Key */}
        <AccordionItem value="api">
          <AccordionTrigger>
            <span id="settings-title" className="text-sm font-medium">API Key</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="relative">
                <input
                  id="api-key-input"
                  type={showApiKey ? 'text' : 'password'}
                  value={showApiKey ? apiKey : redactedKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 pr-20 bg-background border border-border rounded-lg text-secondary-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  aria-describedby="api-key-description"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                    aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                    type="button"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleSave('api_key', apiKey)}
                          disabled={saving}
                          className="p-1 hover:bg-success/20 rounded transition-colors disabled:opacity-50"
                          aria-label="Save API key"
                          type="button"
                        >
                          <Save className="w-4 h-4 text-success" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Save API key</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <p id="api-key-description" className="text-xs text-muted-foreground">
                Your API key is stored locally and never shared
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Base URL */}
        <AccordionItem value="base-url">
          <AccordionTrigger>
            <span className="text-sm font-medium">Base URL (optional)</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="relative">
                <input
                  id="base-url-input"
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.example.com"
                  className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg text-secondary-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  aria-describedby="base-url-description"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSave('base_url', baseUrl)}
                        disabled={saving}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-success/20 rounded transition-colors disabled:opacity-50"
                        aria-label="Save base URL"
                        type="button"
                      >
                        <Save className="w-4 h-4 text-success" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Save base URL</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p id="base-url-description" className="text-xs text-muted-foreground">
                Custom API endpoint URL (leave empty for default)
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Theme Selector */}
        <AccordionItem value="theme">
          <AccordionTrigger>
            <span className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" aria-hidden />
              Theme
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
                <SelectTrigger aria-describedby="theme-description">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === 'tokyo-night' && 'Tokyo Night'}
                      {t === 'tokyo-night-light' && 'Tokyo Night Light'}
                      {t === 'catppuccin' && 'Catppuccin Mocha'}
                      {t === 'nord' && 'Nord'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p id="theme-description" className="text-xs text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Global Shortcuts Section */}
        <AccordionItem value="shortcuts">
          <AccordionTrigger>
            <span className="text-sm font-medium flex items-center gap-2">
              <Keyboard className="w-4 h-4" aria-hidden />
              Global Shortcuts
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2" role="list" aria-label="Keyboard shortcuts">
              <div className="flex items-center justify-between p-2 bg-background rounded border border-border" role="listitem">
                <div className="text-sm text-secondary-foreground">
                  <span className="font-medium">Show/Hide Window</span>
                  <p className="text-xs text-muted-foreground">Toggle Shannon visibility</p>
                </div>
                <Kbd>Ctrl+Shift+S</Kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded border border-border" role="listitem">
                <div className="text-sm text-secondary-foreground">
                  <span className="font-medium">New Session</span>
                  <p className="text-xs text-muted-foreground">Create a new conversation</p>
                </div>
                <Kbd>Ctrl+Shift+N</Kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-background rounded border border-border" role="listitem">
                <div className="text-sm text-secondary-foreground">
                  <span className="font-medium">Focus Input</span>
                  <p className="text-xs text-muted-foreground">Focus message input field</p>
                </div>
                <Kbd>Ctrl+Shift+K</Kbd>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2" role="note">
              Shortcuts work even when Shannon is minimized to tray
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Tools Section */}
        <AccordionItem value="tools">
          <AccordionTrigger>
            <span className="text-sm font-medium flex items-center gap-2">
              <Wrench className="w-4 h-4" aria-hidden />
              Tools
            </span>
          </AccordionTrigger>
          <AccordionContent>
            {loadingTools ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full border border-border" />
                  </div>
                ))}
              </div>
            ) : tools.length > 0 ? (
              <div className="space-y-1">
                {Object.entries(
                  tools.reduce<Record<string, ToolInfo[]>>((groups, tool) => {
                    const cat = getToolCategory(tool.name)
                    ;(groups[cat] ??= []).push(tool)
                    return groups
                  }, {})
                ).map(([category, categoryTools]) => (
                  <div key={category}>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 mt-2">{category}</div>
                    {categoryTools.map(tool => (
                      <div key={tool.name} className="flex items-center justify-between p-2 bg-background rounded border border-border">
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-secondary-foreground font-medium">{tool.name}</span>
                          {tool.description && (
                            <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                          )}
                        </div>
                        <Switch
                          checked={!disabledTools.has(tool.name)}
                          onCheckedChange={(checked) => handleToggleTool(tool.name, !checked)}
                          aria-label={`Toggle ${tool.name}`}
                          className="ml-2"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4">No tools available</div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* About Section */}
        <AccordionItem value="about">
          <AccordionTrigger>
            <span className="text-sm font-medium">About</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Shannon Desktop v0.1.0</div>
              <div>Rust-based AI code assistant</div>
              <div>
                <a
                  href="https://github.com/shannon-code/shannon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub
                </a>
                {' \u00b7 '}
                <a
                  href="https://docs.shannon-code.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Documentation
                </a>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
