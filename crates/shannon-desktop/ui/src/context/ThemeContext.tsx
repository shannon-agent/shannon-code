// Theme context for Shannon Desktop with Tokyo Night variants and popular themes
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Theme = 'material' | 'tokyo-night' | 'tokyo-night-light' | 'catppuccin' | 'nord' | 'ember' | 'slate'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'shannon-theme'

// Apply theme to document
function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

// Load theme from storage (mock in tests, Tauri in production)
async function loadTheme(): Promise<Theme> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      // Use Tauri configure API in production
      const { getConfig } = await import('../lib/tauri-api')
      const config = await getConfig()
      return (config.theme as Theme) ?? 'material'
    }
  } catch {
    // Fallback to localStorage
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return (stored as Theme) ?? 'material'
}

// Save theme to storage (mock in tests, Tauri in production)
async function saveTheme(theme: Theme): Promise<void> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      // Use Tauri configure API in production
      const { configure } = await import('../lib/tauri-api')
      await configure({ key: 'theme', value: theme })
    }
  } catch {
    // Fallback to localStorage
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'material' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [isLoading, setIsLoading] = useState(true)

  const themes: Theme[] = ['material', 'tokyo-night', 'tokyo-night-light', 'catppuccin', 'nord', 'ember', 'slate']

  // Load theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      const savedTheme = await loadTheme()
      setThemeState(savedTheme)
      applyTheme(savedTheme)
      setIsLoading(false)
    }

    initializeTheme()
  }, [])

  // Apply theme when it changes
  useEffect(() => {
    if (!isLoading) {
      applyTheme(theme)
      saveTheme(theme)
    }
  }, [theme, isLoading])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
