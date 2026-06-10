import React from 'react';

export default function AdvancedSettings() {
  return (
    <div className="pb-xl">
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Advanced Settings</h2>
        <p className="text-on-surface-variant font-body-md">Configure underlying engine parameters and data sovereignty protocols.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Memory Management */}
        <div className="bg-white p-lg rounded-xl shadow-sm border border-outline-variant/30 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-md mb-md">
            <div className="p-2 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">memory</span>
            </div>
            <h3 className="font-headline-md text-[24px] font-bold text-on-surface">Memory Management</h3>
          </div>
          <p className="text-on-surface-variant text-body-sm mb-lg">Manage how the AI persists context and session artifacts over time.</p>
          <div className="space-y-md">
            <div className="flex items-center justify-between py-sm gap-md">
              <div>
                <div className="font-label-md text-[14px] text-on-surface font-semibold mb-1">Long-term Memory</div>
                <div className="font-label-sm text-[12px] text-on-surface-variant leading-tight">Allow agent to reference past conversations.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <button className="w-full py-md border border-outline-variant/50 rounded-xl text-on-surface font-label-md font-bold text-[14px] hover:bg-surface-container-low transition-colors active:scale-[0.99] cursor-pointer">
              Clear Session Cache
            </button>
          </div>
        </div>

        {/* Data Privacy */}
        <div className="bg-white p-lg rounded-xl shadow-sm border border-outline-variant/30 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-md mb-md">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>security</span>
            </div>
            <h3 className="font-headline-md text-[24px] font-bold text-on-surface">Data Privacy</h3>
          </div>
          <p className="text-on-surface-variant text-body-sm mb-lg">Control your cryptographic signatures and usage telemetry protocols.</p>
          <div className="space-y-lg mt-sm">
            <div className="flex items-center justify-between gap-md">
              <div>
                <div className="font-label-md text-[14px] text-on-surface font-semibold mb-1">Anonymous Usage Reporting</div>
                <div className="font-label-sm text-[12px] text-on-surface-variant leading-tight">Share diagnostic data to improve models.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between gap-md">
              <div>
                <div className="font-label-md text-[14px] text-on-surface font-semibold mb-1">Local Data Encryption</div>
                <div className="font-label-sm text-[12px] text-on-surface-variant leading-tight">Encrypt database with AES-256 standard.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input defaultChecked className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Developer Options */}
        <div className="bg-white p-lg rounded-xl shadow-sm border border-outline-variant/30 lg:col-span-2 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-md mb-md">
            <div className="p-2 bg-tertiary/10 rounded-lg text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined">terminal</span>
            </div>
            <h3 className="font-headline-md text-[24px] font-bold text-on-surface">Developer Options</h3>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
            <div className="flex-1">
              <p className="text-on-surface-variant text-body-sm mb-md">Advanced tools for debugging agent behaviors and observing raw kernel output.</p>
              <div className="flex items-center gap-md">
                <button className="flex items-center gap-xs text-primary font-label-md text-[14px] hover:underline cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  View System Logs
                </button>
                <span className="text-outline-variant">|</span>
                <button className="flex items-center gap-xs text-primary font-label-md text-[14px] hover:underline cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">api</span>
                  Manage API Keys
                </button>
              </div>
            </div>
            <div className="flex items-center gap-md bg-surface-container-low p-md rounded-xl border border-outline-variant/20 shrink-0">
              <span className="font-label-md text-[14px] text-on-surface">Enable Debug Console</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Critical System Reset */}
        <div className="lg:col-span-2 border-2 border-error/20 bg-error/5 p-lg rounded-xl mt-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-lg relative z-10">
            <div className="flex items-start gap-md">
              <div className="p-2 bg-error/10 rounded-lg text-error shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="font-headline-md text-[24px] font-bold text-error mb-1">Critical System Reset</h3>
                <p className="text-on-surface-variant text-body-sm max-w-xl">Resetting to factory settings will permanently delete all local agents, conversation history, and fine-tuning parameters. This action cannot be undone.</p>
              </div>
            </div>
            <button className="px-xl py-md bg-error text-white rounded-xl font-label-md text-[14px] font-bold hover:bg-error/90 shadow-md active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer">
              Reset to Factory Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
