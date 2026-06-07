// Diff viewer with unified and split views, syntax highlighting, and hunk actions
import { useState, useMemo, useRef, useCallback } from 'react'
import { Check, X, Columns2, Rows3, MessageSquare, Send } from 'lucide-react'
import { Card, CardHeader, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
type ViewMode = 'unified' | 'split'

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed'
  oldLineNo: number | null
  newLineNo: number | null
  content: string
}

interface DiffHunk {
  lines: DiffLine[]
  startIndex: number
}

export interface DiffLineComment {
  text: string
  lineIndex: number
  lineContent: string
  lineType: DiffLine['type']
}

interface DiffViewerProps {
  oldContent: string
  newContent: string
  fileName?: string
  language?: string
  viewMode?: ViewMode
  onAcceptHunk?: (hunkIndex: number) => void
  onRejectHunk?: (hunkIndex: number) => void
  onComment?: (comment: DiffLineComment) => void
}

function computeDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const result: DiffLine[] = []
  let oi = 0
  let ni = 0

  // Simple LCS-based diff via patience-like approach
  // For large files, use a simpler greedy approach
  if (oldLines.length + newLines.length > 10000) {
    while (oi < oldLines.length || ni < newLines.length) {
      if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
        result.push({ type: 'unchanged', oldLineNo: oi + 1, newLineNo: ni + 1, content: oldLines[oi] })
        oi++; ni++
      } else {
        // Look ahead for matches
        let foundOld = -1, foundNew = -1
        const lookAhead = Math.min(20, Math.max(oldLines.length - oi, newLines.length - ni))
        outer: for (let d = 0; d < lookAhead; d++) {
          for (let j = 0; j <= d; j++) {
            const checkOi = oi + j
            const checkNi = ni + (d - j)
            if (checkOi < oldLines.length && checkNi < newLines.length && oldLines[checkOi] === newLines[checkNi]) {
              foundOld = checkOi; foundNew = checkNi; break outer
            }
          }
        }
        if (foundOld >= 0 && foundNew >= 0) {
          while (oi < foundOld) { result.push({ type: 'removed', oldLineNo: oi + 1, newLineNo: null, content: oldLines[oi] }); oi++ }
          while (ni < foundNew) { result.push({ type: 'added', oldLineNo: null, newLineNo: ni + 1, content: newLines[ni] }); ni++ }
        } else {
          if (oi < oldLines.length) { result.push({ type: 'removed', oldLineNo: oi + 1, newLineNo: null, content: oldLines[oi] }); oi++ }
          if (ni < newLines.length) { result.push({ type: 'added', oldLineNo: null, newLineNo: ni + 1, content: newLines[ni] }); ni++ }
        }
      }
    }
    return result
  }

  // LCS table approach for smaller files
  const m = oldLines.length, n = newLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = oldLines[i - 1] === newLines[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  // Backtrack
  const backtrack: DiffLine[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      backtrack.push({ type: 'unchanged', oldLineNo: i, newLineNo: j, content: oldLines[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      backtrack.push({ type: 'added', oldLineNo: null, newLineNo: j, content: newLines[j - 1] })
      j--
    } else {
      backtrack.push({ type: 'removed', oldLineNo: i, newLineNo: null, content: oldLines[i - 1] })
      i--
    }
  }
  backtrack.reverse()
  return backtrack
}

function groupIntoHunks(lines: DiffLine[]): DiffHunk[] {
  if (lines.length === 0) return []

  const hunks: DiffHunk[] = []
  let current: DiffLine[] = []
  let unchangedRun = 0
  let startIndex = 0
  let hasChange = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.type === 'unchanged') {
      unchangedRun++
      if (unchangedRun > 3 && hasChange && current.length > unchangedRun) {
        // End hunk, keep last 3 unchanged as context
        hunks.push({ lines: current.slice(0, current.length - unchangedRun + 3), startIndex })
        current = current.slice(current.length - 3)
        startIndex = i - 3
        hasChange = false
        unchangedRun = current.length
      } else {
        current.push(line)
      }
    } else {
      unchangedRun = 0
      hasChange = true
      current.push(line)
    }
  }

  if (current.length > 0) {
    hunks.push({ lines: current, startIndex })
  }

  return hunks.length > 0 ? hunks : [{ lines, startIndex: 0 }]
}

function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    rs: 'rust', py: 'python', go: 'go', rb: 'ruby', java: 'java',
    html: 'html', css: 'css', json: 'json', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', sql: 'sql', sh: 'bash', toml: 'toml',
  }
  return map[ext] || 'plaintext'
}

