// Multi-line message input with keyboard shortcuts, file drag-drop, and polished design
import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react'
import { Send, Loader2, Paperclip, X } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface FileAttachment {
  name: string
  path: string
  size: number
}

interface MessageInputProps {
  onSend: (message: string, filePaths?: string[]) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Ask Shannon anything...'
}: MessageInputProps) {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [text])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const newAttachments: FileAttachment[] = files
      .filter(file => file.type.startsWith('image/') || file.type.startsWith('text/') || file.type.startsWith('application/'))
      .map(file => ({
        name: file.name,
        path: (file as any).path || file.name, // Tauri provides file.path
        size: file.size
      }))

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments])
    }
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if ((text.trim() || attachments.length > 0) && !disabled) {
        const filePaths = attachments.map(a => a.path)
        onSend(text.trim(), filePaths.length > 0 ? filePaths : undefined)
        setText('')
        setAttachments([])
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      }
    }
  }

  const handleSend = () => {
    if ((text.trim() || attachments.length > 0) && !disabled) {
      const filePaths = attachments.map(a => a.path)
      onSend(text.trim(), filePaths.length > 0 ? filePaths : undefined)
      setText('')
      setAttachments([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const characterCount = text.length
  const maxLength = 4000
  const isNearLimit = characterCount > maxLength * 0.9

  return (
    <div
      className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 px-4 py-3 backdrop-blur-sm"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* File attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg group"
            >
              <Paperclip className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-secondary)] truncate max-w-[150px]">
                {attachment.name}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {formatFileSize(attachment.size)}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[var(--bg-primary)] rounded transition-all"
              >
                <X className="w-3 h-3 text-[var(--text-muted)]" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          'relative flex items-end gap-2 bg-[var(--bg-input)] rounded-xl border transition-all duration-150',
          isDragging
            ? 'border-[var(--accent)] bg-[var(--accent)]/5'
            : 'border-[var(--border)] focus-within:border-[var(--accent)]/50 focus-within:shadow-[0_0_0_3px_var(--accent)]/15'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            const newAttachments: FileAttachment[] = files.map(file => ({
              name: file.name,
              path: (file as any).path || file.name,
              size: file.size
            }))
            setAttachments(prev => [...prev, ...newAttachments])
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          title="Attach files"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="border-0 bg-transparent focus-visible:ring-0 px-0 py-3 pr-2 text-sm leading-relaxed"
          style={{ maxHeight: '200px' }}
        />

        <Button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && attachments.length === 0)}
          size="sm"
          className={cn(
            'flex-shrink-0 m-1.5 h-8 w-8 p-0 rounded-lg',
            (text.trim() || attachments.length > 0) && !disabled
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

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--accent)]/10 rounded-xl border-2 border-dashed border-[var(--accent)] pointer-events-none">
          <div className="text-center">
            <Paperclip className="w-8 h-8 mx-auto mb-2 text-[var(--accent)]" />
            <p className="text-sm font-medium text-[var(--accent)]">Drop files to attach</p>
          </div>
        </div>
      )}

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
