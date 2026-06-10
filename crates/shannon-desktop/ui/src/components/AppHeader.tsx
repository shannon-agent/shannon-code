// Fixed header with context-aware content per page
import type { PageId } from './AppSidebar'

interface AppHeaderProps {
  currentPage: PageId
}

const PAGE_TITLES: Record<PageId, string> = {
  'chat': 'Chat',
  'tasks': 'Scheduled Tasks',
  'goals': 'Goals',
  'opc': 'Projects',
  'opc-task': 'Task Detail',
  'extensions-skills': 'Extensions',
  'extensions-agents': 'Extensions',
  'extensions-datasources': 'Extensions',
  'settings-general': 'Settings',
  'settings-theme': 'Settings',
  'settings-models': 'Settings',
  'settings-advanced': 'Settings',
  'settings-billing': 'Settings',
}

export function AppHeader({ currentPage }: AppHeaderProps) {
  const title = PAGE_TITLES[currentPage] ?? 'Shannon'
  const isOpc = currentPage === 'opc'
  const isOpcTask = currentPage === 'opc-task'

  return (
    <header className="fixed top-0 right-0 left-[280px] z-40 flex justify-between items-center h-16 px-md3-lg bg-md3-surface/80 backdrop-blur-md shadow-sm border-b border-md3-outline-variant/10">
      {/* Left — Title */}
      <div className="flex items-center gap-md3-md relative overflow-hidden">
        <h2 className="font-semibold text-[20px] text-md3-on-surface whitespace-nowrap">{title}</h2>

        {/* Context-aware: Search bar for OPC */}
        {isOpc && (
          <div className="hidden md:flex items-center bg-md3-surface-container-lowest/50 rounded-full px-md3-md py-1 border border-md3-outline-variant/30 max-w-xs">
            <span className="material-symbols-outlined text-md3-on-surface-variant text-[18px] mr-2">search</span>
            <input
              className="bg-transparent border-none outline-none focus:ring-0 text-label-md w-full placeholder:text-md3-on-surface-variant/60"
              placeholder="Search projects..."
              type="text"
            />
          </div>
        )}

        {/* Context-aware: Sync status for OPC Task */}
        {isOpcTask && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-label-sm text-emerald-700 font-medium">Synced</span>
          </div>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-md3-lg shrink-0 pl-4 border-l border-md3-outline-variant/20">
        <button className="text-md3-on-surface-variant hover:text-md3-primary transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button className="text-md3-on-surface-variant hover:text-md3-primary transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden bg-md3-surface-container flex items-center justify-center ring-2 ring-md3-primary/10">
          <span className="material-symbols-outlined text-[16px] text-md3-on-surface-variant">person</span>
        </div>
      </div>
    </header>
  )
}
