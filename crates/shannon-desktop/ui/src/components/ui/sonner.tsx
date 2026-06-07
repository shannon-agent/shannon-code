import { Toaster as Sonner } from 'sonner'
import { useTheme } from '../../context/ThemeContext'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'tokyo-night' } = useTheme()
  const isDark = !theme.includes('light')

  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
