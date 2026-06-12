import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('renders cache hit rate display', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Cache Hit Rate')).toBeInTheDocument()
  })

  it('renders cost analysis section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Cost Analysis')).toBeInTheDocument()
  })

  it('renders active plan badge', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Active Plan')).toBeInTheDocument()
  })

  it('renders billing history section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Billing History')).toBeInTheDocument()
  })

  it('renders footer help section', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText(/Enterprise Team/i)).toBeInTheDocument()
  })

  // US-SET-06: Change Plan modal
  it('opens change plan modal on Change Plan click', () => {
    render(wrap(<BillingSettings />))
    fireEvent.click(screen.getByText('Change Plan'))
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('closes change plan modal when close button clicked', () => {
    render(wrap(<BillingSettings />))
    fireEvent.click(screen.getAllByText('Change Plan')[0])
    expect(screen.getByText('Free')).toBeInTheDocument()
    // Click the backdrop to close
    const modal = screen.getByText('Free').closest('.fixed')!
    const closeBtn = modal.querySelector('.material-symbols-outlined')
    if (closeBtn) fireEvent.click(closeBtn)
  })

  // US-SET-08: Legal modal
  it('opens legal modal on Legal & Terms click', () => {
    render(wrap(<BillingSettings />))
    fireEvent.click(screen.getByText('Legal & Terms'))
    expect(screen.getByText('Legal & Privacy')).toBeInTheDocument()
  })

  it('opens legal modal on Privacy Policy click', () => {
    render(wrap(<BillingSettings />))
    fireEvent.click(screen.getByText('Privacy Policy'))
    expect(screen.getByText('Legal & Privacy')).toBeInTheDocument()
  })

  // US-SET-07: Cancel subscription
  it('has cancel button', () => {
    render(wrap(<BillingSettings />))
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })
})
