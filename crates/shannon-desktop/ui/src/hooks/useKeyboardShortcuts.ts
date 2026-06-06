// Keyboard shortcuts hook for Shannon Desktop
import { useEffect } from 'react'

interface ShortcutConfig {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  handler: () => void
  description: string
}

/**
 * React hook for registering keyboard shortcuts
 *
 * Automatically cleans up event listeners on unmount.
 * Supports modifiers: ctrl, shift, alt, meta (Cmd on Mac, Win on Windows)
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: 'n',
 *     ctrlKey: true,
 *     handler: () => console.log('New session'),
 *     description: 'New session'
 *   }
 * ])
 * ```
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey
        const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey
        const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey
        const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])
}

/**
 * Default keyboard shortcuts for Shannon Desktop
 */
export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'n',
    ctrlKey: true,
    handler: () => {
      // Trigger new session - will be connected to SessionList
      window.dispatchEvent(new CustomEvent('shannon:new-session'))
    },
    description: 'New session'
  },
  {
    key: 'k',
    ctrlKey: true,
    handler: () => {
      // Open command palette
      window.dispatchEvent(new CustomEvent('shannon:command-palette'))
    },
    description: 'Command palette'
  },
  {
    key: ',',
    ctrlKey: true,
    handler: () => {
      // Open settings panel
      window.dispatchEvent(new CustomEvent('shannon:toggle-settings'))
    },
    description: 'Open settings'
  },
  {
    key: 'b',
    ctrlKey: true,
    handler: () => {
      // Toggle sidebar
      window.dispatchEvent(new CustomEvent('shannon:toggle-sidebar'))
    },
    description: 'Toggle sidebar'
  },
  {
    key: 'P',
    ctrlKey: true,
    shiftKey: true,
    handler: () => {
      // Toggle right panel
      window.dispatchEvent(new CustomEvent('shannon:toggle-right-panel'))
    },
    description: 'Toggle right panel'
  },
  {
    key: 'Escape',
    handler: () => {
      // Cancel streaming query and close dialogs
      window.dispatchEvent(new CustomEvent('shannon:cancel-query'))
      window.dispatchEvent(new CustomEvent('shannon:close-dialogs'))
    },
    description: 'Cancel query / Close dialogs'
  },
  {
    key: '?',
    shiftKey: true,
    handler: () => {
      // Show keyboard shortcuts help
      window.dispatchEvent(new CustomEvent('shannon:show-shortcuts'))
    },
    description: 'Show shortcuts'
  }
]
