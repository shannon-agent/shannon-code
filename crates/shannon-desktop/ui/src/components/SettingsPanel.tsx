// Settings pages — 5 separate full-page components matching design
import { useState } from 'react'
import { cn } from '../lib/utils'

// ─── General Settings ────────────────────────────────────────────────
export function GeneralSettingsPage() {
  const [textSize, setTextSize] = useState(2)
  const [autonomy, setAutonomy] = useState(45)
  const textLabels = ['Compact', 'Standard', 'Medium', 'Large']

  return (
    <div className="max-w-3xl mx-auto px-md3-xl py-md3-xl animate-in fade-in duration-700">
      <header className="mb-md3-xl">
        <h2 className="text-headline-lg text-md3-on-surface mb-xs">System Settings</h2>
        <p className="text-body-md text-md3-on-surface-variant">Refine your AI workflow and interface preferences.</p>
      </header>

      <div className="space-y-md3-lg">
        {/* Accessibility */}
        <section className="bg-white rounded-xl border border-md3-outline-variant/30 p-md3-xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-headline-md text-md3-on-surface mb-md3-md">Accessibility</h3>
          <div className="space-y-md3-xl">
            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <label className="text-label-md text-md3-on-surface">Text Size</label>
                <span className="text-label-sm text-md3-primary bg-md3-primary/10 px-sm py-xs rounded">{textLabels[textSize - 1]}</span>
              </div>
              <input
                type="range" min={1} max={4} value={textSize}
                onChange={e => setTextSize(Number(e.target.value))}
                className="w-full appearance-none bg-md3-outline-variant/30 h-1 rounded-full cursor-pointer outline-none slider-thumb-primary"
              />
              <div className="flex justify-between text-label-sm text-md3-on-surface-variant">
                {textLabels.map(l => <span key={l}>{l}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* Autonomy Level */}
        <section className="bg-white rounded-xl border border-md3-outline-variant/30 p-md3-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-md3-md mb-xs">
            <span className="material-symbols-outlined text-md3-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h3 className="text-headline-md text-md3-on-surface">Autonomy Level</h3>
          </div>
          <p className="text-body-sm text-md3-on-surface-variant mb-md3-xl">Control the degree of independent decision-making permitted for your active agents. Progressive disclosure ensures you remain in the loop.</p>
          <div className="space-y-sm">
            <input
              type="range" min={0} max={100} value={autonomy}
              onChange={e => setAutonomy(Number(e.target.value))}
              className="w-full appearance-none bg-md3-outline-variant/30 h-1 rounded-full cursor-pointer outline-none slider-thumb-primary"
            />
            <div className="flex justify-between text-label-sm px-1 mt-sm">
              <div className="text-left">
                <p className="font-bold text-md3-on-surface">Human-in-the-loop</p>
                <p className="text-md3-on-surface-variant">High supervision</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-md3-on-surface">Hybrid</p>
                <p className="text-md3-on-surface-variant">Shared context</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-md3-on-surface">Full Autonomy</p>
                <p className="text-md3-on-surface-variant">Result focused</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        input.slider-thumb-primary::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px; width: 16px;
          border-radius: 50%;
          background: var(--color-md3-primary, #6b38d4);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(107, 56, 212, 0.3);
          margin-top: -6px;
        }
      `}</style>
    </div>
  )
}

// ─── Theme Settings ──────────────────────────────────────────────────
export function ThemeSettingsPage() {
  const [appearance, setAppearance] = useState('light')
  const [accent, setAccent] = useState('#8B5CF6')
  const [glassIntensity, setGlassIntensity] = useState(70)

  const accents = [
    { color: '#8B5CF6', name: 'Purple' },
    { color: '#3B82F6', name: 'Blue' },
    { color: '#14B8A6', name: 'Teal' },
    { color: '#F59E0B', name: 'Amber' },
    { color: '#EF4444', name: 'Red' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-md3-xl py-md3-xl animate-in fade-in duration-700">
      <header className="mb-md3-xl">
        <h2 className="text-headline-lg text-md3-on-surface mb-xs">Theme Settings</h2>
        <p className="text-body-md text-md3-on-surface-variant">Customize the visual environment to match your cognitive workflow.</p>
      </header>

      <div className="space-y-md3-lg pb-10">
        {/* Appearance */}
        <section className="bg-white rounded-xl border border-md3-outline-variant/30 p-md3-xl shadow-sm">
          <h3 className="text-headline-md text-md3-on-surface mb-md3-md">Appearance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md3-md">
            {[
              { value: 'light', label: 'Light Mode', icon: 'light_mode', bg: 'bg-md3-background', iconColor: 'text-md3-primary' },
              { value: 'dark', label: 'Dark Mode', icon: 'dark_mode', bg: 'bg-gray-900', iconColor: 'text-purple-300' },
              { value: 'system', label: 'System', icon: 'settings_brightness', bg: 'bg-gradient-to-br from-white to-gray-900', iconColor: 'text-md3-on-surface-variant' },
            ].map(opt => (
              <label key={opt.value} className="cursor-pointer group">
                <input
                  type="radio" name="appearance" value={opt.value}
                  checked={appearance === opt.value}
                  onChange={() => setAppearance(opt.value)}
                  className="hidden peer"
                />
                <div className="p-md3-md rounded-xl border-2 border-md3-outline-variant/30 peer-checked:border-md3-primary peer-checked:bg-md3-primary/5 transition-all">
                  <div className={cn('aspect-video rounded-md mb-sm border border-md3-outline-variant/20 overflow-hidden flex items-center justify-center', opt.bg)}>
                    <span className={cn('material-symbols-outlined text-display-lg', opt.iconColor)}>{opt.icon}</span>
                  </div>
                  <p className="text-center text-label-md">{opt.label}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Color Accents */}
        <div className="space-y-md3-md pt-md3-md">
          <h3 className="text-headline-md text-md3-on-surface">Color Accents</h3>
          <div className="flex items-center gap-lg">
            {accents.map(a => (
              <button
                key={a.color}
                onClick={() => setAccent(a.color)}
                className={cn(
                  'rounded-full transition-transform active:scale-90 cursor-pointer',
                  accent === a.color
                    ? 'w-12 h-12 ring-offset-4 ring-2 shadow-lg relative flex items-center justify-center'
                    : 'w-10 h-10 hover:scale-110 opacity-60 hover:opacity-100'
                )}
                style={{
                  backgroundColor: a.color,
                  ...(accent === a.color ? { ringColor: a.color, boxShadow: `0 0 10px ${a.color}40` } : {}),
                }}
              >
                {accent === a.color && (
                  <span className="material-symbols-outlined text-white text-[20px]">check</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Glass Pane Intensity */}
        <div className="space-y-md3-md pt-md3-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md text-md3-on-surface">Glass Pane Intensity</h3>
            <span className="px-md3-md py-xs bg-md3-primary/10 text-md3-primary text-label-md rounded-full border border-md3-primary/20">{glassIntensity}% Intensity</span>
          </div>
          <div className="p-md3-lg bg-md3-surface-container-low/50 rounded-2xl border border-md3-outline-variant/20">
            <div className="flex items-center justify-between mb-md3-md px-xs">
              <span className="text-label-sm text-md3-on-surface-variant">Solid</span>
              <span className="text-label-sm text-md3-on-surface-variant">Clear</span>
            </div>
            <input
              type="range" min={0} max={100} value={glassIntensity}
              onChange={e => setGlassIntensity(Number(e.target.value))}
              className="w-full h-1 bg-md3-outline-variant/40 rounded-lg appearance-none cursor-pointer outline-none slider-thumb-primary"
            />
            <div className="mt-md3-lg p-md3-md glass-surface rounded-xl border border-white/40 shadow-sm flex items-center gap-md3-md bg-white/70 backdrop-blur-md">
              <div className="w-10 h-10 rounded-lg bg-md3-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-md3-primary">visibility</span>
              </div>
              <span className="text-body-sm text-md3-on-surface-variant">Live preview of current transparency level across interface components.</span>
            </div>
          </div>
        </div>

        {/* Interface Font */}
        <div className="space-y-md3-md pt-md3-lg">
          <h3 className="text-headline-md text-md3-on-surface">Interface Font</h3>
          <div className="relative group max-w-sm">
            <select className="w-full appearance-none bg-white border border-md3-outline-variant/40 rounded-xl px-md3-lg py-md3-md text-body-md focus:ring-2 focus:ring-md3-primary focus:border-md3-primary outline-none transition-all pr-xl cursor-pointer shadow-sm">
              <option value="inter">Inter (Default)</option>
              <option value="geist">Geist Sans</option>
              <option value="sf-pro">SF Pro Display</option>
              <option value="roboto">Roboto Flex</option>
            </select>
            <span className="material-symbols-outlined absolute right-md3-md top-1/2 -translate-y-1/2 pointer-events-none text-md3-on-surface-variant">unfold_more</span>
          </div>
          <p className="text-label-sm text-md3-on-surface-variant px-sm">Primary typeface used for headlines, body text, and labels.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Models Settings ─────────────────────────────────────────────────
export function ModelsSettingsPage() {
  const [strategy, setStrategy] = useState('high_quality')
  const [providerTab, setProviderTab] = useState('openai')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)

  return (
    <div className="max-w-[1200px] mx-auto px-md3-xl py-md3-xl pr-8 pb-10 animate-in fade-in duration-700">
      <header className="mb-md3-md">
        <h2 className="text-headline-lg text-md3-on-surface mb-xs">Model Configuration</h2>
        <p className="text-body-md text-md3-on-surface-variant">Manage your active AI providers and configure default models for your workspace.</p>
      </header>

      <div className="space-y-md3-lg">
        {/* Performance Strategy */}
        <section className="bg-white border border-md3-outline-variant/30 rounded-xl p-md3-lg shadow-sm">
          <h3 className="text-headline-md text-md3-on-surface mb-md3-md">Performance Strategy</h3>
          <div className="flex bg-md3-surface-container-low p-xs rounded-xl gap-xs max-w-2xl">
            {[
              { id: 'balanced', label: 'Balanced' },
              { id: 'speed', label: 'Speed' },
              { id: 'high_quality', label: 'High Quality' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id)}
                className={cn(
                  'flex-1 py-sm text-label-md rounded-lg transition-all cursor-pointer',
                  strategy === s.id
                    ? 'bg-md3-surface-container-lowest text-md3-primary shadow-sm ring-1 ring-black/5 font-bold'
                    : 'text-md3-on-surface-variant hover:bg-md3-surface-container-high'
                )}
              >{s.label}</button>
            ))}
          </div>
          <p className="mt-md3-md text-label-sm text-md3-on-surface-variant opacity-70 flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Prioritizes complex reasoning and detailed outputs across all enabled providers.
          </p>
        </section>

        {/* Active Tier Summary */}
        <section className="bg-white border border-md3-outline-variant/30 rounded-xl p-md3-lg shadow-sm">
          <h3 className="text-headline-md text-md3-on-surface mb-md3-md">Active Tier Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md3-md">
            {[
              { icon: 'diamond', label: 'Pro Tier', options: ['GPT-4o', 'Claude 3.5 Sonnet', 'Llama 3 (70B)'] },
              { icon: 'star', label: 'Standard Tier', options: ['GPT-4 Turbo', 'Claude 3 Haiku', 'Gemini 1.5 Pro'] },
              { icon: 'bolt', label: 'Lite Tier', options: ['GPT-3.5 Turbo', 'Llama 3 (8B)', 'Mistral 7B'] },
            ].map(tier => (
              <div key={tier.label} className="p-md3-md bg-md3-surface-container-low rounded-xl border border-md3-outline-variant/30 flex flex-col gap-sm">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-md3-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{tier.icon}</span>
                  <span className="text-label-md font-bold text-md3-primary">{tier.label}</span>
                </div>
                <div className="relative">
                  <select className="w-full bg-md3-surface-container-lowest border border-md3-outline-variant/50 rounded-lg px-sm py-xs text-body-sm text-md3-on-surface outline-none focus:ring-2 focus:ring-md3-primary appearance-none cursor-pointer">
                    {tier.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-md3-on-surface-variant text-[18px]">expand_more</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Provider Config */}
        <section className="bg-white border border-md3-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-md3-outline-variant/30 bg-md3-surface-container-low/30 px-md3-lg pt-md3-md">
            <div className="flex gap-lg overflow-x-auto">
              {['openai', 'anthropic', 'google', 'meta'].map(p => (
                <button
                  key={p}
                  onClick={() => setProviderTab(p)}
                  className={cn(
                    'pb-sm px-xs border-b-2 text-label-md whitespace-nowrap outline-none capitalize transition-colors',
                    providerTab === p
                      ? 'border-md3-primary text-md3-primary font-bold'
                      : 'border-transparent text-md3-on-surface-variant hover:text-md3-on-surface cursor-pointer'
                  )}
                >{p === 'openai' ? 'OpenAI' : p === 'anthropic' ? 'Anthropic' : p === 'google' ? 'Google' : 'Meta'}</button>
              ))}
            </div>
          </div>

          <div className="p-md3-lg">
            <div className="flex justify-between items-center mb-md3-lg">
              <div>
                <h3 className="text-headline-md text-md3-on-surface">{providerTab === 'openai' ? 'OpenAI' : providerTab === 'anthropic' ? 'Anthropic' : providerTab === 'google' ? 'Google' : 'Meta'} Models</h3>
                <p className="text-body-sm text-md3-on-surface-variant">Select active models and set your global default.</p>
              </div>
              <span className="inline-flex items-center px-sm py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold tracking-wider uppercase">Connection Active</span>
            </div>

            <div className="grid grid-cols-1 gap-md3-md">
              {/* Default model */}
              <div className="p-md3-md rounded-xl border-2 border-md3-primary bg-md3-primary/5 flex items-center justify-between transition-all">
                <div className="flex items-center gap-md3-md">
                  <div className="w-10 h-10 rounded-lg bg-md3-primary text-md3-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-xs">
                      <span className="text-headline-md text-md3-primary text-lg">GPT-4o</span>
                      <span className="px-xs py-[2px] bg-md3-primary text-md3-on-primary rounded text-[10px] font-bold">DEFAULT</span>
                    </div>
                    <p className="text-label-sm text-md3-on-surface-variant opacity-70">Multimodal intelligence, high reasoning speed.</p>
                  </div>
                </div>
                <div className="text-right mr-sm">
                  <span className="block text-label-sm font-bold text-md3-primary">Tier: Pro</span>
                  <span className="text-[10px] text-md3-on-surface-variant">Active in 12 agents</span>
                </div>
              </div>

              {/* Other models */}
              {[
                { name: 'GPT-4 Turbo', desc: 'Proven performance for long-context tasks.', icon: 'psychology' },
                { name: 'GPT-3.5 Turbo', desc: 'Fastest response times for simple automation.', icon: 'bolt' },
              ].map(m => (
                <div key={m.name} className="p-md3-md rounded-xl border border-md3-outline-variant/50 flex items-center justify-between hover:border-md3-primary/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-md3-md">
                    <div className="w-10 h-10 rounded-lg bg-md3-surface-container-high text-md3-on-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined">{m.icon}</span>
                    </div>
                    <div>
                      <span className="text-headline-md text-md3-on-surface text-lg">{m.name}</span>
                      <p className="text-label-sm text-md3-on-surface-variant opacity-70">{m.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="bg-md3-surface-container-low/50 p-md3-lg border-t border-md3-outline-variant/30">
            <div className="flex items-center gap-sm mb-md3-md">
              <span className="material-symbols-outlined text-md3-primary">key</span>
              <h4 className="text-label-md font-bold text-md3-on-surface">{providerTab === 'openai' ? 'OpenAI' : providerTab === 'anthropic' ? 'Anthropic' : providerTab === 'google' ? 'Google' : 'Meta'} API Connection</h4>
            </div>
            <div className="flex gap-md3-md max-w-xl">
              <div className="relative flex-1">
                <input
                  className="w-full px-md3-md py-sm bg-md3-surface text-md3-on-surface border border-md3-outline-variant/50 rounded-lg focus:ring-2 focus:ring-md3-primary outline-none transition-all text-body-sm"
                  type="password"
                  defaultValue="sk-••••••••••••••••••••••••"
                />
                <button className="absolute right-md3-md top-1/2 -translate-y-1/2 text-md3-on-surface-variant hover:text-md3-primary cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </button>
              </div>
              <button className="px-md3-lg py-sm border border-md3-outline-variant bg-white text-md3-on-surface text-label-md rounded-lg hover:bg-md3-surface-container transition-colors flex items-center gap-sm whitespace-nowrap cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">sync</span>
                Test Connection
              </button>
            </div>
          </div>
        </section>

        {/* Global Parameters */}
        <section className="bg-white border border-md3-outline-variant/30 rounded-xl p-md3-lg shadow-sm">
          <h3 className="text-headline-md text-md3-on-surface mb-md3-lg">Global Parameters</h3>
          <p className="text-body-sm text-md3-on-surface-variant mb-md3-xl -mt-md3-md">These settings apply to the default model unless overridden at the agent level.</p>

          <div className="space-y-md3-xl max-w-2xl">
            <div>
              <div className="flex justify-between items-center mb-sm">
                <label className="text-label-md text-md3-on-surface-variant">Temperature</label>
                <span className="text-label-sm text-md3-primary bg-md3-primary/10 px-sm py-xs rounded">{temperature}</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.1} value={temperature}
                onChange={e => setTemperature(Number(e.target.value))}
                className="w-full appearance-none bg-md3-outline-variant/30 h-1 rounded-full cursor-pointer outline-none slider-thumb-primary"
              />
              <div className="flex justify-between mt-xs">
                <span className="text-label-sm text-md3-on-surface-variant/50">Precise</span>
                <span className="text-label-sm text-md3-on-surface-variant/50">Creative</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-sm">
                <label className="text-label-md text-md3-on-surface-variant">Max Tokens</label>
                <span className="text-label-sm text-md3-primary bg-md3-primary/10 px-sm py-xs rounded">{maxTokens}</span>
              </div>
              <input
                type="range" min={256} max={128000} step={256} value={maxTokens}
                onChange={e => setMaxTokens(Number(e.target.value))}
                className="w-full appearance-none bg-md3-outline-variant/30 h-1 rounded-full cursor-pointer outline-none slider-thumb-primary"
              />
              <div className="flex justify-between mt-xs">
                <span className="text-label-sm text-md3-on-surface-variant/50">Short</span>
                <span className="text-label-sm text-md3-on-surface-variant/50">Long Context</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// ─── Billing Settings ────────────────────────────────────────────────
const BAR_HEIGHTS = [40, 60, 45, 70, 85, 55, 40, 75, 90, 65]
const CACHE_RATIOS = [30, 40, 20, 50, 25, 35, 10, 40, 20, 30]

export function BillingSettingsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-md3-xl py-md3-xl pb-xl animate-in fade-in duration-700">
      <div className="mb-md3-xl">
        <h2 className="text-headline-lg text-[32px] font-semibold text-md3-on-surface mb-xs">Usage &amp; Billing</h2>
        <p className="text-body-md text-md3-on-surface-variant">Manage your subscription plans, view usage metrics, and update payment information.</p>
      </div>

      <div className="space-y-md3-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-md3-lg">
          {/* Current Plan */}
          <section className="md:col-span-5 glass-card bg-white/70 backdrop-blur-md border border-md3-outline-variant/30 rounded-2xl p-md3-lg flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-start mb-md3-lg">
                <div>
                  <span className="bg-md3-primary/10 text-md3-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Active Plan</span>
                  <h3 className="text-headline-md text-[24px] font-bold">Pro Plan</h3>
                </div>
                <div className="text-right">
                  <p className="text-headline-md text-[24px] font-bold">$29.00</p>
                  <p className="text-label-sm text-md3-on-surface-variant">per month</p>
                </div>
              </div>
              <div className="space-y-4 mb-md3-xl">
                <div className="flex items-center gap-3 text-md3-on-surface-variant">
                  <span className="material-symbols-outlined text-md3-primary">event</span>
                  <span className="text-body-sm">Next renewal: <strong className="text-md3-on-surface">October 12, 2024</strong></span>
                </div>
                <div className="flex items-center gap-3 text-md3-on-surface-variant">
                  <span className="material-symbols-outlined text-md3-primary">credit_card</span>
                  <span className="text-body-sm">Charged to: <strong className="text-md3-on-surface">Visa **** 4242</strong></span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-auto">
              <button className="flex-1 py-3 px-4 bg-md3-primary text-md3-on-primary rounded-xl font-bold text-center hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer">Change Plan</button>
              <button className="px-4 py-3 border border-md3-outline-variant text-md3-on-surface-variant rounded-xl hover:bg-md3-surface-container-low active:scale-[0.98] transition-all cursor-pointer font-bold">Cancel</button>
            </div>
          </section>

          {/* Usage Quota Overview */}
          <section className="md:col-span-7 glass-card bg-white/70 backdrop-blur-md border border-md3-outline-variant/30 rounded-2xl p-md3-lg shadow-sm">
            <h3 className="text-label-md text-[14px] font-bold text-md3-on-surface-variant uppercase tracking-widest mb-md3-lg">Usage Quota Overview</h3>
            <div className="grid grid-cols-1 gap-md3-lg md:grid-cols-2">
              {/* Token Usage Ring */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-md3-surface-container-highest" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8" />
                    <circle className="text-md3-primary" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301.6" strokeDashoffset="45.2" strokeWidth="8" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-headline-md text-[24px] font-bold">850K</span>
                  </div>
                </div>
                <p className="text-label-md text-[14px] font-bold mb-1">Token Usage</p>
                <p className="text-label-sm text-[12px] text-md3-on-surface-variant">of 1M quota</p>
              </div>

              {/* Cache Hit Rate Ring */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-md3-surface-container-highest" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8" />
                    <circle className="text-md3-secondary" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301.6" strokeDashoffset="96.5" strokeWidth="8" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-headline-md text-[24px] font-bold">68%</span>
                  </div>
                </div>
                <p className="text-label-md text-[14px] font-bold mb-1">Cache Hit Rate</p>
                <p className="text-label-sm text-[12px] text-md3-on-surface-variant">Average Cache Hit</p>
              </div>
            </div>
          </section>

          {/* Cost Analysis Chart */}
          <section className="md:col-span-12 glass-card bg-white/70 backdrop-blur-md border border-md3-outline-variant/30 rounded-2xl p-md3-lg shadow-sm">
            <div className="flex justify-between items-end mb-md3-xl">
              <div>
                <h3 className="text-label-md text-[14px] font-bold text-md3-on-surface-variant uppercase tracking-widest mb-2">Cost Analysis</h3>
                <p className="text-headline-md text-[24px] font-bold">Daily Spending <span className="text-md3-on-surface-variant font-normal text-[14px] ml-1">(Last 30 Days)</span></p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-2 text-label-md text-[14px] text-md3-on-surface-variant bg-md3-surface-container px-3 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-md3-primary" />Tokens
                </span>
                <span className="flex items-center gap-2 text-label-md text-[14px] text-md3-on-surface-variant bg-md3-surface-container px-3 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-md3-secondary" /> Cache Hit
                </span>
              </div>
            </div>
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} className="w-full flex flex-col justify-end group relative cursor-pointer hover:brightness-110 transition-all" style={{ height: `${h}%` }}>
                  <div className="w-full bg-md3-primary flex-1 rounded-t-sm" />
                  <div className="w-full bg-md3-secondary" style={{ height: `${CACHE_RATIOS[i]}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2 text-md3-on-surface-variant text-label-sm text-[12px]">
              <span>Sep 01</span>
              <span>Sep 15</span>
              <span>Today</span>
            </div>
          </section>

          {/* Billing History */}
          <section className="md:col-span-12 glass-card bg-white/70 backdrop-blur-md border border-md3-outline-variant/30 rounded-2xl p-md3-lg overflow-hidden shadow-sm">
            <div className="flex justify-between items-center mb-md3-lg">
              <h3 className="text-label-md text-[14px] font-bold text-md3-on-surface-variant uppercase tracking-widest">Billing History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-md3-outline-variant/30 text-label-sm text-[12px] text-md3-on-surface-variant uppercase tracking-wider">
                    <th className="pb-4 font-medium px-2">Date</th>
                    <th className="pb-4 font-medium px-2">Description</th>
                    <th className="pb-4 font-medium px-2 text-right">Amount</th>
                    <th className="pb-4 font-medium px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm text-[14px]">
                  {[
                    { date: 'Sep 12, 2024', desc: 'Pro Plan - Monthly Subscription', amount: '$29.00', status: 'paid' },
                    { date: 'Aug 12, 2024', desc: 'Pro Plan - Monthly Subscription', amount: '$29.00', status: 'paid' },
                    { date: 'Jul 28, 2024', desc: 'Overage Charge - 250k Tokens', amount: '$12.50', status: 'pending' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-md3-outline-variant/10 group hover:bg-md3-surface-container-low transition-colors">
                      <td className={cn('py-4 px-2', i > 0 && 'text-md3-on-surface-variant')}>{row.date}</td>
                      <td className={cn('py-4 px-2 font-medium', i > 0 && 'text-md3-on-surface-variant')}>{row.desc}</td>
                      <td className={cn('py-4 px-2 text-right', i > 0 && 'text-md3-on-surface-variant')}>{row.amount}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider',
                          row.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', row.status === 'paid' ? 'bg-green-500' : 'bg-amber-500')} />
                          {row.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-md3-xl flex flex-col md:flex-row justify-between items-center px-md3-lg py-md3-md glass-card bg-white/70 backdrop-blur-md border border-md3-outline-variant/30 rounded-2xl shadow-sm gap-md3-md">
        <div className="flex items-center gap-4 text-center md:text-left">
          <span className="material-symbols-outlined text-md3-primary hidden md:block">info</span>
          <p className="text-body-sm text-md3-on-surface-variant">Need to scale further? Contact our <a className="text-md3-primary font-bold hover:underline cursor-pointer">Enterprise Team</a> for custom quotas.</p>
        </div>
        <div className="flex items-center justify-center gap-6">
          <a className="text-label-sm text-[12px] text-md3-on-surface-variant hover:text-md3-on-surface transition-colors cursor-pointer">Legal &amp; Terms</a>
          <a className="text-label-sm text-[12px] text-md3-on-surface-variant hover:text-md3-on-surface transition-colors cursor-pointer">Privacy Policy</a>
        </div>
      </footer>
    </div>
  )
}

// ─── Advanced Settings ───────────────────────────────────────────────
export function AdvancedSettingsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-md3-xl py-md3-xl pb-xl animate-in fade-in duration-700">
      <div className="mb-md3-xl">
        <h2 className="text-headline-lg text-md3-on-surface mb-sm">Advanced Settings</h2>
        <p className="text-body-md text-md3-on-surface-variant">Configure underlying engine parameters and data sovereignty protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md3-lg">
        {/* Memory Management */}
        <div className="bg-white p-md3-lg rounded-xl shadow-sm border border-md3-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-md3-md mb-md3-md">
            <div className="p-2 bg-md3-primary/10 rounded-lg text-md3-primary flex items-center justify-center">
              <span className="material-symbols-outlined">memory</span>
            </div>
            <h3 className="text-headline-md text-[24px] font-bold text-md3-on-surface">Memory Management</h3>
          </div>
          <p className="text-md3-on-surface-variant text-body-sm mb-md3-lg">Manage how the AI persists context and session artifacts over time.</p>
          <div className="space-y-md3-md">
            <div className="flex items-center justify-between py-sm gap-md3-md">
              <div>
                <div className="text-label-md text-[14px] text-md3-on-surface font-semibold mb-1">Long-term Memory</div>
                <div className="text-label-sm text-[12px] text-md3-on-surface-variant leading-tight">Allow agent to reference past conversations.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-md3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-md3-primary" />
              </label>
            </div>
            <button className="w-full py-md3-md border border-md3-outline-variant/50 rounded-xl text-md3-on-surface text-label-md font-bold text-[14px] hover:bg-md3-surface-container-low transition-colors active:scale-[0.99] cursor-pointer">
              Clear Session Cache
            </button>
          </div>
        </div>

        {/* Data Privacy */}
        <div className="bg-white p-md3-lg rounded-xl shadow-sm border border-md3-outline-variant/30 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-md3-md mb-md3-md">
            <div className="p-2 bg-md3-secondary/10 rounded-lg text-md3-secondary flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
            <h3 className="text-headline-md text-[24px] font-bold text-md3-on-surface">Data Privacy</h3>
          </div>
          <p className="text-md3-on-surface-variant text-body-sm mb-md3-lg">Control your cryptographic signatures and usage telemetry protocols.</p>
          <div className="space-y-md3-lg mt-sm">
            <div className="flex items-center justify-between gap-md3-md">
              <div>
                <div className="text-label-md text-[14px] text-md3-on-surface font-semibold mb-1">Anonymous Usage Reporting</div>
                <div className="text-label-sm text-[12px] text-md3-on-surface-variant leading-tight">Share diagnostic data to improve models.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-md3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-md3-secondary" />
              </label>
            </div>
            <div className="flex items-center justify-between gap-md3-md">
              <div>
                <div className="text-label-md text-[14px] text-md3-on-surface font-semibold mb-1">Local Data Encryption</div>
                <div className="text-label-sm text-[12px] text-md3-on-surface-variant leading-tight">Encrypt database with AES-256 standard.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-md3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-md3-secondary" />
              </label>
            </div>
          </div>
        </div>

        {/* Developer Options */}
        <div className="bg-white p-md3-lg rounded-xl shadow-sm border border-md3-outline-variant/30 lg:col-span-2 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-md3-md mb-md3-md">
            <div className="p-2 bg-md3-tertiary/10 rounded-lg text-md3-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">terminal</span>
            </div>
            <h3 className="text-headline-md text-[24px] font-bold text-md3-on-surface">Developer Options</h3>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md3-lg">
            <div className="flex-1">
              <p className="text-md3-on-surface-variant text-body-sm mb-md3-md">Advanced tools for debugging agent behaviors and observing raw kernel output.</p>
              <div className="flex items-center gap-md3-md">
                <button className="flex items-center gap-xs text-md3-primary text-label-md text-[14px] hover:underline cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  View System Logs
                </button>
                <span className="text-md3-outline-variant">|</span>
                <button className="flex items-center gap-xs text-md3-primary text-label-md text-[14px] hover:underline cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">api</span>
                  Manage API Keys
                </button>
              </div>
            </div>
            <div className="flex items-center gap-md3-md bg-md3-surface-container-low p-md3-md rounded-xl border border-md3-outline-variant/20 shrink-0">
              <span className="text-label-md text-[14px] text-md3-on-surface">Enable Debug Console</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-md3-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-md3-tertiary" />
              </label>
            </div>
          </div>
        </div>

        {/* Critical System Reset */}
        <div className="lg:col-span-2 border-2 border-md3-error/20 bg-md3-error/5 p-md3-lg rounded-xl mt-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md3-lg relative z-10">
            <div className="flex items-start gap-md3-md">
              <div className="p-2 bg-md3-error/10 rounded-lg text-md3-error shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="text-headline-md text-[24px] font-bold text-md3-error mb-1">Critical System Reset</h3>
                <p className="text-md3-on-surface-variant text-body-sm max-w-xl">Resetting to factory settings will permanently delete all local agents, conversation history, and fine-tuning parameters. This action cannot be undone.</p>
              </div>
            </div>
            <button className="px-xl py-md3-md bg-md3-error text-white rounded-xl text-label-md text-[14px] font-bold hover:bg-md3-error/90 shadow-md active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer">
              Reset to Factory Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