export function DiffViewer({
  oldContent,
  newContent,
  fileName,
  language,
  viewMode: initialMode = 'unified',
  onAcceptHunk,
  onRejectHunk,
  onComment,
}: DiffViewerProps) {
  const [mode, setMode] = useState<ViewMode>(initialMode)
  const [acceptedHunks, setAcceptedHunks] = useState<Set<number>>(new Set())
  const [rejectedHunks, setRejectedHunks] = useState<Set<number>>(new Set())
  const [comments, setComments] = useState<Map<number, string>>(new Map())
  const [commentingLine, setCommentingLine] = useState<number | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const splitOldRef = useRef<HTMLDivElement>(null)
  const splitNewRef = useRef<HTMLDivElement>(null)

  const oldLines = useMemo(() => oldContent.split('\n'), [oldContent])
  const newLines = useMemo(() => newContent.split('\n'), [newContent])
  const diffLines = useMemo(() => computeDiff(oldLines, newLines), [oldLines, newLines])
  const hunks = useMemo(() => groupIntoHunks(diffLines), [diffLines])
  const lang = language || (fileName ? detectLanguage(fileName) : 'plaintext')

  const stats = useMemo(() => {
    let added = 0, removed = 0
    for (const line of diffLines) {
      if (line.type === 'added') added++
      else if (line.type === 'removed') removed++
    }
    return { added, removed, unchanged: diffLines.length - added - removed }
  }, [diffLines])

  // Check if files are identical
  const hasChanges = useMemo(() => stats.added > 0 || stats.removed > 0, [stats])

  const handleAccept = useCallback((idx: number) => {
    setAcceptedHunks(prev => new Set(prev).add(idx))
    onAcceptHunk?.(idx)
  }, [onAcceptHunk])

  const handleReject = useCallback((idx: number) => {
    setRejectedHunks(prev => new Set(prev).add(idx))
    onRejectHunk?.(idx)
  }, [onRejectHunk])

  const handleToggleComment = useCallback((lineIdx: number) => {
    setCommentingLine(prev => prev === lineIdx ? null : lineIdx)
    setCommentDraft('')
  }, [])

  const handleSubmitComment = useCallback((lineIdx: number, line: DiffLine) => {
    if (!commentDraft.trim()) return
    setComments(prev => {
      const next = new Map(prev)
      next.set(lineIdx, commentDraft.trim())
      return next
    })
    onComment?.({
      text: commentDraft.trim(),
      lineIndex: lineIdx,
      lineContent: line.content,
      lineType: line.type,
    })
    setCommentingLine(null)
    setCommentDraft('')
  }, [commentDraft, onComment])

  // Synchronized scrolling for split view
  const handleOldScroll = useCallback(() => {
    if (splitOldRef.current && splitNewRef.current) {
      splitNewRef.current.scrollTop = splitOldRef.current.scrollTop
    }
  }, [])

  const lineClass = (type: DiffLine['type']) => {
    switch (type) {
      case 'added': return 'bg-success/10 text-foreground'
      case 'removed': return 'bg-destructive/10 text-foreground'
      default: return 'text-muted-foreground'
    }
  }

  const gutterSign = (type: DiffLine['type']) => {
    switch (type) {
      case 'added': return <span className="text-success">+</span>
      case 'removed': return <span className="text-destructive">-</span>
      default: return <span className="text-muted-foreground/40"> </span>
    }
  }

  return (
    <Card className="my-2 overflow-hidden">
      {/* Empty state for identical files */}
      {!hasChanges && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-muted-foreground">
          <Check className="w-12 h-12 text-success mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Files are identical</h3>
          <p className="text-sm">No changes detected between versions</p>
        </div>
      )}

      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between px-3 py-2 bg-secondary border-b border-border space-y-0">
        <div className="flex items-center gap-3">
          <Badge variant="outline">{fileName || 'diff'}</Badge>
          <span className="text-xs text-muted-foreground">{lang}</span>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-success">+{stats.added}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-destructive">-{stats.removed}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={mode === 'unified' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setMode('unified')}
            title="Unified view"
            className="h-6 w-6"
          >
            <Rows3 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={mode === 'split' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setMode('split')}
            title="Split view"
            className="h-6 w-6"
          >
            <Columns2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>

      {/* Diff content */}
      {mode === 'unified' ? (
        <CardContent className="p-0">
          <div className="overflow-x-auto text-[12px] font-mono leading-[20px]">
            {hunks.map((hunk, hunkIdx) => {
              const resolved = acceptedHunks.has(hunkIdx) || rejectedHunks.has(hunkIdx)
              return (
                <div key={hunkIdx} className={resolved ? 'opacity-40' : ''}>
                  {/* Hunk actions */}
                  {(onAcceptHunk || onRejectHunk) && !resolved && hunks.length > 1 && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 border-y border-border/50">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAccept(hunkIdx)}
                        className="h-5 text-[10px] px-2 py-0"
                      >
                        <Check className="w-3 h-3 mr-1" /> Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(hunkIdx)}
                        className="h-5 text-[10px] px-2 py-0"
                      >
                        <X className="w-3 h-3 mr-1" /> Reject
                      </Button>
                      <span className="text-[10px] text-muted-foreground">Hunk {hunkIdx + 1}/{hunks.length}</span>
                    </div>
                  )}
                  {hunk.lines.map((line, lineIdx) => {
                    const globalIdx = hunk.startIndex + lineIdx
                    return (
                      <div key={lineIdx}>
                        <div className={`group/flex flex ${lineClass(line.type)}`}>
                          <span className="w-10 flex-shrink-0 text-right pr-2 text-muted-foreground/40 select-none border-r border-border/30">
                            {line.oldLineNo ?? ''}
                          </span>
                          <span className="w-10 flex-shrink-0 text-right pr-2 text-muted-foreground/40 select-none border-r border-border/30">
                            {line.newLineNo ?? ''}
                          </span>
                          <span className="w-5 flex-shrink-0 text-center select-none">{gutterSign(line.type)}</span>
                          <pre className="flex-1 pl-2 whitespace-pre-wrap break-all">{line.content}</pre>
                          {onComment && (
                            <button
                              onClick={() => handleToggleComment(globalIdx)}
                              className="flex-shrink-0 w-6 flex items-center justify-center opacity-0 group-hover/flex:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                              title="Add comment"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </button>
                          )}
                          {comments.has(globalIdx) && (
                            <span className="flex-shrink-0 w-6 flex items-center justify-center text-primary">
                              <MessageSquare className="w-3 h-3 fill-current" />
                            </span>
                          )}
                        </div>
                        {commentingLine === globalIdx && (
                          <div className="flex items-center gap-2 px-12 py-1.5 bg-secondary border-b border-border/30">
                            <input
                              type="text"
                              value={commentDraft}
                              onChange={e => setCommentDraft(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSubmitComment(globalIdx, line)
                                }
                                if (e.key === 'Escape') {
                                  setCommentingLine(null)
                                  setCommentDraft('')
                                }
                              }}
                              placeholder="Comment on this line..."
                              className="flex-1 px-2 py-1 text-[11px] bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSubmitComment(globalIdx, line)}
                              disabled={!commentDraft.trim()}
                              className="p-1 rounded text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Submit comment"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {comments.has(globalIdx) && commentingLine !== globalIdx && (
                          <div className="px-12 py-1 text-[11px] text-secondary-foreground bg-secondary/50 border-b border-border/20">
                            {comments.get(globalIdx)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <div className="flex divide-x divide-border overflow-hidden">
            <div ref={splitOldRef} onScroll={handleOldScroll} className="flex-1 overflow-x-auto overflow-y-auto max-h-[400px] text-[12px] font-mono leading-[20px]">
              {diffLines.map((line, i) => (
                <div key={i} className={`flex ${line.type === 'removed' ? 'bg-destructive/10' : ''}`}>
                  <span className="w-10 flex-shrink-0 text-right pr-2 text-muted-foreground/40 select-none border-r border-border/30">
                    {line.oldLineNo ?? ''}
                  </span>
                  <span className="w-5 flex-shrink-0 text-center select-none">
                    {line.type === 'removed' ? <span className="text-destructive">-</span> : ' '}
                  </span>
                  <pre className="flex-1 pl-2 whitespace-pre-wrap break-all text-muted-foreground">
                    {line.type !== 'added' ? line.content : ''}
                  </pre>
                </div>
              ))}
            </div>
            <div ref={splitNewRef} className="flex-1 overflow-x-auto overflow-y-auto max-h-[400px] text-[12px] font-mono leading-[20px]">
              {diffLines.map((line, i) => (
                <div key={i}>
                  <div className={`group/split flex ${line.type === 'added' ? 'bg-success/10' : ''}`}>
                    <span className="w-10 flex-shrink-0 text-right pr-2 text-muted-foreground/40 select-none border-r border-border/30">
                      {line.newLineNo ?? ''}
                    </span>
                    <span className="w-5 flex-shrink-0 text-center select-none">
                      {line.type === 'added' ? <span className="text-success">+</span> : ' '}
                    </span>
                    <pre className="flex-1 pl-2 whitespace-pre-wrap break-all text-muted-foreground">
                      {line.type !== 'removed' ? line.content : ''}
                    </pre>
                    {onComment && line.type !== 'unchanged' && (
                      <button
                        onClick={() => handleToggleComment(i)}
                        className="flex-shrink-0 w-6 flex items-center justify-center opacity-0 group-hover/split:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                        title="Add comment"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </button>
                    )}
                    {comments.has(i) && (
                      <span className="flex-shrink-0 w-6 flex items-center justify-center text-primary">
                        <MessageSquare className="w-3 h-3 fill-current" />
                      </span>
                    )}
                  </div>
                  {commentingLine === i && (
                    <div className="flex items-center gap-2 px-12 py-1.5 bg-secondary border-b border-border/30">
                      <input
                        type="text"
                        value={commentDraft}
                        onChange={e => setCommentDraft(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmitComment(i, line)
                          }
                          if (e.key === 'Escape') {
                            setCommentingLine(null)
                            setCommentDraft('')
                          }
                        }}
                        placeholder="Comment on this line..."
                        className="flex-1 px-2 py-1 text-[11px] bg-background border border-border rounded text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSubmitComment(i, line)}
                        disabled={!commentDraft.trim()}
                        className="p-1 rounded text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Submit comment"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {comments.has(i) && commentingLine !== i && (
                    <div className="px-12 py-1 text-[11px] text-secondary-foreground bg-secondary/50 border-b border-border/20">
                      {comments.get(i)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
