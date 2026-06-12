import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import { Header } from '@/components/Header'

function wrap(ui: React.ReactElement, { route = '/chat' } = {}) {
  return (
    <AppProvider>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('Header component', () => {
  it('renders page title based on route', () => {
    render(wrap(<Header />, { route: '/chat' }))
    expect(screen.getByText('Chat')).toBeInTheDocument()
  })

  it('renders model selector button that shows model after loading', async () => {
    render(wrap(<Header />, { route: '/chat' }))
    // After async load, button text changes from "No model" to actual model ID
    await waitFor(() => {
      expect(screen.getByText('claude-sonnet-4-6')).toBeInTheDocument()
    })
  })

  it('opens model dropdown with model names on click', async () => {
    render(wrap(<Header />, { route: '/chat' }))
    // Wait for status to load, then click the model button
    const modelButton = await screen.findByText('claude-sonnet-4-6')
    fireEvent.click(modelButton)
    // Dropdown should show model name (not ID)
    await waitFor(() => {
      expect(screen.getByText('Claude Sonnet')).toBeInTheDocument()
    })
  })

  it('renders OPC title on /opc route', () => {
    render(wrap(<Header />, { route: '/opc' }))
    expect(screen.getByText('One Person Company')).toBeInTheDocument()
  })

  it('renders sync status badge on /opc/task route', () => {
    render(wrap(<Header />, { route: '/opc/task' }))
    expect(screen.getByText(/Sync Status/)).toBeInTheDocument()
  })

  it('renders user avatar placeholder', () => {
    render(wrap(<Header />, { route: '/chat' }))
    expect(screen.getByText('person')).toBeInTheDocument()
  })
})
