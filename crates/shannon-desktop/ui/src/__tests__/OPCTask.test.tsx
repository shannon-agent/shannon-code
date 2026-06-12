import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import OPCTask from '@/pages/OPCTask'

function wrap(ui: React.ReactElement) {
  return (
    <AppProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('OPCTask page', () => {
  it('renders agent workflow heading', () => {
    render(wrap(<OPCTask />))
    expect(screen.getByText('Agent Workflow')).toBeInTheDocument()
  })

  it('renders task description empty state when no tasks', () => {
    render(wrap(<OPCTask />))
    expect(screen.getByText(/No task selected/)).toBeInTheDocument()
  })

  it('renders execution log heading', () => {
    render(wrap(<OPCTask />))
    expect(screen.getByText('Execution Log')).toBeInTheDocument()
  })

  it('renders efficiency metrics section', () => {
    render(wrap(<OPCTask />))
    expect(screen.getByText('Efficiency Metrics')).toBeInTheDocument()
  })

  it('renders related tasks section', () => {
    render(wrap(<OPCTask />))
    expect(screen.getByText('Related Tasks')).toBeInTheDocument()
  })

  it('renders session cost metric', () => {
    render(wrap(<OPCTask />))
    expect(screen.getByText('Session Cost')).toBeInTheDocument()
  })

  it('renders token usage metric', () => {
    render(wrap(<OPCTask />))
    expect(screen.getByText('Token Usage')).toBeInTheDocument()
  })
})
