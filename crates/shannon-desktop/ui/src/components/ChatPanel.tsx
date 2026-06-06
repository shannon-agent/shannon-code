// Chat panel component combining chat display and input
import { useAppState } from '../context/AppState'
import { ChatMessage } from './ChatMessage'
import { MessageInput } from './MessageInput'
import { StatusBar } from './StatusBar'

interface ChatPanelProps {
  sendMessage: (text: string) => Promise<void>
  isStreaming: boolean
  error: string | null
  clearError: () => void
}

export function ChatPanel({ sendMessage, isStreaming, error, clearError }: ChatPanelProps) {
  const { messages, loading } = useAppState()

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

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
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
              <ChatMessage key={index} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Input area */}
      <MessageInput
        onSend={sendMessage}
        disabled={isStreaming}
        placeholder={isStreaming ? 'Shannon is thinking...' : 'Ask Shannon anything...'}
      />
    </div>
  )
}
