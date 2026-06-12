import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import Goals from '@/pages/Goals'

function wrap(ui: React.ReactElement) {
  return (
    <AppProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('Goals page', () => {
  it('renders task management heading', () => {
    render(wrap(<Goals />))
    expect(screen.getByText('Task Management')).toBeInTheDocument()
  })

  it('renders functional search input', () => {
    render(wrap(<Goals />))
    const input = screen.getByPlaceholderText('Search tasks...')
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'my task' } })
    expect(input).toHaveValue('my task')
  })

  it('renders task summary sidebar', () => {
    render(wrap(<Goals />))
    expect(screen.getByText('Task Summary')).toBeInTheDocument()
  })

  it('renders active agents section', () => {
    render(wrap(<Goals />))
    expect(screen.getByText(/Active Agents/)).toBeInTheDocument()
  })
})
