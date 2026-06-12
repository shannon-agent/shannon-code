import { useTheme } from '@/context/ThemeContext'

export default function ThemeSettings() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="max-w-3xl">
      <header className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Theme Settings</h2>
        <p className="font-body-md text-on-surface-variant">Customize the visual environment to match your cognitive workflow.</p>
      </header>

      <div className="space-y-lg pb-10">
        {/* Theme Selection */}
        <section className="bg-white rounded-xl border border-outline-variant/30 p-xl shadow-sm">
          <h3 className="font-headline-md text-headline-md mb-md">Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`cursor-pointer p-md rounded-xl border-2 transition-all ${
                  theme === t.id
                    ? 'border-primary bg-primary-fixed/20 shadow-sm'
                    : 'border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                <div className="aspect-video rounded-md mb-sm border border-outline-variant/20 overflow-hidden flex items-center justify-center"
                  style={{ background: theme === t.id ? 'var(--color-primary-container)' : 'var(--color-surface-container-low)' }}
                >
                  <span className="material-symbols-outlined text-primary text-display-lg">palette</span>
                </div>
                <p className={`text-center font-label-md ${theme === t.id ? 'text-primary font-bold' : 'text-on-surface'}`}>{t.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Active Theme Info */}
        <section className="bg-white rounded-xl border border-outline-variant/30 p-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-md text-headline-md">Active Theme</h3>
              <p className="font-body-sm text-on-surface-variant mt-xs">Currently using <strong className="text-primary">{themes.find(t => t.id === theme)?.label ?? theme}</strong> theme.</p>
            </div>
            <div className="flex gap-sm">
              <div className="w-8 h-8 rounded-full bg-primary ring-2 ring-primary/30" title="Primary" />
              <div className="w-8 h-8 rounded-full bg-secondary ring-2 ring-secondary/30" title="Secondary" />
              <div className="w-8 h-8 rounded-full bg-tertiary ring-2 ring-tertiary/30" title="Tertiary" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
