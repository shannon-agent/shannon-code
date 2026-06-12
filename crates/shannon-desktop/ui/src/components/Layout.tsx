import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '@/context/AppContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function Layout() {
  const { usage, agents, status } = useApp();
  useKeyboardShortcuts();

  return (
    <div className="bg-background text-on-surface font-body-md overflow-hidden min-h-screen" style={{ '--sidebar-w': '280px' } as React.CSSProperties}>
      <Sidebar />
      <Header />
      <main className="pt-16 pb-8 h-screen flex flex-col relative" style={{ marginLeft: 'var(--sidebar-w)', width: 'calc(100% - var(--sidebar-w))' }}>
        <Outlet />
      </main>
      <footer className="fixed bottom-0 right-0 h-8 bg-surface-container-low/90 backdrop-blur-sm border-t border-outline-variant/20 flex items-center justify-between px-lg z-40" style={{ left: 'var(--sidebar-w)' }}>
        <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
          {usage
            ? `${(usage.input_tokens + usage.output_tokens).toLocaleString()} tokens · $${usage.cost_usd.toFixed(4)}`
            : status ? `${status.provider} · ${status.model}` : 'Shannon Code'}
        </span>
        <div className="flex items-center gap-md">
          {agents.length > 0 && (
            <span className="font-label-sm text-label-sm text-primary flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Active Agents: {agents.map(a => a.name).join(', ')}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}
