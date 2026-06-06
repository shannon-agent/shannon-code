// Chat panel component combining chat display and input
import { useAppState } from '../context/AppState'
import { ChatMessage } from './ChatMessage'
import { MessageInput } from './MessageInput'
import { StatusBar } from './StatusBar'
import { ToolCallDisplay } from './ToolCallDisplay'
import { DiffViewer } from './DiffViewer'
import { DiffReviewPanel } from './DiffReviewPanel'
import { ModeToggle } from './ModeToggle'
import { Button } from './ui/button'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
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
  const { messages, loading, streamingText, activeToolCalls, permissionRequest, respondPermission, mode, setMode, approvalMode, setApprovalMode } = useAppState()
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
      <div className="flex items-center justify-center h-full bg-[var(--bg-primary)] text-[var(--text-secondary)]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4" />
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
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {error && (
        <div className="bg-[var(--error)]/10 border-l-4 border-[var(--error)] p-3 flex items-center justify-between">
          <span className="text-sm text-[var(--error)]">{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError} className="text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 h-7">
            Dismiss
          </Button>
        </div>
      )}

      {permissionRequest && (
        <div className="bg-[var(--warning)]/10 border-l-4 border-[var(--warning)] p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--warning)]">
                  Permission Request: {permissionRequest.tool}
                </p>
                <Badge variant="warning">{permissionRequest.risk}</Badge>
              </div>
              <pre className="text-xs text-[var(--text-muted)] mt-1 max-h-24 overflow-auto">
                {JSON.stringify(permissionRequest.input, null, 2)}
              </pre>
            </div>
            <div className="flex gap-2 ml-4">
              <Button variant="success" size="sm" onClick={() => respondPermission(true)}>
                Allow
              </Button>
              <Button variant="destructive" size="sm" onClick={() => respondPermission(false)}>
                Deny
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Changes button */}
      {diffReviewAvailable && (
        <div className="bg-[var(--accent)]/10 border-l-4 border-[var(--accent)] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[var(--accent)]">File changes ready for review</span>
              <Badge variant="secondary">{diffFiles.length} files</Badge>
            </div>
            <Button variant="default" size="sm" onClick={handleOpenDiffReview} className="h-7">
              Review Changes
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {messages.length === 0 && !streamingText && activeToolCalls.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[var(--accent)] mb-2">Shannon Code</h2>
              <p className="text-sm">Your AI coding assistant</p>
              <p className="text-xs mt-4 text-[var(--text-muted)]">
                Type a message to get started, or use shortcuts:
              </p>
              <div className="mt-2 text-xs text-[var(--text-muted)]">
                <kbd className="bg-[var(--bg-secondary)] px-2 py-1 rounded">Ctrl+K</kbd> Focus input •
                <kbd className="bg-[var(--bg-secondary)] px-2 py-1 rounded ml-2">Ctrl+N</kbd> New session
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
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

      <div className="border-t border-[var(--border)]">
        <div className="flex items-center justify-between px-4 pt-2">
          <div className="flex items-center gap-4">
            <ModeToggle mode={mode} onChange={setMode} disabled={isStreaming} />
            
            {/* Approval Mode Selector */}
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setApprovalMode('always')}
                  className={`px-2 py-1 text-[10px] rounded transition-colors ${
                    approvalMode === 'always'
                      ? 'bg-[var(--success)] text-[#1a1b26]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                  }`}
                  disabled={isStreaming}
                >
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Always
                </button>
                <button
                  onClick={() => setApprovalMode('confirm')}
                  className={`px-2 py-1 text-[10px] rounded transition-colors ${
                    approvalMode === 'confirm'
                      ? 'bg-[var(--warning)] text-[#1a1b26]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                  }`}
                  disabled={isStreaming}
                >
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Confirm
                </button>
                <button
                  onClick={() => setApprovalMode('never')}
                  className={`px-2 py-1 text-[10px] rounded transition-colors ${
                    approvalMode === 'never'
                      ? 'bg-[var(--error)] text-white'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                  }`}
                  disabled={isStreaming}
                >
                  Never
                </button>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
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
