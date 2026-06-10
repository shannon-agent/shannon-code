// Chat panel with MD3 styling, glass welcome page, and refined mode bar
import { useAppState } from '../context/AppState'
import { ChatMessage } from './ChatMessage'
import { MessageInput } from './MessageInput'
import { StatusBar } from './StatusBar'
import { ToolCallDisplay } from './ToolCallDisplay'
import { DiffViewer } from './DiffViewer'
import { DiffReviewPanel } from './DiffReviewPanel'
import { ModeToggle } from './ModeToggle'
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
      <div className="flex items-center justify-center h-full bg-md3-surface text-md3-on-surface">
        <div className="text-center space-y-md3-md">
          <Spinner className="h-8 w-8 mx-auto" />
          <p className="text-body-md text-md3-on-surface-variant">Loading Shannon Desktop...</p>
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
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-md3-surface">
      <div className="flex flex-col flex-1 min-w-0">
      {error && (
        <div className="bg-md3-error/10 border-l-4 border-md3-error p-md3-md flex items-center justify-between">
          <span className="text-body-sm text-md3-error">{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError} className="text-md3-error hover:text-md3-error hover:bg-md3-error/10 h-7">
            Dismiss
          </Button>
        </div>
      )}

      {/* Permission Dialog */}
      <PermissionDialog request={permissionRequest} />

      {/* Review Changes button */}
      {diffReviewAvailable && (
        <div className="bg-md3-primary/10 border-l-4 border-md3-primary p-md3-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md3-md">
              <span className="text-body-sm font-medium text-md3-primary">File changes ready for review</span>
              <Badge variant="secondary">{diffFiles.length} files</Badge>
            </div>
            <Button variant="default" size="sm" onClick={handleOpenDiffReview} className="h-7">
              Review Changes
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-md3-lg py-md3-lg">
        {messages.length === 0 && !streamingText && activeToolCalls.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md px-8 py-12 animate-in">
              {/* Logo */}
              <div className="mb-10">
                <div className="w-16 h-16 rounded-3xl bg-md3-primary/10 flex items-center justify-center mx-auto mb-md3-lg shadow-lg shadow-md3-primary/10">
                  <span className="material-symbols-outlined text-[32px] text-md3-primary">auto_awesome</span>
                </div>
                <h1 className="text-display-lg font-bold mb-2">
                  <span className="bg-gradient-to-r from-md3-primary to-md3-tertiary bg-clip-text text-transparent">Shannon</span>
                </h1>
                <p className="text-body-md text-md3-on-surface-variant">Ask me anything about your code</p>
              </div>

              {/* Suggestion chips */}
              <div className="grid grid-cols-2 gap-md3-md mt-8">
                <Button
                  variant="outline"
                  onClick={() => sendMessage('Explain this codebase to me')}
                  className="h-auto py-md3-lg px-md3-md flex flex-col items-center gap-md3-sm text-left rounded-2xl glass-card hover:border-md3-primary/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[20px] text-md3-primary">psychology</span>
                  <span className="text-label-sm">Explain this codebase</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendMessage('Find bugs in my code')}
                  className="h-auto py-md3-lg px-md3-md flex flex-col items-center gap-md3-sm text-left rounded-2xl glass-card hover:border-md3-primary/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[20px] text-md3-primary">bug_report</span>
                  <span className="text-label-sm">Find bugs</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendMessage('Help me refactor this code')}
                  className="h-auto py-md3-lg px-md3-md flex flex-col items-center gap-md3-sm text-left rounded-2xl glass-card hover:border-md3-primary/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[20px] text-md3-primary">auto_fix_high</span>
                  <span className="text-label-sm">Refactor</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => sendMessage('Write tests for this code')}
                  className="h-auto py-md3-lg px-md3-md flex flex-col items-center gap-md3-sm text-left rounded-2xl glass-card hover:border-md3-primary/25 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[20px] text-md3-primary">science</span>
                  <span className="text-label-sm">Write tests</span>
                </Button>
              </div>

              {/* AI Thought Steps Preview */}
              <div className="mt-10 bg-md3-surface-container-lowest p-md3-md rounded-xl border border-md3-outline-variant/10 text-left">
                <p className="text-label-sm text-md3-on-surface-variant/60 uppercase tracking-wider mb-md3-md">How Shannon thinks</p>
                <div className="space-y-md3-md">
                  {[
                    { label: 'Knowledge Retrieval', text: 'Aggregating project context, dependencies, and recent changes.' },
                    { label: 'Pattern Synthesis', text: 'Identifying correlations between code patterns and potential issues.' },
                    { label: 'Drafting Response', text: 'Compiling actionable insights with code suggestions.' },
                  ].map((step, i) => (
                    <div key={step.label} className="relative pl-6">
                      <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-md3-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-md3-primary" />
                      </div>
                      {i < 2 && <div className="absolute left-[7px] top-5 bottom-[-12px] w-px bg-md3-outline-variant/30" />}
                      <span className="text-label-sm text-md3-on-surface-variant block uppercase opacity-70">{step.label}</span>
                      <p className="text-body-sm text-md3-on-surface-variant">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keyboard shortcuts */}
              <div className="mt-10 pt-6 border-t border-md3-outline-variant/10">
                <p className="text-label-sm text-md3-on-surface-variant/60 mb-md3-sm">Keyboard shortcuts</p>
                <div className="flex items-center justify-center gap-md3-lg text-label-sm text-md3-on-surface-variant/60">
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
          <div className="space-y-md3-md">
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

      {/* Mode bar */}
      <div className="border-t border-md3-outline-variant/10">
        <div className="flex items-center justify-between px-md3-lg py-md3-sm">
          <div className="flex items-center gap-md3-md">
            <ModeToggle mode={mode} onChange={setMode} disabled={isStreaming} />
            <ApprovalModeSelector
              mode={approvalMode}
              onChange={setApprovalMode}
              disabled={isStreaming}
            />
            <button
              onClick={() => setViewMode(viewMode === 'verbose' ? 'normal' : viewMode === 'normal' ? 'summary' : 'verbose')}
              className="flex items-center gap-md3-xs px-md3-md py-md3-sm text-label-sm rounded-xl border border-md3-outline-variant/10 bg-md3-surface-container hover:bg-md3-surface-container-high transition-colors"
              title="View mode (Ctrl+O)"
              aria-label={`View mode: ${viewMode}. Click to cycle.`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {viewMode === 'verbose' ? 'visibility' : viewMode === 'normal' ? 'view_agenda' : 'visibility_off'}
              </span>
              <span className="capitalize">{viewMode}</span>
            </button>
          </div>
          <span className="text-label-sm text-md3-on-surface-variant/60">
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
    </div>
  )
}
