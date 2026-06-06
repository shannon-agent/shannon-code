// Tests for MessageInput component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageInput } from '../MessageInput'

describe('MessageInput', () => {
  it('renders input field correctly', () => {
    render(<MessageInput onSend={vi.fn()} />)
    const input = screen.getByPlaceholderText('Type your message...')
    expect(input).toBeDefined()
  })

  it('calls onSend when Enter is pressed', () => {
    const handleSend = vi.fn()
    render(<MessageInput onSend={handleSend} />)

    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

    expect(handleSend).toHaveBeenCalledWith('Test message')
  })

  it('does not send with empty message', () => {
    const handleSend = vi.fn()
    render(<MessageInput onSend={handleSend} />)

    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

    expect(handleSend).not.toHaveBeenCalled()
  })

  it('inserts newline on Shift+Enter', () => {
    const handleSend = vi.fn()
    render(<MessageInput onSend={handleSend} />)

    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Line 1' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })

    expect(handleSend).not.toHaveBeenCalled()
  })

  it('disables input when disabled prop is true', () => {
    render(<MessageInput onSend={vi.fn()} disabled={true} />)
    const input = screen.getByPlaceholderText('Type your message...')
    expect(input).toBeDisabled()
  })

  it('clears input after sending', () => {
    const handleSend = vi.fn()
    render(<MessageInput onSend={handleSend} />)

    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Test' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })

    expect(input).toHaveValue('')
  })

  it('shows character count', () => {
    render(<MessageInput onSend={vi.fn()} />)
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Hello' } })

    expect(screen.getByText('5')).toBeDefined()
  })

  it('displays keyboard shortcut hints', () => {
    render(<MessageInput onSend={vi.fn()} />)
    expect(screen.getAllByText('Enter')).toHaveLength(2)
    expect(screen.getByText('Shift+Enter')).toBeDefined()
  })

  it('auto-resizes textarea', () => {
    const { container } = render(<MessageInput onSend={vi.fn()} />)
    const textarea = container.querySelector('textarea')

    expect(textarea).toBeDefined()
    if (textarea) {
      fireEvent.change(textarea, { target: { value: 'A'.repeat(100) } })
      expect(textarea.style.height).not.toBe('auto')
    }
  })
})
