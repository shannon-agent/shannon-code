import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import * as api from '@/lib/tauri-api'

export type ThemeName = 'material' | 'tokyo-night' | 'tokyo-night-light' | 'catppuccin' | 'nord' | 'ember' | 'slate'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  themes: { id: ThemeName; label: string }[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

const THEMES: { id: ThemeName; label: string }[] = [
  { id: 'material', label: 'Material' },
  { id: 'tokyo-night', label: 'Tokyo Night' },
  { id: 'tokyo-night-light', label: 'Tokyo Night Light' },
  { id: 'catppuccin', label: 'Catppuccin' },
  { id: 'nord', label: 'Nord' },
  { id: 'ember', label: 'Ember' },
  { id: 'slate', label: 'Slate' },
]

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('shannon-theme') as ThemeName) || 'material'
    }
    return 'material'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('shannon-theme', theme)
  }, [theme])

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme)
    api.configure({ key: 'theme', value: newTheme }).catch(() => {})
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}
