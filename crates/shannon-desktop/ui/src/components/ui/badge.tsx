import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--accent)]/15 text-[var(--accent)]',
        success: 'bg-[var(--success)]/15 text-[var(--success)]',
        error: 'bg-[var(--error)]/15 text-[var(--error)]',
        warning: 'bg-[var(--warning)]/15 text-[var(--warning)]',
        outline: 'border border-[var(--border)] text-[var(--text-muted)]',
        secondary: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
