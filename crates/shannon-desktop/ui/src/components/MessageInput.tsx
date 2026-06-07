// Multi-line message input with keyboard shortcuts, file drag-drop, and polished design
import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react'
import { Send, Loader2, Paperclip, X } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip'
import { Kbd } from './ui/kbd'
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
      e.preventDefault()
      setAttachments([])
      return
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
    <TooltipProvider delayDuration={300}>
      <div
        className="border-t border-border bg-secondary/80 px-4 py-3"
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
                className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-lg group"
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
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" aria-hidden />
                )}
                <span className="text-sm text-secondary-foreground truncate max-w-[150px]">
                  {attachment.name}
                </span>
                <span className="text-xs text-muted-foreground" aria-label={`Size: ${formatFileSize(attachment.size)}`}>
                  {formatFileSize(attachment.size)}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background rounded transition-all"
                  aria-label={`Remove ${attachment.name}`}
                  title={`Remove ${attachment.name}`}
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            'relative flex items-end gap-2 rounded-2xl bg-glass-bg border transition-all duration-150',
            isDragging
              ? 'border-ring bg-primary/5'
              : 'border-glass-border focus-within:border-ring/40 focus-within:shadow-[0_0_0_4px_var(--accent)]/12'
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-2 h-auto text-muted-foreground hover:text-secondary-foreground transition-colors rounded-none"
                type="button"
                aria-label="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach files</TooltipContent>
          </Tooltip>

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

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSend}
                disabled={disabled || (!text.trim() && attachments.length === 0)}
                size="sm"
                className={cn(
                  'flex-shrink-0 m-1.5 h-8 w-8 p-0 rounded-full',
                  (text.trim() || attachments.length > 0) && !disabled
                    ? 'bg-gradient-to-b from-primary to-accent-hover'
                    : 'bg-transparent text-muted-foreground hover:bg-transparent hover:text-muted-foreground'
                )}
                aria-label="Send message"
              >
                {disabled ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message (Enter)</TooltipContent>
          </Tooltip>
        </div>

        {/* Drag overlay */}
        {isDragging && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg border-2 border-dashed border-ring pointer-events-none"
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <Paperclip className="w-8 h-8 mx-auto mb-2 text-primary" aria-hidden />
              <p className="text-sm font-medium text-primary">Drop files to attach</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-1.5 px-1">
          <div
            id="attachments-instructions"
            className="text-[10px] text-muted-foreground flex items-center gap-1"
            aria-hidden
          >
            <Kbd>Enter</Kbd>
            <span>send</span>
            <Kbd className="ml-2">Shift+Enter</Kbd>
            <span>newline</span>
          </div>
          {characterCount > 0 && (
            <span
              className={cn('text-[10px] tabular-nums', isNearLimit ? 'text-destructive' : 'text-muted-foreground')}
              aria-label={`Character count: ${characterCount} of ${maxLength}`}
            >
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
