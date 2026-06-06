// Three-column responsive layout component
import { ReactNode } from 'react'

interface LayoutProps {
  sidebar?: ReactNode
  tabBar?: ReactNode
  children: ReactNode
  panel?: ReactNode
}

/**
 * Three-column layout with:
 * - Left sidebar (240px): session list
 * - Tab bar (optional): multi-tab session management
 * - Center (flex): chat messages + input
 * - Right panel (320px, collapsible): settings/status
 */
export function Layout({ sidebar, tabBar, children, panel }: LayoutProps) {
  return (
    <div className="flex h-screen bg-[#1a1b26]">
      {/* Left Sidebar */}
      {sidebar && (
        <aside className="w-60 flex-shrink-0 bg-[#24283b] border-r border-[#414868]">
          {sidebar}
        </aside>
      )}

      {/* Center Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {tabBar}
        {children}
      </main>

      {/* Right Panel */}
      {panel && (
        <aside className="w-80 flex-shrink-0 bg-[#24283b] border-l border-[#414868] overflow-y-auto">
          {panel}
        </aside>
      )}
    </div>
  )
}
