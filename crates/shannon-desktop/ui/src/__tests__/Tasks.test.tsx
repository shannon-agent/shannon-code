import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import Tasks from '@/pages/Tasks'

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
  it('renders scheduled tasks heading', () => {
    render(wrap(<Tasks />))
    expect(screen.getByText('Scheduled Tasks')).toBeInTheDocument()
  })

  it('renders new background task button', () => {
    render(wrap(<Tasks />))
    expect(screen.getByText('New Background Task')).toBeInTheDocument()
  })

  it('renders empty state when no tasks', () => {
    render(wrap(<Tasks />))
    expect(screen.getByText('No tasks yet.')).toBeInTheDocument()
  })

  it('renders calendar schedule widget', () => {
    render(wrap(<Tasks />))
    expect(screen.getByText('Schedule')).toBeInTheDocument()
  })

  it('renders AI efficiency section', () => {
    render(wrap(<Tasks />))
    expect(screen.getByText(/Efficiency/i)).toBeInTheDocument()
  })
})
