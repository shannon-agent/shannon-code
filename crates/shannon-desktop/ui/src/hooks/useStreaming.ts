// Streaming query hook for real-time message streaming
import { useState, useCallback, useRef } from 'react'
import { useTauriEvent } from './useTauriEvent'
import { sendMessage } from '../lib/tauri-api'
import type {
  QueryTextPayload,
  QueryCompletedPayload,
  QueryFailedPayload
} from '../types/tauri-events'
import { EVENT_NAMES } from '../types/tauri-events'

interface UseStreamingResult {
  sendMessage: (text: string) => Promise<void>
  isStreaming: boolean
  error: string | null
  clearError: () => void
}

/**
 * Hook for managing streaming queries with real-time text updates
 *
 * Handles the full streaming lifecycle:
 * - Send message via Tauri IPC
 * - Receive streaming text chunks
 * - Track completion or failure
 * - Manage error states
 *
 * @example
 * ```tsx
 * const { sendMessage, isStreaming, error } = useStreaming()
 *
 * return (
 *   <button onClick={() => sendMessage("Hello")} disabled={isStreaming}>
 *     {isStreaming ? 'Sending...' : 'Send'}
 *   </button>
 * )
 * ```
 */
export function useStreaming(): UseStreamingResult {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamTextRef = useRef('')
  const queryIdRef = useRef<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Listen for streaming text chunks
  useTauriEvent<QueryTextPayload>(
    EVENT_NAMES.QUERY_TEXT,
    (payload) => {
      if (!queryIdRef.current || queryIdRef.current === payload.query_id) {
        queryIdRef.current = payload.query_id
        streamTextRef.current += payload.content
        // Emit custom event for components to listen to
        window.dispatchEvent(new CustomEvent('shannon:stream-text', {
          detail: {
            queryId: payload.query_id,
            content: payload.content,
            fullText: streamTextRef.current
          }
        }))
      }
    }
  )

  // Listen for query completion
  useTauriEvent<QueryCompletedPayload>(
    EVENT_NAMES.QUERY_COMPLETED,
    (payload) => {
      if (!queryIdRef.current || queryIdRef.current === payload.query_id) {
        setIsStreaming(false)
        queryIdRef.current = null
        streamTextRef.current = ''
        // Emit completion event
        window.dispatchEvent(new CustomEvent('shannon:stream-complete', {
          detail: { queryId: payload.query_id }
        }))
      }
    }
  )

  // Listen for query failure
  useTauriEvent<QueryFailedPayload>(
    EVENT_NAMES.QUERY_FAILED,
    (payload) => {
      if (!queryIdRef.current || queryIdRef.current === payload.query_id) {
        setIsStreaming(false)
        setError(payload.error)
        queryIdRef.current = null
        streamTextRef.current = ''
        // Emit error event
        window.dispatchEvent(new CustomEvent('shannon:stream-error', {
          detail: { queryId: payload.query_id, error: payload.error }
        }))
      }
    }
  )

  // Send message function
  const sendMessageHook = useCallback(async (text: string) => {
    if (isStreaming) {
      console.warn('Cannot send message while streaming is in progress')
      return
    }

    try {
      setIsStreaming(true)
      setError(null)
      streamTextRef.current = ''
      queryIdRef.current = null

      const response = await sendMessage(text)
      queryIdRef.current = response.query_id

      // Emit start event
      window.dispatchEvent(new CustomEvent('shannon:stream-start', {
        detail: { queryId: response.query_id, message: text }
      }))
    } catch (err) {
      setIsStreaming(false)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      console.error('Failed to send message:', err)
    }
  }, [isStreaming])

  return {
    sendMessage: sendMessageHook,
    isStreaming,
    error,
    clearError
  }
}
