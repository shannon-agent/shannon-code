// Skill browser for browsing and using available skills
import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Code, Book, Terminal, Zap, ExternalLink, X } from 'lucide-react'

interface Skill {
  name: string
  description: string
  trigger: string
  source: string
  category?: string
}

interface SkillDetail {
  name: string
  description: string
  trigger: string
  content: string
  parameters: string[]
  source: string
  category?: string
}

interface SkillBrowserProps {
  onInsertTrigger?: (trigger: string) => void
  onClose?: () => void
}

/**
 * Skill browser for browsing and using available skills
 * - List available skills from .shannon/skills/ and .claude/commands/ directories
 * - Each skill shows: name, description, trigger command (e.g. /commit, /help)
 * - Search/filter skills by name or description
 * - Categories or tags if available
 * - Clicking a skill inserts its trigger into the message input
 * - Skill detail view shows description, parameters, usage examples
 * - Tokyo Night styling
 * - Full keyboard navigation and accessibility support
 */
export function SkillBrowser({ onInsertTrigger, onClose }: SkillBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [skillDetail, setSkillDetail] = useState<SkillDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load skills on mount
  useEffect(() => {
    loadSkills()
  }, [])

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  // Reset focused index when search query changes
  useEffect(() => {
    setFocusedIndex(-1)
  }, [searchQuery])

  // Keyboard navigation for skill list
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const filteredSkills = skills.filter(skill =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (skill.category && skill.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex(prev => Math.min(prev + 1, filteredSkills.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && focusedIndex >= 0 && filteredSkills[focusedIndex]) {
      e.preventDefault()
      handleSkillClick(filteredSkills[focusedIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose?.()
    }
  }, [skills, searchQuery, focusedIndex])

  const loadSkills = async () => {
    setLoading(true)
    setError(null)
    try {
      if (window.__TAURI__) {
        const result = await window.__TAURI__.invoke('list_skills')
        setSkills(result)
      } else {
        // Fallback mock data for development
        setSkills([
          {
            name: 'commit',
            description: 'Create git commits with staged changes',
            trigger: '/commit',
            source: 'claude',
            category: 'git'
          },
          {
            name: 'help',
            description: 'Show available commands and help information',
            trigger: '/help',
            source: 'shannon',
            category: 'general'
          },
          {
            name: 'search',
            description: 'Search for files and content across the codebase',
            trigger: '/search',
            source: 'shannon',
            category: 'navigation'
          }
        ])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills')
      console.error('Error loading skills:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSkillDetail = async (skillName: string) => {
    try {
      if (window.__TAURI__) {
        const result = await window.__TAURI__.invoke('get_skill_detail', { name: skillName })
        setSkillDetail(result)
      } else {
        // Fallback mock detail
        setSkillDetail({
          name: skillName,
          description: `Detailed description for ${skillName} skill`,
          trigger: `/${skillName}`,
          content: `# ${skillName} Skill\n\nThis is a custom skill for ${skillName} functionality.`,
          parameters: ['param1', 'param2'],
          source: 'claude',
          category: 'general'
        })
      }
    } catch (err) {
      console.error('Error loading skill detail:', err)
      setError(err instanceof Error ? err.message : 'Failed to load skill detail')
    }
  }

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill)
    loadSkillDetail(skill.name)
  }

  const handleInsertTrigger = (trigger: string) => {
    onInsertTrigger?.(trigger)
    onClose?.()
  }

  const handleBack = () => {
    setSelectedSkill(null)
    setSkillDetail(null)
  }

  // Filter skills by search query
  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (skill.category && skill.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Group skills by category
  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    const category = skill.category || 'general'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  if (selectedSkill && skillDetail) {
    return (
      <div
        className="space-y-4"
        role="region"
        aria-label="Skill details"
        aria-live="polite"
      >
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-[#24283b] text-[#c0caf5] hover:bg-[#2a2f44] transition-colors"
            aria-label="Back to skill list"
            type="button"
          >
            <X size={18} />
          </button>
          <div className="flex-1">
            <h2 id="skill-detail-title" className="text-[#c0caf5] text-lg font-semibold">Skill Details</h2>
            <div className="flex items-center gap-2 mt-1">
              <code className="px-2 py-1 bg-[#1a1b26] text-[#7aa2f7] text-sm rounded">
                {skillDetail.trigger}
              </code>
              <span className="text-[#565f89] text-sm">
                from {skillDetail.source}
              </span>
            </div>
          </div>
        </div>

        {/* Skill detail content */}
        <div className="space-y-4" aria-labelledby="skill-detail-title">
          {/* Description */}
          <div className="p-4 bg-[#1f2335] border border-[#414868] rounded-lg">
            <h3 className="text-[#c0caf5] font-semibold mb-2">Description</h3>
            <p className="text-[#a9b1d6]">{skillDetail.description}</p>
          </div>

          {/* Parameters */}
          {skillDetail.parameters.length > 0 && (
            <div className="p-4 bg-[#1f2335] border border-[#414868] rounded-lg">
              <h3 className="text-[#c0caf5] font-semibold mb-2">Parameters</h3>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Skill parameters">
                {skillDetail.parameters.map((param) => (
                  <code
                    key={param}
                    className="px-2 py-1 bg-[#1a1b26] text-[#bb9af7] text-sm rounded border border-[#414868]"
                    role="listitem"
                  >
                    {param}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Usage content */}
          <div className="p-4 bg-[#1f2335] border border-[#414868] rounded-lg">
            <h3 className="text-[#c0caf5] font-semibold mb-2">Usage</h3>
            <pre className="text-sm text-[#a9b1d6] bg-[#1a1b26] p-3 rounded overflow-x-auto" tabIndex={0}>
              <code>{skillDetail.content}</code>
            </pre>
          </div>

          {/* Insert trigger button */}
          <div className="flex gap-2">
            <button
              onClick={() => handleInsertTrigger(skillDetail.trigger)}
              className="flex-1 px-4 py-2 bg-[#7aa2f7] text-[#1a1b26] rounded-lg hover:bg-[#7aa2f7]/80 transition-colors font-medium"
              aria-label={`Insert ${skillDetail.trigger} trigger`}
              type="button"
            >
              Insert Trigger
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-[#414868] text-[#c0caf5] rounded-lg hover:bg-[#565f89] transition-colors"
              aria-label="Back to skill list"
              type="button"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="Skill browser"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="text-[#7aa2f7]" size={20} aria-hidden />
          <div>
            <h2 id="skill-browser-title" className="text-[#c0caf5] text-lg font-semibold">Skill Browser</h2>
            <p className="text-[#565f89] text-sm">
              Browse and use available skills
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#24283b] text-[#c0caf5] hover:bg-[#2a2f44] transition-colors"
            aria-label="Close skill browser"
            type="button"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565f89]" size={18} aria-hidden />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills by name or description..."
          className="w-full pl-10 pr-4 py-2 bg-[#1f2335] border border-[#414868] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7]"
          aria-label="Search skills"
          aria-describedby="search-instructions"
        />
        <span id="search-instructions" className="sr-only">
          Use arrow keys to navigate, Enter to select, Escape to close
        </span>
      </div>

      <>
        {/* Loading state */}
        {loading && (
          <div className="text-center py-8 text-[#565f89]" role="status">
            Loading skills...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className="p-4 bg-[#f7768e]/10 border border-[#f7768e] rounded-lg"
            role="alert"
          >
            <p className="text-[#f7768e]">Error: {error}</p>
          </div>
        )}

        {/* Skills list */}
        {!loading && !error && (
          <div className="space-y-4" role="list" aria-label="Available skills">
            {Object.keys(skillsByCategory).length === 0 ? (
              <div className="text-center py-8 text-[#565f89]" role="status">
                {searchQuery ? 'No matching skills found' : 'No skills available'}
              </div>
            ) : (
              Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="space-y-2" role="group">
                  <div className="flex items-center gap-2">
                    <Book className="text-[#7dcfff]" size={16} aria-hidden />
                    <h3 className="text-[#c0caf5] font-semibold capitalize">{category}</h3>
                    <span className="text-[#565f89] text-sm" aria-label={`${categorySkills.length} skills in ${category}`}>
                      ({categorySkills.length})
                    </span>
                  </div>
                  <div className="space-y-2 ml-6">
                    {categorySkills.map((skill, index) => (
                      <div
                        key={skill.name}
                        onClick={() => handleSkillClick(skill)}
                        tabIndex={focusedIndex === index ? 0 : -1}
                        role="listitem"
                        aria-label={`${skill.name}: ${skill.description}, trigger: ${skill.trigger}`}
                        className={`p-3 bg-[#1f2335] border border-[#414868] rounded-lg hover:border-[#565f89] transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#7aa2f7] ${
                          focusedIndex === index ? 'ring-1 ring-[#7aa2f7]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-[#c0caf5] font-medium">{skill.name}</h4>
                              <span className="text-[#565f89] text-xs">from {skill.source}</span>
                            </div>
                            <p className="text-[#a9b1d6] text-sm mt-1 line-clamp-2">
                              {skill.description}
                            </p>
                            <div className="mt-2">
                              <code className="text-xs px-2 py-1 bg-[#1a1b26] text-[#7aa2f7] rounded">
                                {skill.trigger}
                              </code>
                            </div>
                          </div>
                          <Zap className="text-[#565f89] flex-shrink-0" size={16} aria-hidden />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </>

      {/* Stats footer */}
      {!loading && !error && skills.length > 0 && (
        <div
          className="flex items-center gap-4 text-sm text-[#565f89] pt-2 border-t border-[#2a2f44]"
          role="status"
          aria-label={`Showing ${skills.length} skills in ${Object.keys(skillsByCategory).length} categories`}
        >
          <span>{skills.length} skills</span>
          <span>•</span>
          <span>{Object.keys(skillsByCategory).length} categories</span>
        </div>
      )}
    </div>
  )
}

// Extend Window interface for Tauri invoke
declare global {
  interface Window {
    __TAURI__?: {
      invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>
    }
  }
}