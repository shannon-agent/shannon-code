import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  message: string
  variant: ToastVariant
  onClose: (id: string) => void
}

const variantStyles: Record<ToastVariant, { border: string; icon: string; bg: string }> = {
  success: {
    border: 'border-l-[var(--success)]',
    icon: '✓',
    bg: 'bg-[var(--success)]/10'
  },
  error: {
    border: 'border-l-[var(--error)]',
    icon: '✕',
    bg: 'bg-[var(--error)]/10'
  },
  info: {
    border: 'border-l-[var(--info)]',
    icon: 'ℹ',
    bg: 'bg-[var(--info)]/10'
  },
  warning: {
    border: 'border-l-[var(--warning)]',
    icon: '⚠',
    bg: 'bg-[var(--warning)]/10'
  }
}

export function Toast({ id, message, variant, onClose }: ToastProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg',
        'bg-[var(--bg-primary)] border-[var(--border)]',
        'animate-slide-in-right',
        styles.border,
        styles.bg
      )}
    >
      <span className="text-sm font-medium" aria-hidden="true">
        {styles.icon}
      </span>
      <p className="flex-1 text-sm text-[var(--text-secondary)]">
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-0.5 rounded hover:bg-[var(--bg-secondary)]"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
