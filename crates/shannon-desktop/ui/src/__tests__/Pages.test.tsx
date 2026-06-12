import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import Tasks from '@/pages/Tasks'
import Goals from '@/pages/Goals'
import OPC from '@/pages/OPC'

function wrap(ui: React.ReactElement) {
  return (
    <AppProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('Tasks page', () => {
  it('renders page title', () => {
    render(wrap(<Tasks />))
    expect(screen.getByText('Scheduled Tasks')).toBeInTheDocument()
  })

  it('renders new task button', () => {
    render(wrap(<Tasks />))
    expect(screen.getByText('New Background Task')).toBeInTheDocument()
  })

  it('renders empty state when no tasks', () => {
    render(wrap(<Tasks />))
    expect(screen.getByText('No tasks yet.')).toBeInTheDocument()
  })

  it('renders calendar widget', () => {
    render(wrap(<Tasks />))
    expect(screen.getByText('Schedule')).toBeInTheDocument()
  })
})

describe('Goals page', () => {
  it('renders page heading', () => {
    render(wrap(<Goals />))
    expect(screen.getByText('Task Management')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(wrap(<Goals />))
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument()
  })

  it('renders task summary section', () => {
    render(wrap(<Goals />))
    expect(screen.getByText('Task Summary')).toBeInTheDocument()
  })
})

describe('OPC page', () => {
  it('renders kanban header', () => {
    render(wrap(<OPC />))
    expect(screen.getByText('KANBAN')).toBeInTheDocument()
  })

  it('renders kanban columns', () => {
    render(wrap(<OPC />))
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Doing')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders agent swarm section', () => {
    render(wrap(<OPC />))
    expect(screen.getByText('Agent Swarm')).toBeInTheDocument()
  })
})
