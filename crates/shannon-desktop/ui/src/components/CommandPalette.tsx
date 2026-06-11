// Command palette with fuzzy search using cmdk
import { useState, useEffect } from 'react'
import { Plus, Settings, Layers, Sun, Sidebar, MessageSquare, Terminal } from 'lucide-react'
import { searchSessions } from '../lib/tauri-api'
import type { SessionInfo } from '../types/tauri-events'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from './ui/command'
import { Kbd } from './ui/kbd'

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
 * Command palette modal using cmdk
 * - Triggered by Ctrl+K
 * - Fuzzy filtering via cmdk
 * - Keyboard navigation built-in
 * - Actions: New Session, Open Settings, Switch Model, Toggle Sidebar, Toggle Theme
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
  const [sessionResults, setSessionResults] = useState<SessionInfo[]>([])
  const [searchingSessions, setSearchingSessions] = useState(false)
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [query, setQuery] = useState('')

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
    try {
      if ((window as unknown as Record<string, unknown>).__TAURI__) {
        const result = await (window as unknown as { __TAURI__: { invoke: (cmd: string) => Promise<unknown> } }).__TAURI__.invoke('list_skills')
        setSkills(result as SkillInfo[])
      } else {
        setSkills([
          { name: 'commit', description: 'Create git commits', trigger: '/commit', source: 'claude' },
          { name: 'help', description: 'Show help', trigger: '/help', source: 'shannon' },
          { name: 'search', description: 'Search files', trigger: '/search', source: 'shannon' }
        ])
      }
    } catch (err) {
      console.error('Failed to load skills:', err)
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

  // Global keyboard shortcut Ctrl+K to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 shadow-2xl border border-border rounded-lg overflow-hidden bg-background">
        <Command shouldFilter={true} className="bg-background">
          <CommandInput
            placeholder="Type a command or search..."
            onValueChange={setQuery}
          />
          <CommandList className="max-h-80">
            <CommandEmpty>
              {searchingSessions ? (
                <div className="flex flex-col items-center gap-2 py-6">
                  <div className="animate-spin h-5 w-5 border-2 border-ring border-t-transparent rounded-full" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : (
                <span>No results found</span>
              )}
            </CommandEmpty>

            {/* Actions */}
            <CommandGroup heading="Actions">
              {actions.map((action) => {
                const Icon = action.icon
                return (
                  <CommandItem
                    key={action.id}
                    onSelect={() => {
                      action.execute()
                      onClose()
                    }}
                  >
                    <Icon className="flex-shrink-0 h-[18px] w-[18px]" />
                    <span>{action.label}</span>
                    <CommandShortcut>{action.shortcut}</CommandShortcut>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {/* Sessions */}
            {sessionActions.length > 0 && (
              <CommandGroup heading="Sessions">
                {sessionActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <CommandItem
                      key={action.id}
                      onSelect={() => {
                        action.execute()
                        onClose()
                      }}
                    >
                      <Icon className="flex-shrink-0 h-[18px] w-[18px]" />
                      <span>{action.label}</span>
                      <CommandShortcut>Session</CommandShortcut>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {/* Skills */}
            {skillActions.length > 0 && (
              <CommandGroup heading="Skills">
                {skillActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <CommandItem
                      key={action.id}
                      onSelect={() => {
                        action.execute()
                        onClose()
                      }}
                    >
                      <Icon className="flex-shrink-0 h-[18px] w-[18px]" />
                      <span>{action.label}</span>
                      <Kbd className="ml-auto">{action.shortcut}</Kbd>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}
          </CommandList>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
            <span>↑↓ Navigate</span>
            <span>Enter Execute</span>
            <span>Esc Close</span>
          </div>
        </Command>
      </div>
    </div>
  )
}
