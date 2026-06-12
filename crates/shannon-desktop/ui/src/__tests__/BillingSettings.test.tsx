import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import BillingSettings from '@/components/settings/BillingSettings'

function wrap(ui: React.ReactElement) {
  return (
    <AppProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('BillingSettings', () => {
  it('renders usage and billing heading', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Usage & Billing')).toBeInTheDocument()
  })

  it('renders current session section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Current Session')).toBeInTheDocument()
  })

  it('renders cost overview section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Cost Overview')).toBeInTheDocument()
  })

  it('renders token breakdown section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Token Breakdown')).toBeInTheDocument()
  })

  it('renders token usage display', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Token Usage')).toBeInTheDocument()
  })

  it('renders session cost display', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Session Cost')).toBeInTheDocument()
  })

  it('renders input/output token labels', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getAllByText('Input Tokens').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Output Tokens').length).toBeGreaterThanOrEqual(1)
  })
})
