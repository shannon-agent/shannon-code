import { GripVertical } from 'lucide-react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { cn } from '../../lib/utils'

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof Group>) => (
  <Group
    className={cn('flex h-full w-full data-[orientation=vertical]:flex-col', className)}
    {...props}
  />
)

const ResizablePanel = Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
}) => (
  <Separator
    className={cn(
      'relative flex w-px items-center justify-center bg-border/30 group',
      'data-[orientation=vertical]:h-px data-[orientation=vertical]:w-full',
      'after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2',
      'data-[orientation=vertical]:after:left-0 data-[orientation=vertical]:after:h-3 data-[orientation=vertical]:after:w-full data-[orientation=vertical]:after:translate-x-0 data-[orientation=vertical]:after:-translate-y-1/2',
      'hover:bg-primary/20 transition-colors',
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-5 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
    )}
  </Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
