// Chat panel component combining chat display and input
import { useAppState } from '../context/AppState'
import { ChatMessage } from './ChatMessage'
import { MessageInput } from './MessageInput'
import { StatusBar } from './StatusBar'
import { ToolCallDisplay } from './ToolCallDisplay'
import { DiffViewer } from './DiffViewer'
import { DiffReviewPanel } from './DiffReviewPanel'
import { ModeToggle } from './ModeToggle'
import { Eye, EyeOff, AlignJustify, Sparkles, Bug, Wand2, FlaskConical } from 'lucide-react'
import { ApprovalModeSelector } from './ApprovalModeSelector'
import { PermissionDialog } from './PermissionDialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Kbd } from './ui/kbd'
import { Spinner } from './ui/spinner'
import { listen } from '@tauri-apps/api/event'
import { useState, useCallback, useEffect } from 'react'
import type { DiffFileInfo, HunkAction } from '../types/tauri-events'
import { applyDiff } from '../lib/tauri-api'

interface ChatPanelProps {
  sendMessage: (text: string, filePaths?: string[]) => Promise<void>
  isStreaming: boolean
  error: string | null
  clearError: () => void
}

export function ChatPanel({ sendMessage, isStreaming, error, clearError }: ChatPanelProps) {
  const { messages, loading, streamingText, activeToolCalls, permissionRequest, mode, setMode, approvalMode, setApprovalMode, viewMode, setViewMode } = useAppState()
  const [diffReviewAvailable, setDiffReviewAvailable] = useState(false)
  const [diffFiles, setDiffFiles] = useState<DiffFileInfo[]>([])
  const [showDiffReview, setShowDiffReview] = useState(false)

  // Listen for diff review events
  useEffect(() => {
    const unlisten = listen<DiffFileInfo[]>('diff-review-available', (event) => {
      setDiffFiles(event.payload)
      setDiffReviewAvailable(true)
    })

    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  const handleApplyDiff = useCallback(async (filePath: string, hunks: HunkAction[]) => {
    try {
      await applyDiff(filePath, hunks)
    } catch (error) {
      console.error('Failed to apply diff:', error)
    }
  }, [])

  const handleOpenDiffReview = useCallback(() => {
    setShowDiffReview(true)
  }, [])

  const handleCloseDiffReview = useCallback(() => {
    setShowDiffReview(false)
    setDiffReviewAvailable(false)
    setDiffFiles([])
  }, [])

  const renderMessageContent = (message: { role: string; content: string; timestamp: number }, index: number) => {
    const content = message.content
    const diffMatch = content.match(/```diff\n([\s\S]*?)```/)
    if (diffMatch) {
      const diffContent = diffMatch[1]
      const fileMatch = diffContent.match(/^---\s+a\/(.+?)\n\+\+\+\s+b\/(.+?)\n/)
      const rawName = fileMatch ? fileMatch[2] : undefined
      // Sanitize: reject path traversal, show only basename
      const fileName = rawName && !rawName.includes('..') && !rawName.includes('\0')
        ? rawName.split('/').pop()
        : undefined
      const lines = diffContent.split('\n')
      const oldLines: string[] = []
      const newLines: string[] = []
      for (const line of lines) {
        if (line.startsWith('-') && !line.startsWith('---')) oldLines.push(line.slice(1))
        else if (line.startsWith('+') && !line.startsWith('+++')) newLines.push(line.slice(1))
        else if (line.startsWith('@@')) continue
        else { oldLines.push(line); newLines.push(line) }
      }
      return (
        <div key={index}>
          <ChatMessage message={message} />
          <div className="px-4">
            <DiffViewer
              oldContent={oldLines.join('\n')}
              newContent={newLines.join('\n')}
              fileName={fileName}
            />
          </div>
        </div>
      )
    }
    return <ChatMessage key={index} message={message} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background text-secondary-foreground">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p>Loading Shannon Desktop...</p>
        </div>
      </div>
    )
  }

  // Show diff review panel when active
  if (showDiffReview) {
    return (
      <DiffReviewPanel
        files={diffFiles}
        onClose={handleCloseDiffReview}
        onApplyDiff={handleApplyDiff}
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {error && (
        <div className="bg-destructive/10 border-l-4 border-destructive p-3 flex items-center justify-between">
          <span className="text-sm text-destructive">{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7">
            Dismiss
          </Button>
        </div>
      )}

      {/* Permission Dialog */}
      <PermissionDialog request={permissionRequest} />

      {/* Review Changes button */}
      {diffReviewAvailable && (
        <div className="bg-primary/10 border-l-4 border-ring p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary">File changes ready for review</span>
              <Badge variant="secondary">{diffFiles.length} files</Badge>
            </div>
            <Button variant="default" size="sm" onClick={handleOpenDiffReview} className="h-7">
              Review Changes
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 && !streamingText && activeToolCalls.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md px-8 py-12 animate-fade-in">
              {/* App Icon/Name */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-primary to-purple bg-clip-text text-transparent">Shannon</span>
                </h1>
                <p className="text-muted-foreground">Ask me anything about your code</p>
              </div>

              {/* Suggestion Chips */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={() => sendMessage('Explain this codebase to me')}
                  className="h-auto py-3 px-4 flex flex-col items-center gap-2 text-left rounded-xl bg-glass-bg border border-glass-border hover:border-ring/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs">Explain this codebase</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendMessage('Find bugs in my code')}
                  className="h-auto py-3 px-4 flex flex-col items-center gap-2 text-left rounded-xl bg-glass-bg border border-glass-border hover:border-ring/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                >
                  <Bug className="w-5 h-5" />
                  <span className="text-xs">Find bugs</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendMessage('Help me refactor this code')}
                  className="h-auto py-3 px-4 flex flex-col items-center gap-2 text-left rounded-xl bg-glass-bg border border-glass-border hover:border-ring/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                >
                  <Wand2 className="w-5 h-5" />
                  <span className="text-xs">Refactor</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendMessage('Write tests for this code')}
                  className="h-auto py-3 px-4 flex flex-col items-center gap-2 text-left rounded-xl bg-glass-bg border border-glass-border hover:border-ring/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                >
                  <FlaskConical className="w-5 h-5" />
                  <span className="text-xs">Write tests</span>
                </Button>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="mt-8 pt-6 border-t border-glass-border">
                <p className="text-xs text-muted-foreground mb-2">Keyboard shortcuts</p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Kbd>Ctrl+K</Kbd>
                    <span>Focus input</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Kbd>Ctrl+N</Kbd>
                    <span>New session</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              renderMessageContent(message, index)
            ))}

            {activeToolCalls.map(tc => (
              <ToolCallDisplay
                key={tc.toolUseId}
                toolName={tc.toolName}
                toolInput={tc.toolInput as Record<string, unknown>}
                isRunning={tc.isRunning}
                output={tc.result}
                isError={tc.isError}
                viewMode={viewMode}
              />
            ))}

            {streamingText && (
              <ChatMessage
                message={{
                  role: 'assistant',
                  content: streamingText,
                  timestamp: Date.now()
                }}
              />
            )}
          </div>
        )}
      </ScrollArea>

      <StatusBar />

      <div className="border-t border-border">
        <div className="flex items-center justify-between px-4 pt-2">
          <div className="flex items-center gap-4">
            <ModeToggle mode={mode} onChange={setMode} disabled={isStreaming} />

            {/* Approval Mode Selector */}
            <ApprovalModeSelector
              mode={approvalMode}
              onChange={setApprovalMode}
              disabled={isStreaming}
            />

            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'verbose' ? 'normal' : viewMode === 'normal' ? 'summary' : 'verbose')}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-border bg-secondary hover:bg-tertiary transition-colors"
              title="View mode (Ctrl+O)"
              aria-label={`View mode: ${viewMode}. Click to cycle.`}
            >
              {viewMode === 'verbose' && <Eye className="w-3 h-3" />}
              {viewMode === 'normal' && <AlignJustify className="w-3 h-3" />}
              {viewMode === 'summary' && <EyeOff className="w-3 h-3" />}
              <span className="capitalize">{viewMode}</span>
            </button>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {mode === 'plan' ? 'Read-only · no tool execution' : 'Full access · tools enabled'}
          </span>
        </div>
        <MessageInput
          onSend={sendMessage}
          disabled={isStreaming}
          placeholder={isStreaming ? 'Shannon is thinking...' : 'Ask Shannon anything...'}
        />
      </div>
    </div>
  )
}
