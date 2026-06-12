import { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import * as api from '@/lib/tauri-api'
import type { BillingPlan, CostRecord, BillingHistory } from '@/types'

export default function BillingSettings() {
  const { usage, status } = useApp()
  const [plan, setPlan] = useState<BillingPlan | null>(null)
  const [costHistory, setCostHistory] = useState<CostRecord[]>([])
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])

  useEffect(() => {
    api.getBillingPlan().then(setPlan).catch(() => {})
    api.getCostHistory(30).then(setCostHistory).catch(() => {})
    api.getBillingHistory().then(setBillingHistory).catch(() => {})
  }, [])

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
        {/* Billing Plan Card */}
        {plan && (
          <section className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-lg shadow-sm">
            <div className="flex items-center justify-between mb-md">
              <div>
                <h3 className="font-headline-md text-on-surface font-bold">{plan.name} Plan</h3>
                <p className="text-body-sm text-on-surface-variant">{plan.token_limit.toLocaleString()} tokens/month</p>
              </div>
              <div className="text-right">
                <span className="text-display-sm text-primary font-bold">${plan.price}</span>
                <span className="text-body-sm text-on-surface-variant">/mo</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-sm">
              {plan.features.map(f => (
                <span key={f} className="px-sm py-xs bg-surface-container-lowest/60 rounded-full text-label-sm text-on-surface-variant">{f}</span>
              ))}
            </div>
            {/* Cost Chart (simple bar visualization) */}
            {costHistory.length > 0 && (
              <div className="mt-lg">
                <h4 className="font-label-md text-on-surface-variant mb-sm">Daily Cost (last 30 days)</h4>
                <div className="flex items-end gap-xs h-16">
                  {costHistory.slice(-14).map((r, i) => (
                    <div key={i} className="flex-1 bg-primary/40 rounded-t" style={{ height: `${Math.max(4, (r.cost_usd / Math.max(...costHistory.map(c => c.cost_usd), 0.01)) * 100)}%` }} title={`${r.date}: $${r.cost_usd.toFixed(4)}`} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
          {/* Token Usage Summary */}
          <section className="md:col-span-5 bg-surface-container-lowest/70 backdrop-blur-md border border-[#e2e8f0]/80 rounded-2xl p-lg shadow-sm">
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
          <section className="md:col-span-7 bg-surface-container-lowest/70 backdrop-blur-md border border-[#e2e8f0]/80 rounded-2xl p-lg shadow-sm">
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
          <section className="md:col-span-12 bg-surface-container-lowest/70 backdrop-blur-md border border-[#e2e8f0]/80 rounded-2xl p-lg shadow-sm">
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

          {/* Billing History */}
          {billingHistory.length > 0 && (
            <section className="md:col-span-12 bg-surface-container-lowest/70 backdrop-blur-md border border-[#e2e8f0]/80 rounded-2xl p-lg shadow-sm">
              <h3 className="font-label-md text-[14px] font-bold text-on-surface-variant uppercase tracking-widest mb-lg">Billing History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="pb-sm font-label-sm text-on-surface-variant">Date</th>
                      <th className="pb-sm font-label-sm text-on-surface-variant">Description</th>
                      <th className="pb-sm font-label-sm text-on-surface-variant text-right">Amount</th>
                      <th className="pb-sm font-label-sm text-on-surface-variant text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map(bh => (
                      <tr key={bh.id} className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors">
                        <td className="py-sm text-body-sm text-on-surface">{bh.date}</td>
                        <td className="py-sm text-body-sm text-on-surface">{bh.description}</td>
                        <td className="py-sm text-body-sm text-on-surface text-right">${bh.amount.toFixed(2)}</td>
                        <td className="py-sm text-right">
                          <span className={`px-sm py-xs rounded-full text-label-sm font-bold ${
                            bh.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : bh.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>{bh.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
