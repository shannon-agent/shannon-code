// Chat panel component combining chat display and input
import { useAppState } from '../context/AppState'
import { ChatMessage } from './ChatMessage'
import { MessageInput } from './MessageInput'
import { StatusBar } from './StatusBar'
import { ToolCallDisplay } from './ToolCallDisplay'
import { DiffViewer } from './DiffViewer'
import { ModeToggle } from './ModeToggle'

interface ChatPanelProps {
  sendMessage: (text: string) => Promise<void>
  isStreaming: boolean
  error: string | null
  clearError: () => void
}

export function ChatPanel({ sendMessage, isStreaming, error, clearError }: ChatPanelProps) {
  const { messages, loading, streamingText, activeToolCalls, permissionRequest, respondPermission, mode, setMode } = useAppState()

  // Check if a message contains a file edit diff that should be rendered visually
  const renderMessageContent = (message: { role: string; content: string; timestamp: number }, index: number) => {
    const content = message.content
    // Detect diff patterns: ```diff blocks or tool results with old_path/new_path
    const diffMatch = content.match(/```diff\n([\s\S]*?)```/)
    if (diffMatch) {
      const diffContent = diffMatch[1]
      // Parse unified diff to extract file name and old/new content
      const fileMatch = diffContent.match(/^---\s+a\/(.+?)\n\+\+\+\s+b\/(.+?)\n/)
      const fileName = fileMatch ? fileMatch[2] : undefined
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
      <div className="flex items-center justify-center h-full bg-bg-primary text-text-secondary">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading Shannon Desktop...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Error display */}
      {error && (
        <div className="bg-error/10 border-l-4 border-error text-error p-3 flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button
            onClick={clearError}
            className="text-error hover:text-error/80 text-sm px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Permission request dialog */}
      {permissionRequest && (
        <div className="bg-[#e0af68]/10 border-l-4 border-[#e0af68] p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#e0af68]">
                Permission Request: {permissionRequest.tool}
              </p>
              <p className="text-xs text-[#a9b1d6] mt-1">
                Risk: {permissionRequest.risk}
              </p>
              <pre className="text-xs text-[#565f89] mt-1 max-h-24 overflow-auto">
                {JSON.stringify(permissionRequest.input, null, 2)}
              </pre>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => respondPermission(true)}
                className="px-3 py-1.5 text-sm bg-[#9ece6a]/20 text-[#9ece6a] rounded hover:bg-[#9ece6a]/30"
              >
                Allow
              </button>
              <button
                onClick={() => respondPermission(false)}
                className="px-3 py-1.5 text-sm bg-[#f7768e]/20 text-[#f7768e] rounded hover:bg-[#f7768e]/30"
              >
                Deny
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !streamingText && activeToolCalls.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-accent mb-2">Shannon Code</h2>
              <p className="text-sm">Your AI coding assistant</p>
              <p className="text-xs mt-4 text-text-muted">
                Type a message to get started, or use shortcuts:
              </p>
              <div className="mt-2 text-xs text-text-muted">
                <kbd className="bg-bg-secondary px-2 py-1 rounded">Ctrl+K</kbd> Focus input •
                <kbd className="bg-bg-secondary px-2 py-1 rounded ml-2">Ctrl+N</kbd> New session
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {messages.map((message, index) => (
              renderMessageContent(message, index)
            ))}

            {/* Active tool calls during streaming */}
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

            {/* Streaming text */}
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
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Mode toggle + Input area */}
      <div className="border-t border-[var(--border)]">
        <div className="flex items-center justify-between px-4 pt-2">
          <ModeToggle mode={mode} onChange={setMode} disabled={isStreaming} />
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
