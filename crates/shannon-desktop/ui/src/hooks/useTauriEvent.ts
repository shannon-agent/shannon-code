import { useEffect } from 'react'
import { listen, type UnlistenFn, type EventCallback } from '@tauri-apps/api/event'

export function useTauriEvent<T>(event: string, handler: EventCallback<T>) {
  useEffect(() => {
    let unlisten: UnlistenFn | undefined
    listen<T>(event, handler).then(fn => { unlisten = fn })
    return () => { unlisten?.() }
  }, [event, handler])
}
