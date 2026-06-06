// Multi-line message input with keyboard shortcuts
import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...'
}: MessageInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [text])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim() && !disabled) {
        onSend(text.trim())
        setText('')
        // Reset height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    }
  }

  const characterCount = text.length
  const maxLength = 4000

  return (
    <div className="border-t border-[#414868] bg-[#24283b] p-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className={`w-full resize-none bg-[#1a1b26] text-[#a9b1d6] placeholder-[#565f89] border border-[#414868] rounded-lg px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-[#7aa2f7] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          style={{ maxHeight: '200px' }}
        />

        {/* Character count and send hint */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <span
            className={`text-xs ${
              characterCount > maxLength * 0.9
                ? 'text-[#f7768e]'
                : 'text-[#565f89]'
            }`}
          >
            {characterCount}
          </span>
          <kbd className="text-xs text-[#565f89] bg-[#1a1b26] px-1.5 py-0.5 rounded">
            Enter
          </kbd>
        </div>
      </div>

      <div className="mt-2 text-xs text-[#565f89]">
        Press <kbd className="bg-[#1a1b26] px-1 rounded">Enter</kbd> to send,
        <kbd className="bg-[#1a1b26] px-1 rounded">Shift+Enter</kbd> for newline
      </div>
    </div>
  )
}
