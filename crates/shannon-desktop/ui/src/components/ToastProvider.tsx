import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Toast, ToastVariant } from './ui/toast'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  timestamp: number
}

interface ToastContextType {
  addToast: (message: string, variant: ToastVariant) => void
}

const noopToast: ToastContextType = {
  addToast: () => {}
}

const ToastContext = createContext<ToastContextType>(noopToast)

export function useToast() {
  return useContext(ToastContext)
}

interface ToastProviderProps {
  children: ReactNode
}

const AUTO_DISMISS_MS = 4000
const MAX_VISIBLE_TOASTS = 3

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setToasts(prev => {
      const newToast: ToastItem = { id, message, variant, timestamp: Date.now() }
      const updated = [...prev, newToast]
      // Keep only the most recent MAX_VISIBLE_TOASTS toasts
      return updated.slice(-MAX_VISIBLE_TOASTS)
    })
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Auto-dismiss toasts after AUTO_DISMISS_MS
  useEffect(() => {
    const now = Date.now()
    const expiredToasts = toasts.filter(toast => now - toast.timestamp > AUTO_DISMISS_MS)

    if (expiredToasts.length > 0) {
      expiredToasts.forEach(toast => removeToast(toast.id))
    }
  }, [toasts, removeToast])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container - positioned bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              message={toast.message}
              variant={toast.variant}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
