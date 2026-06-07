import { cn } from '../../lib/utils'

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
}

function Empty({ className, icon, title, description, children, ...props }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)} {...props}>
      {icon && <div className="mb-3 text-muted-foreground/30">{icon}</div>}
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>}
      {children}
    </div>
  )
}

export { Empty }
