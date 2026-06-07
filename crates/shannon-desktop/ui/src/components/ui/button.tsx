import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-xs font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)] active:scale-[0.97] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)] shadow-[0_1px_3px_rgba(0,0,0,0.2)] text-[var(--bg-primary)] hover:brightness-110',
        destructive: 'bg-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)]/30',
        outline: 'border border-[var(--glass-border)] backdrop-blur-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]',
        secondary: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/80',
        ghost: 'text-[var(--text-muted)] hover:bg-[var(--text-muted)]/10 hover:text-[var(--text-secondary)]',
        success: 'bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30',
        warning: 'bg-[var(--warning)]/20 text-[var(--warning)] hover:bg-[var(--warning)]/30',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-[11px]',
        lg: 'h-9 px-4',
        icon: 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
