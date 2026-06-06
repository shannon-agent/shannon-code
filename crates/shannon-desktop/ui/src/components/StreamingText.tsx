// Live streaming text component with smooth cursor animation
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface StreamingTextProps {
  content: string
  isStreaming?: boolean
}

export function StreamingText({ content, isStreaming = false }: StreamingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [content, isStreaming])

  return (
    <div className="px-4 py-3 bg-transparent">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold tracking-wide bg-[var(--success)]/20 text-[var(--success)]">
          S
        </div>

        <div className="flex-1 min-w-0 streaming-container">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-[var(--success)]">Shannon</span>
            {isStreaming && (
              <span className="text-xs text-[var(--accent)] status-pulse">thinking...</span>
            )}
          </div>

          <div className="prose prose-invert prose-sm max-w-none
            prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2
            prose-pre:my-2 prose-pre:bg-[var(--bg-input)] prose-pre:rounded-lg prose-pre:border prose-pre:border-[var(--border)]
            prose-code:text-[var(--accent)] prose-code:before:content-none prose-code:after:content-none
            prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-[var(--accent)]/30 prose-blockquote:text-[var(--text-muted)]
            prose-strong:text-[var(--text-primary)]
            text-[var(--text-secondary)]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </div>

          {/* Smooth pulsing cursor during streaming */}
          {isStreaming && (
            <span className="inline-block w-[2px] h-[18px] bg-[var(--accent)] ml-0.5 streaming-cursor rounded-full" />
          )}
        </div>
      </div>
    </div>
  )
}
