// Chat message component with markdown rendering, syntax highlighting, and professional layout
import { memo, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '../types/tauri-events'
import 'highlight.js/styles/github-dark.css'

interface ChatMessageProps {
  message: ChatMessageType
}

export const ChatMessage = memo(function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null)

  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  const fullDate = new Date(message.timestamp).toLocaleString()

  const handleCopy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedBlock(id)
    setTimeout(() => setCopiedBlock(null), 2000)
  }, [])

  return (
    <div className={`group flex gap-3 px-4 py-3 transition-colors duration-150 ${
      isUser
        ? 'bg-[var(--user-bg)]'
        : 'bg-transparent hover:bg-[var(--bg-secondary)]/30'
    }`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tracking-wide ${
          isUser
            ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
            : 'bg-[var(--success)]/20 text-[var(--success)]'
        }`}
      >
        {isUser ? 'You' : 'S'}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-sm font-medium ${isUser ? 'text-[var(--accent)]' : 'text-[var(--success)]'}`}>
            {isUser ? 'You' : 'Shannon'}
          </span>
          <span
            className="text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            title={fullDate}
          >
            {timestamp}
          </span>
        </div>

        {isUser ? (
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none
            prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2
            prose-pre:my-2 prose-pre:bg-[var(--bg-input)] prose-pre:rounded-lg prose-pre:border prose-pre:border-[var(--border)]
            prose-code:text-[var(--accent)] prose-code:before:content-none prose-code:after:content-none
            prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-[var(--accent)]/30 prose-blockquote:text-[var(--text-muted)]
            prose-strong:text-[var(--text-primary)]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeText = String(children).replace(/\n$/, '')
                  const blockId = `code-${codeText.slice(0, 20)}`

                  if (match) {
                    return (
                      <div className="relative group/code">
                        <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--bg-secondary)] rounded-t-lg border border-b-0 border-[var(--border)]">
                          <span className="text-xs text-[var(--text-muted)] font-medium">{match[1]}</span>
                          <button
                            onClick={() => handleCopy(codeText, blockId)}
                            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                          >
                            {copiedBlock === blockId ? (
                              <><Check className="w-3 h-3" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    )
                  }
                  return <code className={`${className || ''} px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--accent)]`} {...props}>{children}</code>
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
})
