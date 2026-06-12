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

  it('renders usage quota overview section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Usage Quota Overview')).toBeInTheDocument()
  })

  it('renders token usage display', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Token Usage')).toBeInTheDocument()
  })

  it('renders session cost display', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Session Cost')).toBeInTheDocument()
  })

  it('renders cost analysis section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Cost Analysis')).toBeInTheDocument()
  })

  it('renders active plan badge', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Active Plan')).toBeInTheDocument()
  })

  it('renders footer help section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText(/Enterprise Team/i)).toBeInTheDocument()
  })
})
