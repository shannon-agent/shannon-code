// Multi-line message input with keyboard shortcuts and polished design
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Ask Shannon anything...'
}: MessageInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea with smooth animation
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [text])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim() && !disabled) {
        onSend(text.trim())
        setText('')
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    }
  }

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim())
      setText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const characterCount = text.length
  const maxLength = 4000
  const isNearLimit = characterCount > maxLength * 0.9

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 px-4 py-3 backdrop-blur-sm">
      <div className="relative flex items-end gap-2 bg-[var(--bg-input)] rounded-xl border border-[var(--border)] focus-within:border-[var(--accent)]/50 focus-within:shadow-[0_0_0_3px_var(--accent)/15] transition-all duration-150">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[var(--text-secondary)] placeholder-[var(--text-muted)] px-4 py-3 pr-2 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed text-sm leading-relaxed"
          style={{ maxHeight: '200px' }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={`flex-shrink-0 m-1.5 p-2 rounded-lg transition-all duration-150 ${
            text.trim() && !disabled
              ? 'bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] shadow-sm'
              : 'text-[var(--text-muted)] cursor-not-allowed'
          }`}
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Bottom hints */}
      <div className="flex items-center justify-between mt-1.5 px-1">
        <div className="text-[10px] text-[var(--text-muted)]">
          <kbd className="px-1 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border)]">Enter</kbd>
          {' send '}
          <kbd className="px-1 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border)]">Shift+Enter</kbd>
          {' newline'}
        </div>
        {characterCount > 0 && (
          <span className={`text-[10px] tabular-nums ${isNearLimit ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'}`}>
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
