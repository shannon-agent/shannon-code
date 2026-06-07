// Thin wrapper around Sonner for toast notifications
import { ReactNode, useCallback } from 'react'
import { toast } from 'sonner'
import { Toaster } from './ui/sonner'

export { toast }

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastContextType {
  addToast: (message: string, variant: ToastVariant) => void
}

const noopToast: ToastContextType = {
  addToast: () => {}
}

// Keep a context for backward compatibility with useToast consumers
import { createContext, useContext } from 'react'

const ToastContext = createContext<ToastContextType>(noopToast)

export function useToast() {
  return useContext(ToastContext)
}

interface ToastProviderProps {
  children: ReactNode
}

const VARIANT_TO_METHOD: Record<ToastVariant, typeof toast.success> = {
  success: toast.success,
  error: toast.error,
  info: toast.info,
  warning: toast.warning,
}

export function ToastProvider({ children }: ToastProviderProps) {
  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const method = VARIANT_TO_METHOD[variant] ?? toast
    method(message)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}
