import { useApp } from '@/context/AppContext'

export default function BillingSettings() {
  const { usage, status } = useApp()

  const inputTokens = usage?.input_tokens ?? 0
  const outputTokens = usage?.output_tokens ?? 0
  const totalTokens = inputTokens + outputTokens
  const costUsd = usage?.cost_usd ?? 0

  return (
    <div className="pb-xl">
      <div className="mb-xl">
        <h2 className="font-headline-lg text-[32px] font-semibold text-on-surface mb-xs">Usage &amp; Billing</h2>
        <p className="font-body-md text-on-surface-variant">View usage metrics for your current session.</p>
      </div>

      <div className="space-y-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
          {/* Token Usage Summary */}
          <section className="md:col-span-5 bg-white/70 backdrop-blur-md border border-[#e2e8f0]/80 rounded-2xl p-lg shadow-sm">
            <h3 className="font-label-md text-[14px] font-bold text-on-surface-variant uppercase tracking-widest mb-lg">Current Session</h3>
            <div className="space-y-md">
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/10">
                <span className="font-body-sm text-on-surface-variant">Provider</span>
                <span className="font-label-md text-on-surface font-bold">{status?.provider ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/10">
                <span className="font-body-sm text-on-surface-variant">Model</span>
                <span className="font-label-md text-on-surface font-bold">{status?.model ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/10">
                <span className="font-body-sm text-on-surface-variant">Input Tokens</span>
                <span className="font-label-md text-on-surface font-bold">{inputTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/10">
                <span className="font-body-sm text-on-surface-variant">Output Tokens</span>
                <span className="font-label-md text-on-surface font-bold">{outputTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-sm">
                <span className="font-body-sm text-on-surface-variant">Total Tokens</span>
                <span className="font-label-md text-primary font-bold">{totalTokens.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Cost Overview */}
          <section className="md:col-span-7 bg-white/70 backdrop-blur-md border border-[#e2e8f0]/80 rounded-2xl p-lg shadow-sm">
            <h3 className="font-label-md text-[14px] font-bold text-on-surface-variant uppercase tracking-widest mb-lg">Cost Overview</h3>
            <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-highest" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8" />
                    <circle className="text-primary transition-all duration-1000 ease-out" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor"
                      strokeDasharray="301.6"
                      strokeDashoffset={totalTokens > 0 ? 301.6 - Math.min(301.6, (totalTokens / 1000000) * 301.6) : 301.6}
                      strokeWidth="8" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-headline-md text-[24px] font-bold">
                      {totalTokens >= 1000000 ? `${(totalTokens / 1000000).toFixed(1)}M` : totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(0)}K` : '0'}
                    </span>
                  </div>
                </div>
                <p className="font-label-md text-[14px] font-bold mb-1">Token Usage</p>
                <p className="font-label-sm text-[12px] text-on-surface-variant">This session</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 mb-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-highest" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8" />
                    <circle className="text-secondary transition-all duration-1000 ease-out" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor"
                      strokeDasharray="301.6"
                      strokeDashoffset={costUsd > 0 ? Math.max(0, 301.6 - (costUsd / 10) * 301.6) : 301.6}
                      strokeWidth="8" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-headline-md text-[24px] font-bold">${costUsd.toFixed(2)}</span>
                  </div>
                </div>
                <p className="font-label-md text-[14px] font-bold mb-1">Session Cost</p>
                <p className="font-label-sm text-[12px] text-on-surface-variant">Estimated spend</p>
              </div>
            </div>
          </section>

          {/* Token Breakdown */}
          <section className="md:col-span-12 bg-white/70 backdrop-blur-md border border-[#e2e8f0]/80 rounded-2xl p-lg shadow-sm">
            <h3 className="font-label-md text-[14px] font-bold text-on-surface-variant uppercase tracking-widest mb-lg">Token Breakdown</h3>
            <div className="space-y-md">
              <div>
                <div className="flex justify-between mb-sm">
                  <span className="font-label-md text-on-surface">Input Tokens</span>
                  <span className="font-label-md text-primary font-bold">{inputTokens.toLocaleString()}</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: totalTokens > 0 ? `${(inputTokens / totalTokens) * 100}%` : '0%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-sm">
                  <span className="font-label-md text-on-surface">Output Tokens</span>
                  <span className="font-label-md text-secondary font-bold">{outputTokens.toLocaleString()}</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: totalTokens > 0 ? `${(outputTokens / totalTokens) * 100}%` : '0%' }} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
