import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/context/ThemeContext'
import GeneralSettings from '@/components/settings/GeneralSettings'
import AdvancedSettings from '@/components/settings/AdvancedSettings'
import BillingSettings from '@/components/settings/BillingSettings'

function wrap(ui: React.ReactElement) {
  return (
    <ThemeProvider>
      <AppProvider>
        {ui}
      </AppProvider>
    </ThemeProvider>
  )
}

describe('GeneralSettings', () => {
  it('renders heading', () => {
    render(wrap(<GeneralSettings />))
    expect(screen.getByText('System Settings')).toBeInTheDocument()
  })

  it('renders approval mode section', () => {
    render(wrap(<GeneralSettings />))
    expect(screen.getByText('Approval Mode')).toBeInTheDocument()
  })
})

describe('AdvancedSettings', () => {
  it('renders heading', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument()
  })

  it('renders clear cache option', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Clear Session Cache')).toBeInTheDocument()
  })

  it('renders factory reset option', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Reset to Factory Settings')).toBeInTheDocument()
  })
})

describe('BillingSettings', () => {
  it('renders heading', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Usage & Billing')).toBeInTheDocument()
  })

  it('renders token usage section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Token Breakdown')).toBeInTheDocument()
  })
})
