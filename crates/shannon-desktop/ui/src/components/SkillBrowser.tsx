// Skill browser for browsing and using available skills
import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Book, Terminal, Zap, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Empty } from './ui/empty'
import { Spinner } from './ui/spinner'
import { Kbd } from './ui/kbd'
import { listSkills, getSkillDetail } from '../lib/tauri-api'
import type { SkillInfo, SkillDetail } from '../lib/tauri-api'

type Skill = SkillInfo

interface SkillBrowserProps {
  onInsertTrigger?: (trigger: string) => void
  onClose?: () => void
}

/**
 * Skill browser for browsing and using available skills
 * - Uses shadcn Card, Badge, Empty, Spinner, Kbd
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
      const result = await listSkills()
      setSkills(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  const loadSkillDetail = async (skillName: string) => {
    try {
      const result = await getSkillDetail(skillName)
      setSkillDetail(result)
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
            aria-label="Back to skill list"
          >
            <X size={18} />
          </Button>
          <div className="flex-1">
            <h2 id="skill-detail-title" className="text-foreground text-lg font-semibold">Skill Details</h2>
            <div className="flex items-center gap-2 mt-1">
              <Kbd>{skillDetail.trigger}</Kbd>
              <Badge variant="secondary">from {skillDetail.source}</Badge>
            </div>
          </div>
        </div>

        {/* Skill detail content */}
        <div className="space-y-4" aria-labelledby="skill-detail-title">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-secondary-foreground">{skillDetail.description}</p>
            </CardContent>
          </Card>

          {/* Parameters */}
          {skillDetail.parameters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Skill parameters">
                  {skillDetail.parameters.map((param) => (
                    <Badge key={param} variant="outline" role="listitem">
                      {param}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Usage content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-secondary-foreground bg-background p-3 rounded overflow-x-auto" tabIndex={0}>
                <code>{skillDetail.content}</code>
              </pre>
            </CardContent>
          </Card>

          {/* Insert trigger button */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleInsertTrigger(skillDetail.trigger)}
              className="flex-1"
              aria-label={`Insert ${skillDetail.trigger} trigger`}
            >
              Insert Trigger
            </Button>
            <Button
              variant="outline"
              onClick={handleBack}
              aria-label="Back to skill list"
            >
              Back
            </Button>
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
          <Terminal className="text-primary" size={20} aria-hidden />
          <div>
            <h2 id="skill-browser-title" className="text-foreground text-lg font-semibold">Skill Browser</h2>
            <p className="text-muted-foreground text-sm">
              Browse and use available skills
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            aria-label="Close skill browser"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} aria-hidden />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills by name or description..."
          className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
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
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground" role="status">
            <Spinner />
            <span>Loading skills...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className="p-4 bg-destructive/10 border border-destructive rounded-lg"
            role="alert"
          >
            <p className="text-destructive">Error: {error}</p>
          </div>
        )}

        {/* Skills list */}
        {!loading && !error && (
          <div className="space-y-4" role="list" aria-label="Available skills">
            {Object.keys(skillsByCategory).length === 0 ? (
              <Empty
                icon={<Terminal className="w-8 h-8" />}
                title={searchQuery ? 'No matching skills found' : 'No skills available'}
                description="Skills from .shannon/skills/ and .claude/commands/ will appear here"
              />
            ) : (
              Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="space-y-2" role="group">
                  <div className="flex items-center gap-2">
                    <Book className="text-cyan" size={16} aria-hidden />
                    <h3 className="text-foreground font-semibold capitalize">{category}</h3>
                    <Badge variant="secondary">
                      {categorySkills.length}
                    </Badge>
                  </div>
                  <div className="space-y-2 ml-6">
                    {categorySkills.map((skill, index) => (
                      <Card
                        key={skill.name}
                        onClick={() => handleSkillClick(skill)}
                        tabIndex={focusedIndex === index ? 0 : -1}
                        role="listitem"
                        aria-label={`${skill.name}: ${skill.description}, trigger: ${skill.trigger}`}
                        className={`cursor-pointer transition-colors hover:border-muted-foreground ${
                          focusedIndex === index ? 'ring-1 ring-ring' : ''
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-foreground font-medium">{skill.name}</h4>
                                <Badge variant="outline">{skill.source}</Badge>
                              </div>
                              <p className="text-secondary-foreground text-sm mt-1 line-clamp-2">
                                {skill.description}
                              </p>
                              <div className="mt-2">
                                <Kbd>{skill.trigger}</Kbd>
                              </div>
                            </div>
                            <Zap className="text-muted-foreground flex-shrink-0" size={16} aria-hidden />
                          </div>
                        </CardContent>
                      </Card>
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
          className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border"
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
