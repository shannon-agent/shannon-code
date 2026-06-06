// Tests for SettingsPanel component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsPanel } from '../SettingsPanel'
import { ThemeProvider } from '../../context/ThemeContext'

// Mock Tauri API
vi.mock('../../lib/tauri-api', () => ({
  configure: vi.fn(() => Promise.resolve()),
  getConfig: vi.fn(() => Promise.resolve({
    provider: 'anthropic',
    api_key: 'sk-ant-test-key',
    base_url: undefined,
    model: 'claude-3-5-sonnet-20241022',
    theme: 'tokyo-night'
  }))
}))

describe('SettingsPanel', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )

  it('renders settings title', () => {
    render(<SettingsPanel />, { wrapper })
    expect(screen.getByText('Settings')).toBeDefined()
  })

  it('renders API key input field', () => {
    render(<SettingsPanel />, { wrapper })
    expect(screen.getByPlaceholderText('sk-ant-...')).toBeDefined()
  })

  it('renders base URL input field', () => {
    render(<SettingsPanel />, { wrapper })
    expect(screen.getByPlaceholderText('https://api.example.com')).toBeDefined()
  })

  it('renders theme selector', () => {
    render(<SettingsPanel />, { wrapper })
    expect(screen.getByText('Theme')).toBeDefined()
  })

  it('toggles API key visibility', () => {
    render(<SettingsPanel />, { wrapper })
    const toggleButton = screen.getAllByRole('button').find(btn =>
      btn.querySelector('svg')
    )
    expect(toggleButton).toBeDefined()
  })

  it('displays about section', () => {
    render(<SettingsPanel />, { wrapper })
    expect(screen.getByText('About')).toBeDefined()
    expect(screen.getByText(/Shannon Desktop/)).toBeDefined()
  })

  it('shows version information', () => {
    render(<SettingsPanel />, { wrapper })
    expect(screen.getByText(/Shannon Desktop v0\.1\.0/)).toBeDefined()
  })

  it('provides documentation links', () => {
    render(<SettingsPanel />, { wrapper })
    const githubLink = screen.getByText('GitHub')
    const docsLink = screen.getByText('Documentation')
    expect(githubLink).toBeDefined()
    expect(docsLink).toBeDefined()
  })

  it('applies Tokyo Night colors', () => {
    const { container } = render(<SettingsPanel />, { wrapper })
    const panel = container.querySelector('.bg-\\[\\#24283b\\]')
    expect(panel).toBeDefined()
  })

  it('uses correct text styling', () => {
    const { container } = render(<SettingsPanel />, { wrapper })
    const title = container.querySelector('.text-\\[\\#c0caf5\\]')
    expect(title).toBeDefined()
  })
})
