import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'

function ThemeConsumer() {
  const { theme, setTheme, themes } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="theme-count">{themes.length}</span>
      {themes.map(t => (
        <button key={t.id} data-testid={`btn-${t.id}`} onClick={() => setTheme(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

describe('ThemeContext', () => {
  it('provides default material theme', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('current-theme')).toHaveTextContent('material')
  })

  it('provides all 7 themes', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme-count')).toHaveTextContent('7')
  })

  it('switches theme on setTheme call', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    fireEvent.click(screen.getByTestId('btn-tokyo-night'))
    expect(screen.getByTestId('current-theme')).toHaveTextContent('tokyo-night')
  })

  it('sets data-theme attribute on document', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    fireEvent.click(screen.getByTestId('btn-nord'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('nord')
  })

  it('throws when useTheme used outside provider', () => {
    expect(() => {
      render(<ThemeConsumer />)
    }).toThrow('useTheme must be used within ThemeProvider')
  })
})
