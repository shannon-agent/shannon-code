// Update banner component for displaying available updates
import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { Progress } from './ui/progress'
import { Button } from './ui/button'

interface UpdateAvailablePayload {
  version: string
  date?: string
  body?: string
}

export function UpdateBanner() {
  const [updateInfo, setUpdateInfo] = useState<UpdateAvailablePayload | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    let unlisten: UnlistenFn | null = null

    const setupListeners = async () => {
      // Listen for update-available events
      unlisten = await listen<UpdateAvailablePayload>('update-available', (event) => {
        setUpdateInfo(event.payload)
        setProgress(0)
        setStatus('')
      })

      // Listen for update progress events
      const progressUnlisten = await listen<{ progress: number; status: string }>('update-progress', (event) => {
        setProgress(event.payload.progress * 100)
        setStatus(event.payload.status)
      })

      return () => {
        if (unlisten) unlisten()
        progressUnlisten()
      }
    }

    setupListeners()
  }, [])

  const handleDownload = () => {
    // Emit event to trigger update download
    // This will be handled by the Tauri backend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window.__TAURI__ as any)?.emit?.('download-update', {})
  }

  if (!updateInfo) {
    return null
  }

  return (
    <div className="relative border-b border-border bg-background">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-ring/20">
            <Download className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Update Available</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">v{updateInfo.version}</span>
              {updateInfo.date && (
                <span className="text-xs text-muted-foreground">{updateInfo.date}</span>
              )}
            </div>
            {updateInfo.body && (
              <p className="text-xs text-secondary-foreground mt-0.5 line-clamp-1">
                {updateInfo.body}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {progress > 0 && progress < 100 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted min-w-[180px]">
              <Progress value={progress} className="flex-1 h-1.5" />
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
          )}

          {status && (
            <span className="text-xs text-muted-foreground">{status}</span>
          )}

          <Button
            size="sm"
            onClick={handleDownload}
            disabled={progress > 0 && progress < 100}
          >
            {progress > 0 && progress < 100 ? 'Downloading...' : 'Download & Install'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUpdateInfo(null)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  )
}
