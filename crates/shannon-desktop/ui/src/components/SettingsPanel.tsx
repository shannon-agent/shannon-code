// Settings panel for API key, base URL, theme, and other configurations
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Save, Palette } from 'lucide-react'
import { configure, getConfig } from '../lib/tauri-api'
import { useTheme } from '../context/ThemeContext'

export function SettingsPanel() {
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
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
    <div className="p-4">
      <h2 className="text-lg font-semibold text-[#c0caf5] mb-4">Settings</h2>

      <div className="space-y-4">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-[#a9b1d6] mb-1">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={showApiKey ? apiKey : redactedKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 pr-20 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#a9b1d6] placeholder-[#565f89] focus:outline-none focus:ring-2 focus:ring-[#7aa2f7] focus:border-transparent"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-1 hover:bg-[#24283b] rounded transition-colors"
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
              >
                <Save className="w-4 h-4 text-[#9ece6a]" />
              </button>
            </div>
          </div>
        </div>

        {/* Base URL */}
        <div>
          <label className="block text-sm font-medium text-[#a9b1d6] mb-1">
            Base URL (optional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full px-3 py-2 pr-10 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#a9b1d6] placeholder-[#565f89] focus:outline-none focus:ring-2 focus:ring-[#7aa2f7] focus:border-transparent"
            />
            <button
              onClick={() => handleSave('base_url', baseUrl)}
              disabled={saving}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#9ece6a]/20 rounded transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#9ece6a]" />
            </button>
          </div>
        </div>

        {/* Theme Selector */}
        <div>
          <label className="block text-sm font-medium text-[#a9b1d6] mb-1 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Theme
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#1a1b26] border border-[#414868] rounded-lg text-[#a9b1d6] focus:outline-none focus:ring-2 focus:ring-[#7aa2f7] focus:border-transparent"
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
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div
            className={`text-sm ${
              saveStatus === 'success' ? 'text-[#9ece6a]' : 'text-[#f7768e]'
            }`}
          >
            {saveStatus === 'success' ? '✓ Saved successfully' : '✗ Failed to save'}
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
