import { Outlet, NavLink } from 'react-router-dom';

const tabs = [
  { to: '/settings/general', icon: 'tune', label: 'General' },
  { to: '/settings/theme', icon: 'palette', label: 'Theme' },
  { to: '/settings/models', icon: 'neurology', label: 'Models' },
  { to: '/settings/billing', icon: 'payments', label: 'Usage & Billing' },
  { to: '/settings/advanced', icon: 'code', label: 'Advanced' },
] as const

export default function Settings() {
  return (
    <div className="flex-1 flex w-full h-full bg-background">
      <nav aria-label="Settings navigation" className="hidden md:flex w-[220px] shrink-0 border-r border-outline-variant/20 bg-surface-container-low/30 flex-col py-xl px-sm">
        <h2 className="font-headline-md text-[18px] font-bold text-on-surface px-md mb-lg">Settings</h2>
        <div className="space-y-xs">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex items-center gap-sm px-md py-sm rounded-xl font-label-md text-label-md transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile tab bar */}
      <div className="md:hidden flex border-b border-outline-variant/20 overflow-x-auto px-sm py-xs bg-surface-container-low/30">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex items-center gap-xs px-sm py-xs rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto h-full pb-8">
        <div className="max-w-[800px] mx-auto px-lg py-xl animate-in fade-in duration-700">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
