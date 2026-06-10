// Fixed sidebar navigation with collapsible sections
import { useState } from 'react'
import { cn } from '../lib/utils'

export type PageId =
  | 'chat'
  | 'tasks'
  | 'goals'
  | 'opc'
  | 'opc-task'
  | 'extensions-skills'
  | 'extensions-agents'
  | 'extensions-datasources'
  | 'settings-general'
  | 'settings-theme'
  | 'settings-models'
  | 'settings-advanced'
  | 'settings-billing'

interface AppSidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

interface NavItem {
  id: PageId
  label: string
  icon: string
}

interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'main',
    label: '',
    items: [
      { id: 'chat', label: 'Chat', icon: 'chat' },
      { id: 'tasks', label: 'Tasks', icon: 'schedule' },
      { id: 'goals', label: 'Goals', icon: 'flag' },
    ],
  },
  {
    id: 'opc',
    label: 'Projects',
    items: [
      { id: 'opc', label: 'All Projects', icon: 'account_tree' },
      { id: 'opc-task', label: 'Current Task', icon: 'assignment' },
    ],
  },
  {
    id: 'extensions',
    label: 'Extensions',
    items: [
      { id: 'extensions-skills', label: 'Skills', icon: 'extension' },
      { id: 'extensions-agents', label: 'Agents', icon: 'smart_toy' },
      { id: 'extensions-datasources', label: 'Data Sources', icon: 'database' },
    ],
  },
]

const SETTINGS_ITEMS: NavItem[] = [
  { id: 'settings-general', label: 'General', icon: 'settings' },
  { id: 'settings-theme', label: 'Theme', icon: 'palette' },
  { id: 'settings-models', label: 'Models', icon: 'neurology' },
  { id: 'settings-billing', label: 'Usage & Billing', icon: 'payments' },
  { id: 'settings-advanced', label: 'Advanced', icon: 'tune' },
]

const OPC_PROJECTS = [
  { name: 'Shannon Core', icon: 'hub', color: 'bg-md3-primary/10 text-md3-primary' },
  { name: 'Shannon Desktop', icon: 'desktop_windows', color: 'bg-md3-secondary/10 text-md3-secondary' },
  { name: 'Shannon Mobile', icon: 'phone_iphone', color: 'bg-md3-tertiary/10 text-md3-tertiary' },
]

