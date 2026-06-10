// Update banner with MD3 styling and Material Symbols
import { useEffect, useState } from 'react'
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
    <div className="relative border-b border-md3-outline-variant/10 bg-md3-surface">
      <div className="flex items-center justify-between px-md3-lg py-md3-md">
        <div className="flex items-center gap-md3-md">
          <div className="flex items-center gap-md3-sm px-md3-md py-md3-sm rounded-xl bg-md3-primary/10 border border-md3-primary/15">
            <span className="material-symbols-outlined text-[18px] text-md3-primary">download</span>
            <span className="text-label-md font-medium text-md3-primary">Update Available</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-md3-sm">
              <span className="text-body-sm font-semibold text-md3-on-surface">v{updateInfo.version}</span>
              {updateInfo.date && (
                <span className="text-label-sm text-md3-on-surface-variant">{updateInfo.date}</span>
              )}
            </div>
            {updateInfo.body && (
              <p className="text-label-sm text-md3-on-surface-variant mt-md3-xs line-clamp-1">
                {updateInfo.body}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-md3-sm">
          {progress > 0 && progress < 100 && (
            <div className="flex items-center gap-md3-sm px-md3-md py-md3-sm rounded-lg bg-md3-surface-container min-w-[180px]">
              <Progress value={progress} className="flex-1 h-1.5" />
              <span className="text-label-sm text-md3-on-surface-variant">{Math.round(progress)}%</span>
            </div>
          )}

          {status && (
            <span className="text-label-sm text-md3-on-surface-variant">{status}</span>
          )}

          <Button
            size="sm"
            onClick={handleDownload}
            disabled={progress > 0 && progress < 100}
            className="rounded-xl"
          >
            {progress > 0 && progress < 100 ? 'Downloading...' : 'Download & Install'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUpdateInfo(null)}
            className="h-8 w-8 p-0 rounded-xl"
          >
            <span className="material-symbols-outlined text-[18px] text-md3-on-surface-variant">close</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
