// IDE-style layout with sidebar, main content, bottom panel, and right panel
import { ReactNode, useCallback, useRef } from 'react'
import { UpdateBanner } from './UpdateBanner'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable'

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

function loadLayout(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function saveLayout(layout: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  } catch { /* ignore */ }
}

/**
 * IDE-style layout with resizable panels:
 * - Left sidebar (resizable, collapsible): session list, file tree
 * - Tab bar (optional): multi-tab session management
 * - Center (flex): chat messages + input
 * - Bottom panel (resizable, collapsible): terminal, tasks
 * - Right panel (resizable, collapsible): agents, MCP, settings
 */
export function Layout({ sidebar, tabBar, children, panel, bottomPanel, bottomPanelDefault, sidebarCollapsed: _sidebarCollapsed, onToggleSidebar: _onToggleSidebar }: LayoutProps) {
  const saved = useRef(loadLayout())

  const handleMainLayoutChanged = useCallback((layout: Record<string, number>) => {
    saveLayout(layout)
  }, [])

  return (
    <div className="flex h-screen bg-background flex flex-col">
      {/* Update Banner */}
      <UpdateBanner />

      <div className="flex flex-1 min-h-0">
        {sidebar || panel ? (
          <ResizablePanelGroup
            orientation="horizontal"
            id="shannon-main"
            defaultLayout={saved.current}
            onLayoutChanged={handleMainLayoutChanged}
            className="flex-1"
          >
            {/* Left Sidebar */}
            {sidebar && (
              <ResizablePanel
                id="sidebar"
                defaultSize={saved.current['sidebar'] ?? DEFAULT_SIDEBAR}
                minSize={140}
                maxSize={400}
                collapsible
                collapsedSize={0}
                className="bg-secondary overflow-hidden"
              >
                {sidebar}
              </ResizablePanel>
            )}

            {/* Sidebar | Center handle */}
            {sidebar && <ResizableHandle />}

            {/* Center Content — contains tab bar + main area + optional bottom panel */}
            <ResizablePanel id="center" minSize={200}>
              <div className="flex flex-col h-full">
                {tabBar}
                {bottomPanel ? (
                  <ResizablePanelGroup orientation="vertical" id="shannon-center" className="flex-1">
                    {/* Main content area */}
                    <ResizablePanel id="main" defaultSize={70} minSize={30}>
                      <div className="h-full overflow-hidden">
                        {children}
                      </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Bottom panel */}
                    <ResizablePanel
                      id="bottom"
                      defaultSize={saved.current['bottom'] ?? (bottomPanelDefault ?? DEFAULT_BOTTOM)}
                      minSize={100}
                      maxSize={500}
                      collapsible
                      className="overflow-hidden"
                    >
                      {bottomPanel}
                    </ResizablePanel>
                  </ResizablePanelGroup>
                ) : (
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {children}
                  </div>
                )}
              </div>
            </ResizablePanel>

            {/* Center | Right handle */}
            {panel && <ResizableHandle />}

            {/* Right Panel */}
            {panel && (
              <ResizablePanel
                id="right"
                defaultSize={saved.current['right'] ?? DEFAULT_RIGHT}
                minSize={200}
                maxSize={600}
                collapsible
                className="bg-secondary overflow-hidden flex flex-col"
              >
                {panel}
              </ResizablePanel>
            )}
          </ResizablePanelGroup>
        ) : bottomPanel ? (
          <ResizablePanelGroup orientation="vertical" id="shannon-standalone" className="flex-1">
            <ResizablePanel id="main" defaultSize={70} minSize={30}>
              <div className="flex flex-col h-full">
                {tabBar}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {children}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              id="bottom"
              defaultSize={saved.current['bottom'] ?? (bottomPanelDefault ?? DEFAULT_BOTTOM)}
              minSize={100}
              maxSize={500}
              collapsible
              className="overflow-hidden"
            >
              {bottomPanel}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {tabBar}
            <div className="flex-1 min-h-0 overflow-hidden">
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  )
}
