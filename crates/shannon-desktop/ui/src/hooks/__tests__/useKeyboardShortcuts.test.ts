// Tests for useKeyboardShortcuts hook
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, cleanup } from '@testing-library/react'
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from '../useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let addSpy: ReturnType<typeof vi.spyOn>
  let removeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addSpy = vi.spyOn(window, 'addEventListener')
    removeSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addSpy.mockRestore()
    removeSpy.mockRestore()
    cleanup()
  })

  it('registers keyboard shortcuts on mount', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'k', ctrlKey: true, handler, description: 'Test shortcut' }
      ])
    )

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('triggers handler when shortcut key is pressed', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'k', ctrlKey: true, handler, description: 'Test shortcut' }
      ])
    )

    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does not trigger handler when modifiers do not match', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'k', ctrlKey: true, handler, description: 'Test shortcut' }
      ])
    )

    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(new KeyboardEvent('keydown', { key: 'k', ctrlKey: false }))

    expect(handler).not.toHaveBeenCalled()
  })

  it('triggers handler for Ctrl+Shift+P shortcut', () => {
    let triggered = false
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'P', ctrlKey: true, shiftKey: true, handler: () => { triggered = true }, description: 'Toggle right panel' }
      ])
    )

    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(new KeyboardEvent('keydown', { key: 'P', ctrlKey: true, shiftKey: true }))

    expect(triggered).toBe(true)
  })

  it('triggers handler for Ctrl+B shortcut', () => {
    let triggered = false
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'b', ctrlKey: true, handler: () => { triggered = true }, description: 'Toggle sidebar' }
      ])
    )

    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }))

    expect(triggered).toBe(true)
  })

  it('triggers handler for Ctrl+, shortcut', () => {
    let triggered = false
    renderHook(() =>
      useKeyboardShortcuts([
        { key: ',', ctrlKey: true, handler: () => { triggered = true }, description: 'Open settings' }
      ])
    )

    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(new KeyboardEvent('keydown', { key: ',', ctrlKey: true }))

    expect(triggered).toBe(true)
  })

  it('triggers handler for Escape shortcut', () => {
    let triggered = false
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'Escape', handler: () => { triggered = true }, description: 'Close dialogs' }
      ])
    )

    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(triggered).toBe(true)
  })

  it('prevents default behavior when shortcut matches', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'k', ctrlKey: true, handler, description: 'Test shortcut' }
      ])
    )

    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('cleans up event listeners on unmount', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([
        { key: 'k', ctrlKey: true, handler, description: 'Test shortcut' }
      ])
    )

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('handles case-insensitive key matching', () => {
    const handler = vi.fn()
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'K', ctrlKey: true, handler, description: 'Test shortcut' }
      ])
    )

    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('uses default shortcuts when imported', () => {
    expect(DEFAULT_SHORTCUTS).toBeDefined()
    expect(DEFAULT_SHORTCUTS.length).toBeGreaterThan(0)
    expect(DEFAULT_SHORTCUTS.some(s => s.key === ',')).toBe(true)
    expect(DEFAULT_SHORTCUTS.some(s => s.key === 'b')).toBe(true)
    expect(DEFAULT_SHORTCUTS.some(s => s.key === 'Escape')).toBe(true)
    expect(DEFAULT_SHORTCUTS.some(s => s.key === 'o')).toBe(true)
    expect(DEFAULT_SHORTCUTS.some(s => s.key === '`')).toBe(true)
    expect(DEFAULT_SHORTCUTS.some(s => s.key === ']')).toBe(true)
    expect(DEFAULT_SHORTCUTS.some(s => s.key === '[')).toBe(true)
  })

  it('triggers handler for Ctrl+O view mode shortcut', () => {
    let triggered = false
    renderHook(() =>
      useKeyboardShortcuts([
        { key: 'o', ctrlKey: true, handler: () => { triggered = true }, description: 'Cycle view mode' }
      ])
    )
    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(new KeyboardEvent('keydown', { key: 'o', ctrlKey: true }))
    expect(triggered).toBe(true)
  })

  it('triggers handler for Ctrl+] next session shortcut', () => {
    let triggered = false
    renderHook(() =>
      useKeyboardShortcuts([
        { key: ']', ctrlKey: true, handler: () => { triggered = true }, description: 'Next session' }
      ])
    )
    const listener = addSpy.mock.calls.find(c => c[0] === 'keydown')?.[1] as EventListener
    listener(new KeyboardEvent('keydown', { key: ']', ctrlKey: true }))
    expect(triggered).toBe(true)
  })
})
