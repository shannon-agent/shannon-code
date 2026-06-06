// IDE-style layout with sidebar, main content, bottom panel, and right panel
import { ReactNode, useState, useCallback, useEffect, useRef } from 'react'
import { UpdateBanner } from './UpdateBanner'

interface LayoutProps {
  sidebar?: ReactNode
  tabBar?: ReactNode
  children: ReactNode
  panel?: ReactNode
  bottomPanel?: ReactNode
  bottomPanelDefault?: number
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

const STORAGE_KEY = 'shannon-layout'
const DEFAULT_SIDEBAR = 220
const DEFAULT_RIGHT = 320
const DEFAULT_BOTTOM = 200

function loadLayout(): { sidebar: number; right: number; bottom: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        sidebar: parsed.sidebar ?? DEFAULT_SIDEBAR,
        right: parsed.right ?? DEFAULT_RIGHT,
        bottom: parsed.bottom ?? DEFAULT_BOTTOM,
      }
    }
  } catch { /* ignore */ }
  return { sidebar: DEFAULT_SIDEBAR, right: DEFAULT_RIGHT, bottom: DEFAULT_BOTTOM }
}

function saveLayout(sizes: { sidebar: number; right: number; bottom: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes))
  } catch { /* ignore */ }
}

/**
 * IDE-style layout with resizable panels:
 * - Left sidebar (resizable): session list, file tree
 * - Tab bar (optional): multi-tab session management
 * - Center (flex): chat messages + input
 * - Bottom panel (resizable, collapsible): terminal, tasks
 * - Right panel (resizable, collapsible): agents, MCP, settings
 */
export function Layout({ sidebar, tabBar, children, panel, bottomPanel, bottomPanelDefault, sidebarCollapsed: externalSidebarCollapsed, onToggleSidebar: externalToggleSidebar }: LayoutProps) {
  const saved = useRef(loadLayout())
  const [sidebarWidth, setSidebarWidth] = useState(saved.current.sidebar)
  const [rightWidth, setRightWidth] = useState(saved.current.right)
  const [bottomHeight, setBottomHeight] = useState(bottomPanelDefault ?? saved.current.bottom)
  const [bottomCollapsed, setBottomCollapsed] = useState(!bottomPanel)
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(false)

  const sidebarCollapsed = externalSidebarCollapsed ?? internalSidebarCollapsed
  const toggleSidebar = externalToggleSidebar ?? (() => setInternalSidebarCollapsed(prev => !prev))

  // Debounced save to localStorage
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const persistSizes = useCallback((s: { sidebar: number; right: number; bottom: number }) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveLayout(s), 500)
  }, [])

  useEffect(() => () => clearTimeout(saveTimer.current), [])

  const handleBottomCollapse = useCallback(() => {
    setBottomCollapsed(prev => !prev)
  }, [])

  const makeDragHandler = useCallback((
    setter: (v: number) => void,
    min: number,
    max: number,
    direction: 'horizontal' | 'vertical',
    setterKey: 'sidebar' | 'right' | 'bottom'
  ) => (e: React.MouseEvent) => {
    const startPos = direction === 'horizontal' ? e.clientX : e.clientY
    const startSize = setterKey === 'sidebar' ? sidebarWidth : setterKey === 'right' ? rightWidth : bottomHeight
    const onMove = (ev: MouseEvent) => {
      const delta = direction === 'horizontal'
        ? (setterKey === 'sidebar' ? ev.clientX - startPos : startPos - ev.clientX)
        : startPos - ev.clientY
      const newSize = Math.max(min, Math.min(max, startSize + delta))
      setter(newSize)
      persistSizes({
        sidebar: setterKey === 'sidebar' ? newSize : sidebarWidth,
        right: setterKey === 'right' ? newSize : rightWidth,
        bottom: setterKey === 'bottom' ? newSize : bottomHeight,
      })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [sidebarWidth, rightWidth, bottomHeight, persistSizes])

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Update Banner */}
      <UpdateBanner />

      <div className="flex flex-1 min-h-0">
      {/* Left Sidebar */}
      {sidebar && !sidebarCollapsed && (
        <aside style={{ width: `${sidebarWidth}px` }} className="flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] overflow-hidden">
          {sidebar}
        </aside>
      )}

      {/* Sidebar Resize Handle */}
      {sidebar && !sidebarCollapsed && (
        <div
          onMouseDown={makeDragHandler(setSidebarWidth, 140, 400, 'horizontal', 'sidebar')}
          className="w-1 bg-[var(--border)]/30 hover:bg-[var(--accent)]/30 transition-colors cursor-col-resize flex-shrink-0"
          title="Drag to resize sidebar"
        />
      )}

      {/* Sidebar Toggle Button (when collapsed) */}
      {sidebar && sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="w-1 bg-[var(--border)]/30 hover:bg-[var(--accent)]/30 transition-colors cursor-col-resize flex-shrink-0"
          title="Expand sidebar (Ctrl+Shift+S)"
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-0.5 h-4 bg-[var(--text-muted)]/40 rounded-full rotate-180" />
          </div>
        </button>
      )}

      {/* Center Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {tabBar}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Main content area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {children}
          </div>

          {/* Bottom panel with drag handle */}
          {bottomPanel && !bottomCollapsed && (
            <div style={{ height: `${bottomHeight}px` }} className="flex-shrink-0 border-t border-[var(--border)] overflow-hidden">
              <div
                onMouseDown={makeDragHandler(setBottomHeight, 100, 500, 'vertical', 'bottom')}
                className="h-1 cursor-row-resize bg-[var(--border)]/30 hover:bg-[var(--accent)]/30 transition-colors"
              />
              {bottomPanel}
            </div>
          )}
        </div>
      </main>

      {/* Right Panel Resize Handle */}
      {panel && (
        <div
          onMouseDown={makeDragHandler(setRightWidth, 200, 600, 'horizontal', 'right')}
          className="w-1 bg-[var(--border)]/30 hover:bg-[var(--accent)]/30 transition-colors cursor-col-resize flex-shrink-0"
          title="Drag to resize panel"
        />
      )}

      {/* Right Panel */}
      {panel && (
        <aside style={{ width: `${rightWidth}px` }} className="flex-shrink-0 bg-[var(--bg-secondary)] border-l border-[var(--border)] overflow-hidden flex flex-col">
          {panel}
        </aside>
      )}
      </div>
    </div>
  )
}
