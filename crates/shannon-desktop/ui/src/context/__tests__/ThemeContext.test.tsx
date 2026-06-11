// Tests for ThemeContext
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, cleanup, act, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeContext'

describe('ThemeContext', () => {
  let mockDocumentElement: HTMLElement

  beforeEach(() => {
    // Mock documentElement
    mockDocumentElement = document.documentElement
    vi.spyOn(document.documentElement, 'setAttribute').mockImplementation((attr: string, value: string) => {
      if (attr === 'data-theme') {
        // Mock theme attribute setting
      }
    })

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    })

    // Mock Tauri API
    vi.mock('../lib/tauri-api', () => ({
      getConfig: vi.fn(async () => ({ theme: 'tokyo-night' })),
      configure: vi.fn(async () => {})
    }))
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('provides theme context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBeDefined()
    expect(result.current.setTheme).toBeDefined()
    expect(result.current.themes).toBeDefined()
  })

  it('has all expected themes available', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.themes).toContain('tokyo-night')
    expect(result.current.themes).toContain('tokyo-night-light')
    expect(result.current.themes).toContain('catppuccin')
    expect(result.current.themes).toContain('nord')
    expect(result.current.themes).toContain('ember')
    expect(result.current.themes).toContain('slate')
  })

  it('defaults to material theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('material')
  })

  it('can change theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => {
      result.current.setTheme('nord')
    })

    expect(result.current.theme).toBe('nord')
  })

  it('throws error when useTheme is used outside provider', () => {
    expect(() => {
      renderHook(() => useTheme())
    }).toThrow()
  })

  it('respects defaultTheme prop', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider defaultTheme="catppuccin">{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('catppuccin')
  })

  it('applies theme to document on mount', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    renderHook(() => useTheme(), { wrapper })

    await waitFor(() => {
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'material')
    })
  })

  it('applies new theme when theme changes', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    // Wait for initial async load to complete
    await waitFor(() => {
      expect(document.documentElement.setAttribute).toHaveBeenCalled()
    })

    act(() => {
      result.current.setTheme('nord')
    })

    await waitFor(() => {
      expect(document.documentElement.setAttribute).toHaveBeenLastCalledWith('data-theme', 'nord')
    })
  })

  it('persists theme choice to localStorage', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    // Wait for initial load
    await waitFor(() => {
      expect(document.documentElement.setAttribute).toHaveBeenCalled()
    })

    act(() => {
      result.current.setTheme('tokyo-night-light')
    })

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('shannon-theme', 'tokyo-night-light')
    })
  })

  it('loads saved theme from localStorage on mount', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('catppuccin')

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )

    const { result } = renderHook(() => useTheme(), { wrapper })

    await waitFor(() => {
      expect(result.current.theme).toBe('catppuccin')
    })
  })
})
