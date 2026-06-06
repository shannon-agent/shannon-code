// Update banner component for displaying available updates
import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

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
    window.__TAURI__?.emit?.('download-update', {})
  }

  if (!updateInfo) {
    return null
  }

  return (
    <div className="relative border-b border-[var(--border)] bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-secondary)]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
            <Download className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--accent)]">Update Available</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">v{updateInfo.version}</span>
              {updateInfo.date && (
                <span className="text-xs text-[var(--text-muted)]">{updateInfo.date}</span>
              )}
            </div>
            {updateInfo.body && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                {updateInfo.body}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {progress > 0 && progress < 100 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--bg-input)]">
              <div className="w-24 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-[var(--text-muted)]">{Math.round(progress)}%</span>
            </div>
          )}

          {status && (
            <span className="text-xs text-[var(--text-muted)]">{status}</span>
          )}

          <button
            onClick={handleDownload}
            disabled={progress > 0 && progress < 100}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {progress > 0 && progress < 100 ? 'Downloading...' : 'Download & Install'}
          </button>

          <button
            onClick={() => setUpdateInfo(null)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>
    </div>
  )
}