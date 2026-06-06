// Diff review panel for reviewing file changes with accept/reject functionality
import { useState, useCallback, useEffect } from 'react'
import { X, Check, X as XIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { DiffViewer } from './DiffViewer'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { cn } from '../lib/utils'
import type { DiffFileInfo, HunkAction } from '../types/tauri-events'

interface DiffReviewPanelProps {
  files: DiffFileInfo[]
  onClose: () => void
  onApplyDiff: (filePath: string, hunks: HunkAction[]) => void
}

export function DiffReviewPanel({ files, onClose, onApplyDiff }: DiffReviewPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [acceptedHunks, setAcceptedHunks] = useState<Map<string, Set<number>>>(new Map())
  const [rejectedHunks, setRejectedHunks] = useState<Map<string, Set<number>>>(new Map())

  const selectedFile = files[selectedIndex]
  const fileKey = selectedFile?.path || ''

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'a':
          if (selectedFile) {
            const fileHunks = selectedFile.hunks.map((_, i) => i)
            handleAcceptAllHunks(fileHunks)
          }
          break
        case 'r':
          if (selectedFile) {
            const fileHunks = selectedFile.hunks.map((_, i) => i)
            handleRejectAllHunks(fileHunks)
          }
          break
        case 'n':
          setSelectedIndex(prev => Math.min(prev + 1, files.length - 1))
          break
        case 'p':
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedFile, files.length, onClose])

  const handleAcceptHunk = useCallback((hunkIndex: number) => {
    setAcceptedHunks(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(fileKey) || new Set()
      current.add(hunkIndex)
      newMap.set(fileKey, current)
      return newMap
    })
  }, [fileKey])

  const handleRejectHunk = useCallback((hunkIndex: number) => {
    setRejectedHunks(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(fileKey) || new Set()
      current.add(hunkIndex)
      newMap.set(fileKey, current)
      return newMap
    })
  }, [fileKey])

  const handleAcceptAllHunks = useCallback((hunkIndices?: number[]) => {
    if (!selectedFile) return
    const indices = hunkIndices || selectedFile.hunks.map((_, i) => i)
    setAcceptedHunks(prev => {
      const newMap = new Map(prev)
      const current = new Set<number>(newMap.get(fileKey) || new Set<number>())
      indices.forEach(i => current.add(i))
      newMap.set(fileKey, current)
      return newMap
    })
  }, [fileKey, selectedFile])

  const handleRejectAllHunks = useCallback((hunkIndices?: number[]) => {
    if (!selectedFile) return
    const indices = hunkIndices || selectedFile.hunks.map((_, i) => i)
    setRejectedHunks(prev => {
      const newMap = new Map(prev)
      const current = new Set<number>(newMap.get(fileKey) || new Set<number>())
      indices.forEach(i => current.add(i))
      newMap.set(fileKey, current)
      return newMap
    })
  }, [fileKey, selectedFile])

  const handleApplyAll = useCallback(() => {
    files.forEach(file => {
      const fileAcceptedHunks = acceptedHunks.get(file.path) || new Set<number>()
      const fileRejectedHunks = rejectedHunks.get(file.path) || new Set<number>()

      const actions: HunkAction[] = []

      fileAcceptedHunks.forEach(hunkIdx => {
        const hunk = file.hunks[hunkIdx]
        if (hunk) {
          actions.push({
            line_start: hunk.oldStart,
            line_end: hunk.oldStart + hunk.oldLines,
            action: 'accept'
          })
        }
      })

      fileRejectedHunks.forEach(hunkIdx => {
        const hunk = file.hunks[hunkIdx]
        if (hunk) {
          actions.push({
            line_start: hunk.oldStart,
            line_end: hunk.oldStart + hunk.oldLines,
            action: 'reject'
          })
        }
      })

      if (actions.length > 0) {
        onApplyDiff(file.path, actions)
      }
    })

    onClose()
  }, [files, acceptedHunks, rejectedHunks, onApplyDiff, onClose])

  const getStatusBadge = (status: DiffFileInfo['status']) => {
    switch (status) {
      case 'modified': return <Badge variant="warning">M</Badge>
      case 'added': return <Badge variant="success">A</Badge>
      case 'deleted': return <Badge variant="error">D</Badge>
    }
  }

  const getFileStats = () => {
    const modified = files.filter(f => f.status === 'modified').length
    const added = files.filter(f => f.status === 'added').length
    const deleted = files.filter(f => f.status === 'deleted').length
    return { modified, added, deleted }
  }

  const stats = getFileStats()

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Diff Review</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)]">{files.length} files</span>
            {stats.modified > 0 && <Badge variant="warning">M: {stats.modified}</Badge>}
            {stats.added > 0 && <Badge variant="success">A: {stats.added}</Badge>}
            {stats.deleted > 0 && <Badge variant="error">D: {stats.deleted}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={handleApplyAll}
            className="h-7 text-xs"
          >
            <Check className="w-3 h-3 mr-1" /> Accept All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="px-4 py-2 bg-[var(--bg-primary)] border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
        <span className="font-medium">Shortcuts:</span>
        <kbd className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded ml-2">A</kbd>
        <span className="ml-1">Accept hunk</span>
        <kbd className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded ml-3">R</kbd>
        <span className="ml-1">Reject hunk</span>
        <kbd className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded ml-3">N</kbd>
        <span className="ml-1">Next file</span>
        <kbd className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded ml-3">P</kbd>
        <span className="ml-1">Prev file</span>
        <kbd className="bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded ml-3">Esc</kbd>
        <span className="ml-1">Close</span>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File list sidebar */}
        <div className="w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)]">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {files.map((file, index) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md transition-colors',
                    'flex items-center justify-between gap-2',
                    selectedIndex === index
                      ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                      : 'hover:bg-[var(--bg-primary)] text-[var(--text-secondary)]'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusBadge(file.status)}
                    <span className="text-sm truncate" title={file.path}>
                      {file.path.split('/').pop()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    {file.hunks.length > 0 && (
                      <span>{file.hunks.length} {file.hunks.length === 1 ? 'hunk' : 'hunks'}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Diff viewer */}
        <div className="flex-1 overflow-hidden">
          {selectedFile ? (
            <div className="h-full overflow-y-auto">
              {/* File header with navigation */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-[var(--bg-primary)] border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                    disabled={selectedIndex === 0}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-[var(--text-muted)]">
                    {selectedIndex + 1} / {files.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIndex(Math.min(files.length - 1, selectedIndex + 1))}
                    disabled={selectedIndex === files.length - 1}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-md">
                    {selectedFile.path}
                  </span>
                  {getStatusBadge(selectedFile.status)}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAcceptAllHunks()}
                    className="h-7 text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" /> Accept File
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRejectAllHunks()}
                    className="h-7 text-xs"
                  >
                    <XIcon className="w-3 h-3 mr-1" /> Reject File
                  </Button>
                </div>
              </div>

              {/* Diff content */}
              <div className="p-4">
                <DiffViewer
                  oldContent={selectedFile.status === 'added' ? '' : '// Original content'}
                  newContent={selectedFile.hunks.map(h => h.content).join('\n')}
                  fileName={selectedFile.path.split('/').pop()}
                  onAcceptHunk={(hunkIdx) => handleAcceptHunk(hunkIdx)}
                  onRejectHunk={(hunkIdx) => handleRejectHunk(hunkIdx)}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
              <p>No file selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
