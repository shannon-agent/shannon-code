// React hook for Tauri event listeners
import { useEffect } from 'react'
import { listen, UnlistenFn } from '@tauri-apps/api/event'

/**
 * React hook that subscribes to Tauri events and cleans up on unmount
 *
 * @param event - The Tauri event name to listen to
 * @param handler - Callback function that receives the event payload
 *
 * @example
 * ```tsx
 * useTauriEvent('query:text', (payload) => {
 *   console.log('Received text:', payload.content)
 * })
 * ```
 */
export function useTauriEvent<T>(
  event: string,
  handler: (payload: T) => void
): void {
  useEffect(() => {
    let unlisten: UnlistenFn | null = null

    const setupListener = async () => {
      try {
        unlisten = await listen<T>(event, (eventData) => {
          handler(eventData.payload as T)
        })
      } catch (error) {
        console.error(`Failed to listen to event "${event}":`, error)
      }
    }

    setupListener()

    // Cleanup function
    return () => {
      if (unlisten) {
        unlisten()
      }
    }
  }, [event, handler])
}
