// IDE-style layout with sidebar, main content, bottom panel, and right panel
import { ReactNode, useState, useCallback } from 'react'

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

/**
 * IDE-style layout with:
 * - Left sidebar (240px): session list, file tree
 * - Tab bar (optional): multi-tab session management
 * - Center (flex): chat messages + input
 * - Bottom panel (collapsible): terminal, tasks
 * - Right panel (320px, collapsible): agents, MCP, settings
 */
export function Layout({ sidebar, tabBar, children, panel, bottomPanel, bottomPanelDefault = 200, sidebarCollapsed: externalSidebarCollapsed, onToggleSidebar: externalToggleSidebar }: LayoutProps) {
  const [bottomHeight, setBottomHeight] = useState(bottomPanelDefault)
  const [bottomCollapsed, setBottomCollapsed] = useState(!bottomPanel)
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(false)

  // Handle bottom panel collapse state
  const handleBottomCollapse = useCallback(() => {
    setBottomCollapsed(prev => !prev)
  }, [setBottomCollapsed])

  const sidebarCollapsed = externalSidebarCollapsed ?? internalSidebarCollapsed
  const toggleSidebar = externalToggleSidebar ?? (() => setInternalSidebarCollapsed(prev => !prev))

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Left Sidebar */}
      {sidebar && !sidebarCollapsed && (
        <aside className="w-[220px] flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] overflow-hidden">
          {sidebar}
        </aside>
      )}

      {/* Sidebar Toggle Button */}
      {sidebar && (
        <button
          onClick={toggleSidebar}
          className="w-1 bg-[var(--border)]/30 hover:bg-[var(--accent)]/30 transition-colors cursor-col-resize flex-shrink-0"
          title={sidebarCollapsed ? "Expand sidebar (Ctrl+Shift+S)" : "Collapse sidebar (Ctrl+Shift+S)"}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-0.5 h-4 bg-[var(--text-muted)]/40 rounded-full transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
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
              <div className="h-1 cursor-row-resize bg-[var(--border)]/30 hover:bg-[var(--accent)]/30 transition-colors"
                onMouseDown={(e) => {
                  const startY = e.clientY
                  const startH = bottomHeight
                  const onMove = (ev: MouseEvent) => {
                    const delta = startY - ev.clientY
                    setBottomHeight(Math.max(100, Math.min(500, startH + delta)))
                  }
                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove)
                    window.removeEventListener('mouseup', onUp)
                  }
                  window.addEventListener('mousemove', onMove)
                  window.addEventListener('mouseup', onUp)
                }}
              />
              {bottomPanel}
            </div>
          )}
        </div>
      </main>

      {/* Right Panel */}
      {panel && (
        <aside className="w-80 flex-shrink-0 bg-[var(--bg-secondary)] border-l border-[var(--border)] overflow-hidden flex flex-col">
          {panel}
        </aside>
      )}
    </div>
  )
}
