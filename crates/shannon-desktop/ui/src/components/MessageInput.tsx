// Multi-line message input with keyboard shortcuts, file drag-drop, and polished design
import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react'
import { Send, Loader2, Paperclip, X, Image as ImageIcon } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface FileAttachment {
  name: string
  path: string
  size: number
  preview?: string  // Data URL for image preview
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
    const processedAttachments = files.map(file => {
      const attachment: FileAttachment = {
        name: file.name,
        path: (file as any).path || file.name,
        size: file.size
      }
      
      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const preview = e.target?.result as string
          setAttachments(prev => prev.map(a => 
            a.path === attachment.path ? { ...a, preview } : a
          ))
        }
        reader.readAsDataURL(file)
      }
      
      return attachment
    })

    const validAttachments = processedAttachments.filter(file => {
      const fileType = files.find(f => f.name === file.name)?.type || ''
      return fileType.startsWith('image/') || fileType.startsWith('text/') || fileType.startsWith('application/')
    })

    if (validAttachments.length > 0) {
      setAttachments(prev => [...prev, ...validAttachments])
    }
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle keyboard shortcuts for attachment navigation
    if (e.key === 'Escape' && attachments.length > 0) {
      // Clear all attachments
      e.preventDefault()
      setAttachments([])
      return
    }

    // Handle Tab for attachment navigation when attachments exist
    if (e.key === 'Tab' && attachments.length > 0) {
      // Could be implemented for attachment selection
      // For now, let default behavior continue
    }

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
      role="region"
      aria-label="Message input area"
    >
      {/* File attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2" role="list" aria-label="Attached files">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg group"
              role="listitem"
              aria-label={`Attachment: ${attachment.name}, ${formatFileSize(attachment.size)}`}
            >
              {attachment.preview ? (
                <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0" aria-hidden>
                  <img
                    src={attachment.preview}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <Paperclip className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" aria-hidden />
              )}
              <span className="text-sm text-[var(--text-secondary)] truncate max-w-[150px]">
                {attachment.name}
              </span>
              <span className="text-xs text-[var(--text-muted)]" aria-label={`Size: ${formatFileSize(attachment.size)}`}>
                {formatFileSize(attachment.size)}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[var(--bg-primary)] rounded transition-all"
                aria-label={`Remove ${attachment.name}`}
                title={`Remove ${attachment.name}`}
              >
                <X className="w-3 h-3 text-[var(--text-muted)]" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          'relative flex items-end gap-2 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border transition-all duration-150',
          isDragging
            ? 'border-[var(--accent)] bg-[var(--accent)]/5'
            : 'border-[var(--glass-border)] focus-within:border-[var(--accent)]/40 focus-within:shadow-[0_0_0_4px_var(--accent)]/12'
        )}
        role="search"
        aria-label="Compose message"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            const processedAttachments = files.map(file => {
              const attachment: FileAttachment = {
                name: file.name,
                path: (file as any).path || file.name,
                size: file.size
              }

              // Generate preview for images
              if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (ev) => {
                  const preview = ev.target?.result as string
                  setAttachments(prev => prev.map(a =>
                    a.path === attachment.path ? { ...a, preview } : a
                  ))
                }
                reader.readAsDataURL(file)
              }

              return attachment
            })
            setAttachments(prev => [...prev, ...processedAttachments])
          }}
          aria-label="Attach files"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          title="Attach files"
          aria-label="Attach files"
          type="button"
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
          aria-label="Message text"
          aria-describedby={attachments.length > 0 ? 'attachments-instructions' : undefined}
        />

        <Button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && attachments.length === 0)}
          size="sm"
          className={cn(
            'flex-shrink-0 m-1.5 h-8 w-8 p-0 rounded-full',
            (text.trim() || attachments.length > 0) && !disabled
              ? 'bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)]'
              : 'bg-transparent text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--text-muted)]'
          )}
          aria-label="Send message"
          title="Send message (Enter)"
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
        <div
          className="absolute inset-0 flex items-center justify-center bg-[var(--accent)]/10 rounded-lg border-2 border-dashed border-[var(--accent)] pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <Paperclip className="w-8 h-8 mx-auto mb-2 text-[var(--accent)]" aria-hidden />
            <p className="text-sm font-medium text-[var(--accent)]">Drop files to attach</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-1.5 px-1">
        <div
          id="attachments-instructions"
          className="text-[10px] text-[var(--text-muted)]"
          aria-hidden
        >
          <kbd className="px-1 py-0.5 rounded bg-[var(--glass-bg)] border border-[var(--glass-border)]/50 text-[var(--text-muted)]">Enter</kbd>
          {' send '}
          <kbd className="px-1 py-0.5 rounded bg-[var(--glass-bg)] border border-[var(--glass-border)]/50 text-[var(--text-muted)]">Shift+Enter</kbd>
          {' newline'}
        </div>
        {characterCount > 0 && (
          <span
            className={cn('text-[10px] tabular-nums', isNearLimit ? 'text-[var(--error)]' : 'text-[var(--text-muted)]')}
            aria-label={`Character count: ${characterCount} of ${maxLength}`}
          >
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
