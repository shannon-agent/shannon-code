import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import * as api from '@/lib/tauri-api'
import type { SkillInfo } from '@/types'

export default function ExtensionsHub() {
  const [skills, setSkills] = useState<SkillInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMode, setFilterMode] = useState<'trending' | 'recent'>('trending')

  useEffect(() => {
    api.listSkills()
      .then(setSkills)
      .catch(e => console.warn('Failed to load skills:', e))
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(skills.map(s => s.category ?? 'Uncategorized'))]
  const sortedCategories = filterMode === 'recent' ? [...categories].reverse() : categories

  const iconForCategory = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'productivity': return 'bolt'
      case 'design': return 'palette'
      case 'data': case 'analysis': return 'analytics'
      case 'code': return 'code'
      default: return 'extension'
    }
  }

  const colorForCategory = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'productivity': return 'bg-blue-100 text-blue-600'
      case 'design': return 'bg-purple-100 text-purple-600'
      case 'data': case 'analysis': return 'bg-green-100 text-green-600'
      case 'code': return 'bg-orange-100 text-orange-600'
      default: return 'bg-surface-container-high text-on-surface-variant'
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-lg pt-lg pb-xl">
      <section className="mb-xl mt-4">
        <div className="flex items-center justify-between mb-lg">
          <h3 className="font-headline-md text-headline-md">Available Skills</h3>
          <div className="flex items-center gap-sm">
            <div className="flex bg-surface-container-low rounded-lg p-xs gap-xs">
              <button onClick={() => setFilterMode('trending')} className={`px-sm py-xs rounded-md text-label-sm font-bold cursor-pointer ${filterMode === 'trending' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>Trending</button>
              <button onClick={() => setFilterMode('recent')} className={`px-sm py-xs rounded-md text-label-sm font-bold cursor-pointer ${filterMode === 'recent' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>Recent</button>
            </div>
            <Button variant="ghost" className="px-md py-sm rounded-full bg-surface-container-high font-label-md text-label-md text-on-surface cursor-pointer">
              {skills.length} Skills
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-xl">
            <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-xl">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">extension_off</span>
            <p className="font-body-md text-on-surface-variant mt-md">No skills available.</p>
            <p className="font-body-sm text-on-surface-variant opacity-60">Skills can be added via MCP servers or plugin configuration.</p>
          </div>
        ) : (
          sortedCategories.map(cat => (
            <div key={cat} className="mb-lg">
              <h4 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-md">{cat}</h4>
              <div className="flex flex-wrap gap-md">
                {skills.filter(s => (s.category ?? 'Uncategorized') === cat).map(skill => (
                  <div key={skill.name} className="group cursor-pointer bg-white border border-outline-variant/50 rounded-xl p-md flex items-center gap-md hover:border-primary transition-all shadow-sm">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorForCategory(cat)}`}>
                      <span className="material-symbols-outlined">{iconForCategory(cat)}</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md font-bold">{skill.name}</p>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">{skill.description || `Trigger: ${skill.trigger}`}</p>
                    </div>
                    <span className="px-sm py-xs bg-surface-container-low rounded-full text-label-sm font-label-sm text-on-surface-variant">{skill.source}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
