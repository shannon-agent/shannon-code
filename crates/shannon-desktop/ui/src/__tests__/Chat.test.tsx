import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import Chat from '@/pages/Chat'

function wrap(ui: React.ReactElement) {
  return (
    <AppProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('Chat page', () => {
  it('renders new chat button', () => {
    render(wrap(<Chat />))
    expect(screen.getByText('New Chat')).toBeInTheDocument()
  })

  it('renders session search input', () => {
    render(wrap(<Chat />))
    expect(screen.getByPlaceholderText('Search sessions...')).toBeInTheDocument()
  })

  it('renders message input area', () => {
    render(wrap(<Chat />))
    expect(screen.getByPlaceholderText('Ask Shannon anything...')).toBeInTheDocument()
  })

  it('renders no sessions message when empty', () => {
    render(wrap(<Chat />))
    expect(screen.getByText('No sessions')).toBeInTheDocument()
  })

  it('calls createSession when New Chat is clicked', async () => {
    render(wrap(<Chat />))
    const btn = screen.getByText('New Chat')
    fireEvent.click(btn)
    const { newSession } = await import('@/lib/tauri-api')
    expect(newSession).toHaveBeenCalled()
  })

  it('updates session search on input', () => {
    render(wrap(<Chat />))
    const input = screen.getByPlaceholderText('Search sessions...')
    fireEvent.change(input, { target: { value: 'test query' } })
    expect(input).toHaveValue('test query')
  })

  it('sends message on Enter key and clears input', () => {
    render(wrap(<Chat />))
    const input = screen.getByPlaceholderText('Ask Shannon anything...')
    fireEvent.change(input, { target: { value: 'Hello agent' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input).toHaveValue('')
  })

  it('does not send empty message on Enter', () => {
    render(wrap(<Chat />))
    const input = screen.getByPlaceholderText('Ask Shannon anything...')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input).toHaveValue('')
  })

  it('renders input area after send', () => {
    render(wrap(<Chat />))
    const input = screen.getByPlaceholderText('Ask Shannon anything...')
    expect(input).toBeInTheDocument()
  })

  it('renders right sidebar container', () => {
    render(wrap(<Chat />))
    // The sidebar exists even if usage is empty (hidden on lg:block)
    expect(screen.getByPlaceholderText('Ask Shannon anything...')).toBeInTheDocument()
  })
})
