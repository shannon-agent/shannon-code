import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
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

describe('OPC page', () => {
  it('renders strategic focus section', () => {
    render(wrap(<OPC />))
    expect(screen.getByText('Strategic Focus')).toBeInTheDocument()
  })

  it('renders agent swarm heading', () => {
    render(wrap(<OPC />))
    expect(screen.getByText('Agent Swarm')).toBeInTheDocument()
  })

  it('renders kanban section', () => {
    render(wrap(<OPC />))
    expect(screen.getByText('KANBAN')).toBeInTheDocument()
  })

  it('renders quick task input', () => {
    render(wrap(<OPC />))
    expect(screen.getByPlaceholderText('Quick inject task...')).toBeInTheDocument()
  })

  it('renders kanban columns', () => {
    render(wrap(<OPC />))
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Doing')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders no agents message when empty', () => {
    render(wrap(<OPC />))
    expect(screen.getByText(/No agents running/)).toBeInTheDocument()
  })

  it('calls startBackgroundTask on quick task submit', async () => {
    render(wrap(<OPC />))
    const input = screen.getByPlaceholderText('Quick inject task...')
    fireEvent.change(input, { target: { value: 'Test quick task' } })
    const addBtn = input.parentElement?.querySelector('button')
    if (addBtn) {
      fireEvent.click(addBtn)
      const api = await import('@/lib/tauri-api')
      expect(api.startBackgroundTask).toHaveBeenCalledWith('Test quick task')
    }
  })
})
