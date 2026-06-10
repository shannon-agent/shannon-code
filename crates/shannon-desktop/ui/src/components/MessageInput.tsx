// Glass card message input with glow effect, MD3 styling, and Material Symbols
import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip'
import { Kbd } from './ui/kbd'
import { cn } from '../lib/utils'

interface FileAttachment {
  name: string
  path: string
  size: number
  preview?: string
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
  const hasContent = text.trim() || attachments.length > 0

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="relative px-md3-lg py-md3-md bg-gradient-to-t from-md3-surface via-md3-surface/95 to-transparent"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="region"
        aria-label="Message input area"
      >
        {/* File attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-md3-xs mb-md3-sm" role="list" aria-label="Attached files">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-md3-sm px-md3-md py-md3-sm bg-md3-surface-container rounded-xl border border-md3-outline-variant/10 group"
                role="listitem"
                aria-label={`Attachment: ${attachment.name}, ${formatFileSize(attachment.size)}`}
              >
                {attachment.preview ? (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0" aria-hidden>
                    <img src={attachment.preview} alt={attachment.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-[16px] text-md3-on-surface-variant">attach_file</span>
                )}
                <span className="text-body-sm text-md3-on-surface truncate max-w-[150px]">{attachment.name}</span>
                <span className="text-label-sm text-md3-on-surface-variant">{formatFileSize(attachment.size)}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-md3-surface-container-high rounded-lg transition-all"
                  aria-label={`Remove ${attachment.name}`}
                  title={`Remove ${attachment.name}`}
                >
                  <span className="material-symbols-outlined text-[14px] text-md3-on-surface-variant">close</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input card with glow */}
        <div className="relative">
          {/* Glow effect behind input when focused */}
          <div className={cn(
            'absolute -inset-1 rounded-3xl transition-all duration-500 pointer-events-none',
            hasContent && !disabled
              ? 'bg-md3-primary/8 blur-xl opacity-100'
              : 'opacity-0'
          )} />

          <div
            className={cn(
              'relative flex items-end gap-md3-sm rounded-2xl glass-card transition-all duration-200',
              isDragging
                ? 'border-md3-primary/40 bg-md3-primary/5'
                : 'focus-within:border-md3-primary/25 focus-within:shadow-[0_0_0_3px_rgba(107,56,212,0.08)]'
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
                  className="shrink-0 p-2 h-auto text-md3-on-surface-variant hover:text-md3-on-surface transition-colors rounded-none"
                  type="button"
                  aria-label="Attach files"
                >
                  <span className="material-symbols-outlined text-[20px]">attach_file</span>
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
              className="border-0 bg-transparent focus-visible:ring-0 px-0 py-md3-md pr-2 text-body-md leading-relaxed placeholder:text-md3-on-surface-variant/50"
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
                    'shrink-0 m-1.5 h-8 w-8 p-0 rounded-xl transition-all duration-200',
                    hasContent && !disabled
                      ? 'bg-md3-primary text-md3-on-primary hover:bg-md3-primary/90 active:scale-95'
                      : 'bg-transparent text-md3-on-surface-variant hover:bg-transparent'
                  )}
                  aria-label="Send message"
                >
                  {disabled ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message (Enter)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Drag overlay */}
        {isDragging && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-md3-primary/10 rounded-2xl border-2 border-dashed border-md3-primary/40 pointer-events-none"
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <span className="material-symbols-outlined text-[32px] text-md3-primary mx-auto mb-2 block">cloud_upload</span>
              <p className="text-body-sm font-medium text-md3-primary">Drop files to attach</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-md3-sm px-1">
          <div
            id="attachments-instructions"
            className="text-label-sm text-md3-on-surface-variant/60 flex items-center gap-1"
            aria-hidden
          >
            <Kbd>Enter</Kbd>
            <span>send</span>
            <Kbd className="ml-2">Shift+Enter</Kbd>
            <span>newline</span>
          </div>
          {characterCount > 0 && (
            <span
              className={cn('text-label-sm tabular-nums', isNearLimit ? 'text-md3-error' : 'text-md3-on-surface-variant/60')}
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
