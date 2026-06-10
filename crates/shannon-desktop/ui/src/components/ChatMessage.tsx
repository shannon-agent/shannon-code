// Chat message with MD3 styling, glass cards, and thought connectors
import { memo, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check, Paperclip } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '../types/tauri-events'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import 'highlight.js/styles/github-dark.css'

interface ChatMessageProps {
  message: ChatMessageType
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const ChatMessage = memo(function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isTool = message.role === 'tool'
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null)
  const [thinkingExpanded, setThinkingExpanded] = useState(false)

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

  // Extract thinking content if present
  const thinkingMatch = !isUser ? message.content.match(/<thinking>([\s\S]*?)<\/thinking>/) : null
  const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null
  const mainContent = thinkingMatch
    ? message.content.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim()
    : message.content

  // Get file attachments for user messages
  const attachments = isUser && message.file_attachments ? message.file_attachments : []

  return (
    <div className={cn(
      'group flex gap-md3-md px-md3-lg py-md3-md',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* Avatar */}
      <div
        className={cn(
          'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[14px]',
          isUser
            ? 'bg-md3-primary text-md3-on-primary order-last'
            : 'bg-md3-secondary-container text-md3-on-secondary-container'
        )}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isUser ? 'person' : 'auto_awesome'}
        </span>
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 min-w-0', isUser ? 'max-w-[85%]' : 'max-w-[90%]')}>
        {/* Header row */}
        <div className={cn(
          'flex items-center gap-md3-sm mb-md3-xs',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span className={cn(
            'text-label-sm font-medium',
            isUser ? 'text-md3-primary' : 'text-md3-secondary'
          )}>
            {isUser ? 'You' : 'Shannon'}
          </span>
          <span
            className="text-label-sm text-md3-on-surface-variant opacity-0 group-hover:opacity-60 transition-opacity"
            title={fullDate}
          >
            {timestamp}
          </span>
        </div>

        {/* Bubble */}
        <div className={cn(
          'rounded-2xl shadow-sm',
          isUser
            ? 'bg-md3-primary text-md3-on-primary rounded-tr-sm'
            : isTool
              ? 'bg-md3-surface-container-high text-md3-on-surface border border-md3-outline-variant/10'
              : 'glass-card text-md3-on-surface'
        )}>
          <div className="p-md3-md">
            {isUser ? (
              <>
                {/* File Attachments */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-md3-xs mb-md3-sm">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-md3-sm px-md3-md py-md3-sm bg-white/10 rounded-lg"
                      >
                        <Paperclip className="w-3.5 h-3.5 opacity-70" />
                        <span className="text-body-sm">{attachment.name}</span>
                        <span className="text-label-sm opacity-60">{formatFileSize(attachment.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-body-md leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </>
            ) : (
              <>
                {/* Thinking block with connector */}
                {thinkingContent && (
                  <div className="mb-md3-md thought-connector">
                    <button
                      onClick={() => setThinkingExpanded(!thinkingExpanded)}
                      className="w-full flex items-center gap-md3-sm px-md3-md py-md3-sm text-left hover:bg-md3-surface-container/50 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-md3-on-surface-variant">
                        {thinkingExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                      <span className="text-label-sm italic text-md3-on-surface-variant">Thinking...</span>
                    </button>
                    {thinkingExpanded && (
                      <div className="px-md3-md pb-md3-md pt-0">
                        <div className="relative group/thinking">
                          <pre className="text-body-sm text-md3-on-surface-variant whitespace-pre-wrap font-mono bg-transparent p-0">
                            {thinkingContent}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(thinkingContent, 'thinking')}
                            className="absolute top-0 right-0 h-5 gap-1 text-[10px] text-md3-on-surface-variant hover:text-md3-on-surface px-1.5 opacity-0 group-hover/thinking:opacity-100 transition-opacity"
                          >
                            {copiedBlock === 'thinking' ? (
                              <><Check className="w-3 h-3" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none
                  prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2
                  prose-pre:my-2 prose-pre:bg-md3-surface-container prose-pre:rounded-xl prose-pre:border prose-pre:border-md3-outline-variant/10
                  prose-code:text-md3-primary prose-code:before:content-none prose-code:after:content-none
                  prose-a:text-md3-primary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-md3-outline-variant/30 prose-blockquote:text-md3-on-surface-variant
                  prose-strong:text-md3-on-surface">
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
                              <div className="flex items-center justify-between px-md3-md py-md3-sm bg-md3-surface-container-high rounded-t-xl border border-b-0 border-md3-outline-variant/10">
                                <span className="text-label-sm text-md3-on-surface-variant font-medium">{match[1]}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(codeText, blockId)}
                                  className="h-5 gap-1 text-[10px] text-md3-on-surface-variant hover:text-md3-on-surface px-1.5"
                                >
                                  {copiedBlock === blockId ? (
                                    <><Check className="w-3 h-3" /> Copied</>
                                  ) : (
                                    <><Copy className="w-3 h-3" /> Copy</>
                                  )}
                                </Button>
                              </div>
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </div>
                          )
                        }
                        return <code className={`${className || ''} px-1.5 py-0.5 rounded-md bg-md3-surface-container text-md3-primary`} {...props}>{children}</code>
                      }
                    }}
                  >
                    {mainContent}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>

          {/* Message reactions — agent messages only */}
          {!isUser && !isTool && (
            <div className="flex gap-xs mt-sm">
              <button className="flex items-center gap-xs px-sm py-xs rounded-lg hover:bg-md3-surface-container text-md3-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[18px]">thumb_up</span>
              </button>
              <button
                onClick={() => handleCopy(mainContent, 'message')}
                className="flex items-center gap-xs px-sm py-xs rounded-lg hover:bg-md3-surface-container text-md3-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">{copiedBlock === 'message' ? 'check' : 'content_copy'}</span>
              </button>
              <button className="flex items-center gap-xs px-sm py-xs rounded-lg hover:bg-md3-surface-container text-md3-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
