// Live streaming text component with cursor animation
import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface StreamingTextProps {
  content: string
  isStreaming?: boolean
}

export function StreamingText({ content, isStreaming = false }: StreamingTextProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [prevContent, setPrevContent] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Update displayed content when content changes
  useEffect(() => {
    if (content !== prevContent) {
      setDisplayedContent(content)
      setPrevContent(content)
    }
  }, [content, prevContent])

  // Auto-scroll to bottom when streaming
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedContent, isStreaming])

  return (
    <div
      ref={containerRef}
      className="prose prose-invert prose-sm max-w-none text-[#a9b1d6]"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {displayedContent}
      </ReactMarkdown>

      {/* Blinking cursor during streaming */}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-[#7aa2f7] ml-1 animate-pulse" />
      )}
    </div>
  )
}
