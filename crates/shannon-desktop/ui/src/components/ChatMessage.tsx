// Chat message component with markdown rendering and syntax highlighting
import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { ChatMessage as ChatMessageType } from '../types/tauri-events'
import 'highlight.js/styles/github-dark.css'

interface ChatMessageProps {
  message: ChatMessageType
}

export const ChatMessage = memo(function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div
      className={`flex gap-3 p-4 ${isUser ? 'bg-[#24283b]' : 'bg-[#1a1b26]'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          isUser
            ? 'bg-[#7aa2f7] text-[#1a1b26]'
            : 'bg-[#9ece6a] text-[#1a1b26]'
        }`}
      >
        {isUser ? 'U' : 'A'}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-[#c0caf5]">
            {isUser ? 'You' : 'Shannon'}
          </span>
          <span className="text-xs text-[#565f89]">{timestamp}</span>
        </div>

        {isUser ? (
          <p className="text-[#a9b1d6] whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
})
