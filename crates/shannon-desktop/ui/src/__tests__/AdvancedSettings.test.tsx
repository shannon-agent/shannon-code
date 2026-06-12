import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import AdvancedSettings from '@/components/settings/AdvancedSettings'

function wrap(ui: React.ReactElement) {
  return (
    <AppProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('AdvancedSettings', () => {
  it('renders advanced settings heading', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Advanced Settings')).toBeInTheDocument()
  })

  it('renders memory management section', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Memory Management')).toBeInTheDocument()
  })

  it('renders long-term memory toggle label', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Long-term Memory')).toBeInTheDocument()
  })

  it('renders clear session cache button', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Clear Session Cache')).toBeInTheDocument()
  })

  it('renders data privacy section', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Data Privacy')).toBeInTheDocument()
  })

  it('renders developer options section', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Developer Options')).toBeInTheDocument()
  })

  it('renders factory reset button', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Reset to Factory Settings')).toBeInTheDocument()
  })

  it('renders view system logs link', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('View System Logs')).toBeInTheDocument()
  })

  it('renders manage api keys link', () => {
    render(wrap(<AdvancedSettings />))
    expect(screen.getByText('Manage API Keys')).toBeInTheDocument()
  })
})
