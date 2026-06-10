// Tests for Settings page components
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GeneralSettingsPage, ThemeSettingsPage, ModelsSettingsPage, BillingSettingsPage, AdvancedSettingsPage } from '../SettingsPanel'
import { ThemeProvider } from '../../context/ThemeContext'

vi.mock('../../lib/tauri-api', () => ({
  configure: vi.fn(() => Promise.resolve()),
  getConfig: vi.fn(() => Promise.resolve({
    provider: 'anthropic',
    api_key: 'sk-ant-test-key',
    base_url: undefined,
    model: 'claude-3-5-sonnet-20241022',
    theme: 'tokyo-night'
  })),
  getTools: vi.fn(() => Promise.resolve([
    { name: 'bash', description: 'Run shell commands', enabled: true },
    { name: 'file_read', description: 'Read file contents', enabled: true },
  ]))
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

describe('GeneralSettingsPage', () => {
  it('renders System Settings header', () => {
    render(<GeneralSettingsPage />, { wrapper })
    expect(screen.getByText('System Settings')).toBeDefined()
  })

  it('renders Accessibility section', () => {
    render(<GeneralSettingsPage />, { wrapper })
    expect(screen.getByText('Accessibility')).toBeDefined()
    expect(screen.getByText('Text Size')).toBeDefined()
  })

  it('renders Autonomy Level section', () => {
    render(<GeneralSettingsPage />, { wrapper })
    expect(screen.getByText('Autonomy Level')).toBeDefined()
    expect(screen.getByText('Human-in-the-loop')).toBeDefined()
    expect(screen.getByText('Full Autonomy')).toBeDefined()
  })
})

describe('ThemeSettingsPage', () => {
  it('renders Theme Settings header', () => {
    render(<ThemeSettingsPage />, { wrapper })
    expect(screen.getByText('Theme Settings')).toBeDefined()
  })

  it('renders Appearance section', () => {
    render(<ThemeSettingsPage />, { wrapper })
    expect(screen.getByText('Appearance')).toBeDefined()
    expect(screen.getByText('Light Mode')).toBeDefined()
    expect(screen.getByText('Dark Mode')).toBeDefined()
  })

  it('renders Color Accents section', () => {
    render(<ThemeSettingsPage />, { wrapper })
    expect(screen.getByText('Color Accents')).toBeDefined()
  })

  it('renders Glass Pane section', () => {
    render(<ThemeSettingsPage />, { wrapper })
    expect(screen.getByText('Glass Pane Intensity')).toBeDefined()
  })

  it('renders Interface Font section', () => {
    render(<ThemeSettingsPage />, { wrapper })
    expect(screen.getByText('Interface Font')).toBeDefined()
  })
})

describe('ModelsSettingsPage', () => {
  it('renders Model Configuration header', () => {
    render(<ModelsSettingsPage />, { wrapper })
    expect(screen.getByText('Model Configuration')).toBeDefined()
  })

  it('renders Performance Strategy section', () => {
    render(<ModelsSettingsPage />, { wrapper })
    expect(screen.getByText('Performance Strategy')).toBeDefined()
    expect(screen.getByText('Balanced')).toBeDefined()
    expect(screen.getByText('Speed')).toBeDefined()
    expect(screen.getByText('High Quality')).toBeDefined()
  })

  it('renders Active Tier Summary', () => {
    render(<ModelsSettingsPage />, { wrapper })
    expect(screen.getByText('Active Tier Summary')).toBeDefined()
    expect(screen.getByText('Pro Tier')).toBeDefined()
  })

  it('renders Global Parameters', () => {
    render(<ModelsSettingsPage />, { wrapper })
    expect(screen.getByText('Global Parameters')).toBeDefined()
    expect(screen.getByText('Temperature')).toBeDefined()
    expect(screen.getByText('Max Tokens')).toBeDefined()
  })
})

describe('BillingSettingsPage', () => {
  it('renders Usage & Billing header', () => {
    render(<BillingSettingsPage />, { wrapper })
    expect(screen.getByText(/Usage & Billing/)).toBeDefined()
  })

  it('renders Current Plan section', () => {
    render(<BillingSettingsPage />, { wrapper })
    expect(screen.getByText('Pro Plan')).toBeDefined()
    expect(screen.getAllByText(/\$29\.00/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders Billing History', () => {
    render(<BillingSettingsPage />, { wrapper })
    expect(screen.getByText('Billing History')).toBeDefined()
  })
})

describe('AdvancedSettingsPage', () => {
  it('renders Advanced Settings header', () => {
    render(<AdvancedSettingsPage />, { wrapper })
    expect(screen.getByText('Advanced Settings')).toBeDefined()
  })

  it('renders Memory Management section', () => {
    render(<AdvancedSettingsPage />, { wrapper })
    expect(screen.getByText('Memory Management')).toBeDefined()
    expect(screen.getByText('Long-term Memory')).toBeDefined()
    expect(screen.getByText('Clear Session Cache')).toBeDefined()
  })

  it('renders Data Privacy section', () => {
    render(<AdvancedSettingsPage />, { wrapper })
    expect(screen.getByText('Data Privacy')).toBeDefined()
  })

  it('renders Developer Options section', () => {
    render(<AdvancedSettingsPage />, { wrapper })
    expect(screen.getByText('Developer Options')).toBeDefined()
    expect(screen.getByText('View System Logs')).toBeDefined()
  })

  it('renders Critical System Reset section', () => {
    render(<AdvancedSettingsPage />, { wrapper })
    expect(screen.getByText('Critical System Reset')).toBeDefined()
    expect(screen.getByText('Reset to Factory Settings')).toBeDefined()
  })
})
