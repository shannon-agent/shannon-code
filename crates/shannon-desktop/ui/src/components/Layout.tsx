// Fixed sidebar + header + footer layout with state-based page routing
import { ReactNode } from 'react'
import { AppSidebar, type PageId } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { AppFooter } from './AppFooter'
import { UpdateBanner } from './UpdateBanner'

interface LayoutProps {
  children: ReactNode
  currentPage: PageId
  onNavigate: (page: PageId) => void
  tokenUsage?: string
  computeTime?: string
  activeAgents?: string[]
  sidebarCollapsed?: boolean
}

export function Layout({
  children,
  currentPage,
  onNavigate,
  tokenUsage,
  computeTime,
  activeAgents,
  sidebarCollapsed,
}: LayoutProps) {
  const sidebarWidth = sidebarCollapsed ? 0 : 280

  return (
    <div className="bg-md3-background text-md3-on-background overflow-hidden h-screen flex">
      <UpdateBanner />

      {/* Fixed sidebar */}
      {!sidebarCollapsed && (
        <AppSidebar currentPage={currentPage} onNavigate={onNavigate} />
      )}

      {/* Fixed header */}
      <AppHeader currentPage={currentPage} />

      {/* Main content area */}
      <main
        className="mt-16 mb-8 flex-1 flex flex-col relative overflow-hidden transition-[margin] duration-300"
        style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth}px)` }}
      >
        {children}
      </main>

      {/* Fixed footer */}
      <AppFooter
        tokenUsage={tokenUsage}
        computeTime={computeTime}
        activeAgents={activeAgents}
      />
    </div>
  )
}