const SECTION_ICONS: Record<string, string> = {
  opc: 'account_tree',
  extensions: 'category',
}

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const [opcOpen, setOpcOpen] = useState(currentPage.startsWith('opc'))
  const [extensionsOpen, setExtensionsOpen] = useState(currentPage.startsWith('extensions-'))
  const [settingsOpen, setSettingsOpen] = useState(currentPage.startsWith('settings-'))

  const sectionState: Record<string, boolean> = {
    opc: opcOpen,
    extensions: extensionsOpen,
  }
  const sectionToggle: Record<string, (v: boolean) => void> = {
    opc: setOpcOpen,
    extensions: setExtensionsOpen,
  }

  function isActive(pageId: PageId): boolean {
    return currentPage === pageId
  }

  function isSectionActive(section: NavSection): boolean {
    return section.items.some(item => item.id === currentPage)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] glass-panel border-r border-md3-outline-variant/30 flex flex-col py-6 px-4 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.08)]">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-md3-xl px-2">
        <div className="w-10 h-10 rounded-xl bg-md3-primary flex items-center justify-center text-md3-on-primary shadow-md shadow-md3-primary/30">
          <span className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >auto_awesome</span>
        </div>
        <div>
          <div className="font-semibold text-[20px] text-md3-primary leading-tight">Shannon</div>
          <div className="text-label-sm text-md3-on-surface-variant leading-none">Code Assistant</div>
        </div>
      </div>

      {/* New Chat CTA */}
      <button
        className="mb-md3-lg w-full py-3 px-4 bg-md3-primary text-md3-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-md3-primary/30 active:scale-95 transition-all"
        onClick={() => onNavigate('chat')}
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        New Request
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id}>
            {section.id === 'main' ? (
              section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-label-md transition-all duration-300',
                    isActive(item.id)
                      ? 'text-md3-primary bg-md3-primary/10 font-bold shadow-sm'
                      : 'text-md3-on-surface-variant hover:bg-md3-surface-container-low hover:text-md3-primary hover:-translate-y-0.5'
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => sectionToggle[section.id]?.(!sectionState[section.id])}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-label-md transition-all duration-300',
                    isSectionActive(section)
                      ? 'bg-md3-primary/10 text-md3-primary font-bold shadow-sm'
                      : 'text-md3-on-surface-variant hover:bg-md3-surface-container-low hover:text-md3-primary hover:-translate-y-0.5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >{SECTION_ICONS[section.id]}</span>
                    {section.label}
                  </div>
                  <span
                    className="material-symbols-outlined text-[20px] transition-transform duration-200"
                    style={{ transform: sectionState[section.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >expand_more</span>
                </button>

                <div className={cn(
                  'pl-4 pr-2 space-y-1 mt-1 transition-all overflow-hidden',
                  sectionState[section.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}>
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        'w-full flex items-center px-4 py-2 rounded-lg text-label-md text-[13px] transition-all duration-200',
                        isActive(item.id)
                          ? 'text-md3-primary font-bold'
                          : 'text-md3-on-surface-variant hover:text-md3-primary'
                      )}
                    >
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full mr-3 shrink-0',
                        isActive(item.id) ? 'bg-md3-primary' : 'bg-md3-outline-variant'
                      )} />
                      {item.label}
                    </button>
                  ))}

                  {/* OPC project quick list */}
                  {section.id === 'opc' && (
                    <div className="mt-2 pt-2 border-t border-md3-outline-variant/10 space-y-1">
                      <p className="px-4 py-1 text-[10px] text-md3-on-surface-variant/60 uppercase tracking-widest font-bold">Projects</p>
                      {OPC_PROJECTS.map((project) => (
                        <button
                          key={project.name}
                          onClick={() => onNavigate('opc')}
                          className="w-full flex items-center gap-3 px-4 py-1.5 rounded-lg text-label-sm text-md3-on-surface-variant hover:text-md3-primary hover:bg-md3-surface-container-low transition-all"
                        >
                          <span className={cn('w-7 h-7 rounded-md flex items-center justify-center', project.color)}>
                            <span className="material-symbols-outlined text-[14px]">{project.icon}</span>
                          </span>
                          <span className="truncate">{project.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Settings Section */}
      <div className="mt-auto pt-md3-lg border-t border-md3-outline-variant/20">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={cn(
            'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-label-md transition-all duration-300',
            currentPage.startsWith('settings-')
              ? 'bg-md3-primary/10 text-md3-primary font-bold shadow-sm'
              : 'text-md3-on-surface-variant hover:bg-md3-surface-container-low hover:text-md3-primary'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >settings</span>
            Settings
          </div>
          <span
            className="material-symbols-outlined text-[20px] transition-transform duration-200"
            style={{ transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >expand_more</span>
        </button>

        <div className={cn(
          'pl-4 pr-2 space-y-1 mt-1 transition-all overflow-hidden',
          settingsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          {SETTINGS_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center px-4 py-2 rounded-lg text-label-md text-[13px] transition-all duration-200',
                isActive(item.id)
                  ? 'text-md3-primary font-bold'
                  : 'text-md3-on-surface-variant hover:text-md3-primary'
              )}
            >
              <span className={cn(
                'w-1.5 h-1.5 rounded-full mr-3 shrink-0',
                isActive(item.id) ? 'bg-md3-primary' : 'bg-md3-outline-variant'
              )} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="text-label-sm text-md3-on-surface-variant px-4 py-2 opacity-60">
          v0.1.0
        </div>
      </div>
    </aside>
  )
}
