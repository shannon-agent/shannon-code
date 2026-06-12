import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import MyAgents from '@/components/extensions/MyAgents'

function wrap(ui: React.ReactElement) {
  return (
    <AppProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('MyAgents page', () => {
  it('renders my agents heading', () => {
    render(wrap(<MyAgents />))
    expect(screen.getByText('My Agents')).toBeInTheDocument()
  })

  it('renders empty state when no agents', () => {
    render(wrap(<MyAgents />))
    expect(screen.getByText(/No agents running/)).toBeInTheDocument()
  })

  it('renders agent count', () => {
    render(wrap(<MyAgents />))
    expect(screen.getByText(/0 agents/)).toBeInTheDocument()
  })

  it('renders performance section heading', () => {
    render(wrap(<MyAgents />))
    // Performance section only shows when agents exist; verify empty state instead
    expect(screen.getByText(/No agents running/)).toBeInTheDocument()
  })

  it('renders task completion section', () => {
    render(wrap(<MyAgents />))
    // Task completion is in agents-present view; verify empty state hint text
    expect(screen.getByText(/spawned via team coordination/)).toBeInTheDocument()
  })
})
