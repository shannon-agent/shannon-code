// Chat message component with markdown rendering, syntax highlighting, file attachments, and professional layout
import { memo, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check, ChevronDown, ChevronRight, Paperclip } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '../types/tauri-events'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
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

  // Role-based card background
  const cardBg = isUser
    ? 'bg-primary/8 border-primary/15'
    : isTool
      ? 'bg-secondary border-border'
      : 'bg-secondary/60 border-border'

  return (
    <div className={cn(
      'group flex gap-3 px-4 py-3 transition-colors duration-150',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tracking-wide',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-success/20 text-success'
        )}
      >
        {isUser ? 'You' : 'S'}
      </div>

      {/* Message Content */}
      <div className={cn('flex-1 min-w-0', isUser ? 'max-w-[85%]' : 'max-w-[90%]')}>
        <Card className={cn('rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.12)]', cardBg)}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn('text-sm font-medium', isUser ? 'text-primary' : 'text-success')}>
                {isUser ? 'You' : 'Shannon'}
              </span>
              <span
                className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                title={fullDate}
              >
                {timestamp}
              </span>
            </div>

            {isUser ? (
              <>
                {/* File Attachments */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-lg"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-secondary-foreground">
                          {attachment.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-secondary-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </>
            ) : (
              <>
                {/* Thinking block - shown above main content */}
                {thinkingContent && (
                  <div className="mb-3 border border-border rounded-lg bg-secondary/50 overflow-hidden">
                    <button
                      onClick={() => setThinkingExpanded(!thinkingExpanded)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary transition-colors"
                    >
                      {thinkingExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-xs italic text-muted-foreground">Thinking...</span>
                    </button>
                    {thinkingExpanded && (
                      <div className="px-3 pb-3 pt-0">
                        <div className="relative group/thinking">
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-transparent p-0">
                            {thinkingContent}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(thinkingContent, 'thinking')}
                            className="absolute top-0 right-0 h-5 gap-1 text-[10px] text-muted-foreground hover:text-secondary-foreground px-1.5 opacity-0 group-hover/thinking:opacity-100 transition-opacity"
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
                  prose-pre:my-2 prose-pre:bg-muted prose-pre:rounded-lg prose-pre:border prose-pre:border-border
                  prose-code:text-primary prose-code:before:content-none prose-code:after:content-none
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-ring/30 prose-blockquote:text-muted-foreground
                  prose-strong:text-foreground">
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
                              <div className="flex items-center justify-between px-4 py-1.5 bg-secondary rounded-t-lg border border-b-0 border-border">
                                <span className="text-xs text-muted-foreground font-medium">{match[1]}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(codeText, blockId)}
                                  className="h-5 gap-1 text-[10px] text-muted-foreground hover:text-secondary-foreground px-1.5"
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
                        return <code className={`${className || ''} px-1.5 py-0.5 rounded bg-secondary text-primary`} {...props}>{children}</code>
                      }
                    }}
                  >
                    {mainContent}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
})
