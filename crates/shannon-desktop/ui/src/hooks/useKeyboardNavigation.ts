/**
 * Keyboard navigation utilities for accessibility
 * Provides consistent keyboard shortcuts and navigation patterns across components
 */

import { useEffect, useCallback, useRef, useState } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
}

export interface KeyboardNavOptions {
  isEnabled?: boolean
  scope?: HTMLElement | null
}

/**
 * Hook for registering keyboard shortcuts
 */
export function useKeyboardNavigation(
  shortcuts: KeyboardShortcut[],
  options: KeyboardNavOptions = {}
) {
  const { isEnabled = true, scope = null } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey
      const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey
      const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey
      const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault()
        event.stopPropagation()
        shortcut.action()
        break
      }
    }
  }, [isEnabled, shortcuts])

  useEffect(() => {
    const target = scope || document
    target.addEventListener('keydown', handleKeyDown as EventListener)
    return () => target.removeEventListener('keydown', handleKeyDown as EventListener)
  }, [handleKeyDown, scope])
}

/**
 * Hook for managing focus trap in modals/dialogs
 */
export function useFocusTrap(isActive: boolean, scopeRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !scopeRef.current) return

    const element = scopeRef.current
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => document.removeEventListener('keydown', handleTab)
  }, [isActive, scopeRef])
}

/**
 * Hook for managing roving tabindex for list navigation
 */
export function useRovingTabIndex(options: {
  itemCount: number
  isActive?: boolean
  onSelectionChange?: (index: number) => void
  orientation?: 'horizontal' | 'vertical' | 'both'
}) {
  const { itemCount, isActive = true, onSelectionChange, orientation = 'vertical' } = options
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || selectedIndex === -1) return

    let newIndex = selectedIndex

    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault()
          newIndex = Math.min(selectedIndex + 1, itemCount - 1)
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault()
          newIndex = Math.max(selectedIndex - 1, 0)
        }
        break
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault()
          newIndex = Math.min(selectedIndex + 1, itemCount - 1)
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault()
          newIndex = Math.max(selectedIndex - 1, 0)
        }
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = itemCount - 1
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        onSelectionChange?.(selectedIndex)
        return
      default:
        return
    }

    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex)
      onSelectionChange?.(newIndex)
    }
  }, [isActive, selectedIndex, itemCount, orientation, onSelectionChange])

  return { selectedIndex, setSelectedIndex, handleKeyDown }
}

/**
 * Hook for managing ARIA live regions for screen readers
 */
export function useLiveRegion() {
  const announceRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRef.current) return

    announceRef.current.setAttribute('aria-live', priority)
    announceRef.current.textContent = ''

    // Force browser to announce the change
    requestAnimationFrame(() => {
      announceRef.current!.textContent = message
    })
  }, [])

  return { announce, announceRef }
}

/**
 * Common keyboard shortcuts descriptions
 */
export const COMMON_SHORTCUTS = {
  NAVIGATE: 'Arrow keys to navigate',
  SELECT: 'Enter to select',
  CLOSE: 'Escape to close',
  SUBMIT: 'Ctrl+Enter to submit',
  SEARCH: 'Ctrl+F to search',
  HELP: '? for help',
} as const