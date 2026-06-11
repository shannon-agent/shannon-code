import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardNavigation, useRovingTabIndex, useLiveRegion } from '../useKeyboardNavigation'

describe('useKeyboardNavigation', () => {
  it('calls action when shortcut key is pressed', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardNavigation([
      { key: 's', description: 'Save', action },
    ]))

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))
    })

    expect(action).toHaveBeenCalled()
  })

  it('calls action when ctrl+key combo matches', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardNavigation([
      { key: 's', ctrlKey: true, description: 'Save', action },
    ]))

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }))
    })

    expect(action).toHaveBeenCalled()
  })

  it('does not call action when modifier does not match', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardNavigation([
      { key: 's', ctrlKey: true, description: 'Save', action },
    ]))

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))
    })

    expect(action).not.toHaveBeenCalled()
  })

  it('does not fire when disabled', () => {
    const action = vi.fn()
    renderHook(() => useKeyboardNavigation(
      [{ key: 'x', description: 'Test', action }],
      { isEnabled: false }
    ))

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }))
    })

    expect(action).not.toHaveBeenCalled()
  })

  it('cleans up listener on unmount', () => {
    const action = vi.fn()
    const { unmount } = renderHook(() => useKeyboardNavigation([
      { key: 'q', description: 'Quit', action },
    ]))

    unmount()

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }))
    })

    expect(action).not.toHaveBeenCalled()
  })
})

describe('useRovingTabIndex', () => {
  it('starts with selectedIndex -1', () => {
    const { result } = renderHook(() => useRovingTabIndex({ itemCount: 5 }))
    expect(result.current.selectedIndex).toBe(-1)
  })

  it('moves down on ArrowDown', () => {
    const { result } = renderHook(() => useRovingTabIndex({ itemCount: 5 }))

    act(() => {
      result.current.setSelectedIndex(0)
    })

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    })

    expect(result.current.selectedIndex).toBe(1)
  })

  it('moves up on ArrowUp', () => {
    const { result } = renderHook(() => useRovingTabIndex({ itemCount: 5 }))

    act(() => {
      result.current.setSelectedIndex(2)
    })

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    })

    expect(result.current.selectedIndex).toBe(1)
  })

  it('clamps at 0 on ArrowUp from first item', () => {
    const { result } = renderHook(() => useRovingTabIndex({ itemCount: 5 }))

    act(() => {
      result.current.setSelectedIndex(0)
    })

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    })

    expect(result.current.selectedIndex).toBe(0)
  })

  it('clamps at last index on ArrowDown from last item', () => {
    const { result } = renderHook(() => useRovingTabIndex({ itemCount: 5 }))

    act(() => {
      result.current.setSelectedIndex(4)
    })

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    })

    expect(result.current.selectedIndex).toBe(4)
  })

  it('calls onSelectionChange on Enter', () => {
    const onSelectionChange = vi.fn()
    const { result } = renderHook(() => useRovingTabIndex({ itemCount: 5, onSelectionChange }))

    act(() => {
      result.current.setSelectedIndex(2)
    })

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    expect(onSelectionChange).toHaveBeenCalledWith(2)
  })

  it('jumps to first on Home', () => {
    const { result } = renderHook(() => useRovingTabIndex({ itemCount: 5 }))

    act(() => {
      result.current.setSelectedIndex(3)
    })

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'Home' }))
    })

    expect(result.current.selectedIndex).toBe(0)
  })

  it('jumps to last on End', () => {
    const { result } = renderHook(() => useRovingTabIndex({ itemCount: 5 }))

    act(() => {
      result.current.setSelectedIndex(0)
    })

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'End' }))
    })

    expect(result.current.selectedIndex).toBe(4)
  })

  it('does not navigate when inactive', () => {
    const { result } = renderHook(() => useRovingTabIndex({ itemCount: 5, isActive: false }))

    act(() => {
      result.current.setSelectedIndex(0)
    })

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    })

    expect(result.current.selectedIndex).toBe(0)
  })
})

describe('useLiveRegion', () => {
  it('returns announce function and ref', () => {
    const { result } = renderHook(() => useLiveRegion())
    expect(typeof result.current.announce).toBe('function')
    expect(result.current.announceRef).toBeDefined()
  })
})
