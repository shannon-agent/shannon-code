import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary',
        success: 'bg-success/15 text-success',
        error: 'bg-destructive/15 text-destructive',
        warning: 'bg-warning/15 text-warning',
        outline: 'border border-border text-muted-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
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
