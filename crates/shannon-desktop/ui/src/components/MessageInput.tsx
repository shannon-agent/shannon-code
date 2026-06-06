// Multi-line message input with keyboard shortcuts and polished design
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

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
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="border-0 bg-transparent focus-visible:ring-0 px-4 py-3 pr-2 text-sm leading-relaxed"
          style={{ maxHeight: '200px' }}
        />

        <Button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          size="sm"
          className={cn(
            'flex-shrink-0 m-1.5 h-8 w-8 p-0 rounded-lg',
            text.trim() && !disabled
              ? ''
              : 'bg-transparent text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--text-muted)]'
          )}
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center justify-between mt-1.5 px-1">
        <div className="text-[10px] text-[var(--text-muted)]">
          <kbd className="px-1 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border)]">Enter</kbd>
          {' send '}
          <kbd className="px-1 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border)]">Shift+Enter</kbd>
          {' newline'}
        </div>
        {characterCount > 0 && (
          <span className={cn('text-[10px] tabular-nums', isNearLimit ? 'text-[var(--error)]' : 'text-[var(--text-muted)]')}>
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
