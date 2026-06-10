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
}

export function Layout({
  children,
  currentPage,
  onNavigate,
  tokenUsage,
  computeTime,
  activeAgents,
}: LayoutProps) {
  return (
    <div className="bg-md3-background text-md3-on-background overflow-hidden h-screen flex">
      <UpdateBanner />

      {/* Fixed sidebar */}
      <AppSidebar currentPage={currentPage} onNavigate={onNavigate} />

      {/* Fixed header */}
      <AppHeader currentPage={currentPage} />

      {/* Main content area */}
      <main className="ml-[280px] mt-16 mb-8 flex-1 flex flex-col relative w-[calc(100%-280px)] overflow-hidden">
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
