// Command palette with fuzzy search
import { useState, useEffect, useRef } from 'react'
import { Search, X, Plus, Settings, Layers, Sun, Sidebar, MessageSquare, Terminal, Zap } from 'lucide-react'
import { searchSessions } from '../lib/tauri-api'
import type { SessionInfo } from '../types/tauri-events'

interface SkillInfo {
  name: string
  description: string
  trigger: string
  source: string
  category?: string
}

interface Action {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  shortcut: string
  execute: () => void
  type?: 'action' | 'session' | 'skill'
  sessionId?: string
  skillTrigger?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNewSession: () => void
  onOpenSettings: () => void
  onSwitchModel: () => void
  onToggleSidebar: () => void
  onToggleTheme: () => void
  onSessionSelect?: (sessionId: string) => void
  onInsertSkillTrigger?: (trigger: string) => void
}

/**
 * Command palette modal with fuzzy search
 * - Triggered by Ctrl+K
 * - Fuzzy filtering of actions
 * - Keyboard navigation (up/down, Enter, Escape)
 * - Actions: New Session, Open Settings, Switch Model, Toggle Sidebar, Toggle Theme
 * - Tokyo Night styling with backdrop blur
 */
export function CommandPalette({
  isOpen,
  onClose,
  onNewSession,
  onOpenSettings,
  onSwitchModel,
  onToggleSidebar,
  onToggleTheme,
  onSessionSelect,
  onInsertSkillTrigger
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [sessionResults, setSessionResults] = useState<SessionInfo[]>([])
  const [searchingSessions, setSearchingSessions] = useState(false)
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [loadingSkills, setLoadingSkills] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const actions: Action[] = [
    { id: 'new-session', label: 'New Session', icon: Plus, shortcut: 'Ctrl+N', execute: onNewSession },
    { id: 'settings', label: 'Open Settings', icon: Settings, shortcut: 'Ctrl+,', execute: onOpenSettings },
    { id: 'model', label: 'Switch Model', icon: Layers, shortcut: 'Ctrl+M', execute: onSwitchModel },
    { id: 'sidebar', label: 'Toggle Sidebar', icon: Sidebar, shortcut: 'Ctrl+B', execute: onToggleSidebar },
    { id: 'theme', label: 'Toggle Theme', icon: Sun, shortcut: 'Ctrl+T', execute: onToggleTheme }
  ]

  // Load skills when palette opens
  useEffect(() => {
    if (isOpen && skills.length === 0) {
      loadSkills()
    }
  }, [isOpen])

  // Load skills from backend
  const loadSkills = async () => {
    setLoadingSkills(true)
    try {
      if (window.__TAURI__) {
        const result = await window.__TAURI__.invoke('list_skills')
        setSkills(result)
      } else {
        // Fallback mock skills
        setSkills([
          { name: 'commit', description: 'Create git commits', trigger: '/commit', source: 'claude' },
          { name: 'help', description: 'Show help', trigger: '/help', source: 'shannon' },
          { name: 'search', description: 'Search files', trigger: '/search', source: 'shannon' }
        ])
      }
    } catch (err) {
      console.error('Failed to load skills:', err)
    } finally {
      setLoadingSkills(false)
    }
  }

  // Load sessions when query changes
  useEffect(() => {
    if (query && onSessionSelect) {
      setSearchingSessions(true)
      searchSessions(query).then(results => {
        setSessionResults(results)
        setSearchingSessions(false)
      }).catch(() => {
        setSessionResults([])
        setSearchingSessions(false)
      })
    } else {
      setSessionResults([])
    }
  }, [query, onSessionSelect])

  // Combine actions with session results
  const sessionActions: Action[] = sessionResults.map(session => ({
    id: `session-${session.id}`,
    label: session.title || 'New Conversation',
    icon: MessageSquare,
    shortcut: '',
    execute: () => onSessionSelect?.(session.id),
    type: 'session',
    sessionId: session.id
  }))

  // Create skill actions
  const skillActions: Action[] = skills.map(skill => ({
    id: `skill-${skill.name}`,
    label: skill.name,
    icon: Terminal,
    shortcut: skill.trigger,
    execute: () => onInsertSkillTrigger?.(skill.trigger),
    type: 'skill',
    skillTrigger: skill.trigger
  }))

  const allItems = [...actions, ...sessionActions, ...skillActions]

  const filteredActions = allItems.filter(action =>
    action.label.toLowerCase().includes(query.toLowerCase())
  )

  // Fuzzy match highlight - safe React version
  const highlightMatch = (text: string, query: string) => {
    if (!query) return [{ text: text, highlight: false }]

    const parts: { text: string; highlight: boolean }[] = []
    let remainingText = text
    let queryIndex = 0

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i].toLowerCase() === query[queryIndex].toLowerCase()) {
        if (remainingText) {
          parts.push({ text: remainingText, highlight: false })
          remainingText = ''
        }
        parts.push({ text: text[i], highlight: true })
        queryIndex++
      } else if (remainingText) {
        remainingText = ''
        parts.push({ text: text[i], highlight: false })
      } else {
        parts[parts.length - 1].text += text[i]
      }
    }

    if (remainingText || queryIndex === 0) {
      parts.push({ text: text, highlight: false })
    }

    return parts
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].execute()
          onClose()
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1a1b26] border border-[#414868] rounded-lg shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-[#414868]">
          <Search className="text-[#565f89] mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-[#c0caf5] placeholder-[#565f89] outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#24283b] text-[#565f89] hover:text-[#c0caf5]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filteredActions.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#565f89]">
              {searchingSessions ? 'Searching...' : 'No results found'}
            </div>
          ) : (
            filteredActions.map((action, index) => {
              const Icon = action.icon
              const isSelected = index === selectedIndex
              const isSession = action.type === 'session'

              return (
                <button
                  key={action.id}
                  onClick={() => {
                    action.execute()
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 transition-colors
                    ${isSelected ? 'bg-[#2a2f44] text-[#7aa2f7]' : 'text-[#c0caf5] hover:bg-[#24283b]'}
                  `}
                >
                  <Icon className="flex-shrink-0" size={18} strokeWidth={2} />
                  <span className="flex-1 text-left">
                    {highlightMatch(action.label, query).map((part, i) => (
                      <span
                        key={i}
                        className={part.highlight ? 'text-[#7aa2f7] font-bold' : ''}
                      >
                        {part.text}
                      </span>
                    ))}
                  </span>
                  {!isSession && action.type !== 'skill' && (
                    <span className="text-xs text-[#565f89]">
                      {action.shortcut}
                    </span>
                  )}
                  {action.type === 'skill' && (
                    <span className="text-xs px-2 py-1 bg-[#1a1b26] text-[#7aa2f7] rounded">
                      {action.shortcut}
                    </span>
                  )}
                  {isSession && (
                    <span className="text-xs text-[#565f89]">Session</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#414868] flex items-center gap-4 text-xs text-[#565f89]">
          <span>↑↓ Navigate</span>
          <span>Enter Execute</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
