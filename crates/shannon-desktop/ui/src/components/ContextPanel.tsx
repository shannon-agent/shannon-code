// Context panel — right sidebar showing file context, active skills, and visual analysis
export function ContextPanel() {
  const files = [
    { name: 'Global_Trends_2025.pdf', icon: 'description', color: 'text-md3-tertiary', detail: 'PDF Document • 1.2 MB' },
    { name: 'Renewable_Forecast_Raw.csv', icon: 'table_chart', color: 'text-md3-primary', detail: 'Spreadsheet • 4.5k rows' },
    { name: 'arch.md', icon: 'description', color: 'text-md3-tertiary', detail: 'Markdown • 12 KB' },
    { name: 'config.toml', icon: 'settings', color: 'text-md3-primary', detail: 'Config • 2.1 KB' },
  ]

  const skills = [
    { name: 'Forecasting', icon: 'query_stats' },
    { name: 'Data Analysis', icon: 'analytics' },
    { name: 'Reporting', icon: 'summarize' },
  ]

  return (
    <aside className="w-[300px] border-l border-md3-outline-variant/10 glass-panel shrink-0 p-md3-lg overflow-y-auto">
      <div className="space-y-md3-xl">

        {/* File Context */}
        <section>
          <div className="flex items-center justify-between mb-md3-md">
            <h3 className="text-label-md text-md3-on-surface uppercase tracking-wider opacity-60">File Context</h3>
            <span className="px-xs py-[2px] bg-md3-tertiary/10 text-md3-tertiary text-[10px] font-bold rounded">{files.length} ACTIVE</span>
          </div>
          <div className="space-y-sm">
            {files.map((file) => (
              <div key={file.name} className="p-md3-md bg-md3-surface-container rounded-xl flex items-center gap-md3-md border border-md3-outline-variant/10">
                <span className={cn('material-symbols-outlined text-[20px]', file.color)}>{file.icon}</span>
                <div className="min-w-0">
                  <p className="text-label-md truncate">{file.name}</p>
                  <p className="text-label-sm opacity-60">{file.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Skills */}
        <section>
          <h3 className="text-label-md text-md3-on-surface uppercase tracking-wider opacity-60 mb-md3-md">Active Skills</h3>
          <div className="flex flex-wrap gap-xs">
            {skills.map((skill) => (
              <span key={skill.name} className="px-md3-md py-sm bg-md3-primary/10 text-md3-primary text-label-sm rounded-full border border-md3-primary/20 flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">{skill.icon}</span>
                {skill.name}
              </span>
            ))}
          </div>
        </section>

        {/* Session Stats */}
        <section>
          <h3 className="text-label-md text-md3-on-surface uppercase tracking-wider opacity-60 mb-md3-md">Session Stats</h3>
          <div className="bg-md3-surface-container rounded-xl p-md3-md border border-md3-outline-variant/10 space-y-sm">
            {[
              { label: 'Messages', value: '--', icon: 'chat' },
              { label: 'Tokens Used', value: '--', icon: 'data_usage' },
              { label: 'Tool Calls', value: '--', icon: 'build' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between py-xs">
                <div className="flex items-center gap-sm text-md3-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">{stat.icon}</span>
                  <span className="text-label-sm">{stat.label}</span>
                </div>
                <span className="text-label-sm font-medium text-md3-on-surface">{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Visual Analysis */}
        <section className="space-y-md3-md">
          <h3 className="text-label-md text-md3-on-surface uppercase tracking-wider opacity-60">Visual Analysis</h3>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-inner border border-md3-outline-variant/20 relative group bg-md3-surface-container">
            <div className="w-full h-full bg-gradient-to-br from-md3-primary/10 via-md3-secondary/5 to-md3-tertiary/10 flex items-center justify-center">
              <div className="text-center space-y-md3-sm">
                <span className="material-symbols-outlined text-[40px] text-md3-primary/40">analytics</span>
                <p className="text-label-sm text-md3-on-surface-variant/60">Agent-generated visualizations will appear here</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-md3-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <button className="bg-white text-md3-primary px-md3-lg py-md3-md rounded-xl text-label-md shadow-lg">
                Expand Visual
              </button>
            </div>
          </div>
          <p className="text-body-sm text-center opacity-60">Analysis Preview</p>
        </section>
      </div>
    </aside>
  )
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}
