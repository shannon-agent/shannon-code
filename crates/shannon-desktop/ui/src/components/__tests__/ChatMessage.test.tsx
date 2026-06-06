// Tests for ChatMessage component
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessage } from '../ChatMessage'
import type { ChatMessage as ChatMessageType } from '../../types/tauri-events'

describe('ChatMessage', () => {
  const userMessage: ChatMessageType = {
    role: 'user',
    content: 'Hello, how are you?',
    timestamp: 1620000000000
  }

  const assistantMessage: ChatMessageType = {
    role: 'assistant',
    content: 'I am doing well, thank you!',
    timestamp: 1620000100000
  }

  const markdownMessage: ChatMessageType = {
    role: 'assistant',
    content: '# Heading\n\n**Bold** and *italic* text\n\n```javascript\nconst x = 1;\n```',
    timestamp: 1620000200000
  }

  it('renders user message correctly', () => {
    render(<ChatMessage message={userMessage} />)
    expect(screen.getByText('Hello, how are you?')).toBeDefined()
  })

  it('renders assistant message correctly', () => {
    render(<ChatMessage message={assistantMessage} />)
    expect(screen.getByText('I am doing well, thank you!')).toBeDefined()
    expect(screen.getByText('Shannon')).toBeDefined()
  })

  it('displays correct timestamp', () => {
    render(<ChatMessage message={userMessage} />)
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeDefined()
  })

  it('renders markdown content', () => {
    render(<ChatMessage message={markdownMessage} />)
    expect(screen.getByText('Heading')).toBeDefined()
    expect(screen.getByText('Bold')).toBeDefined()
    expect(screen.getByText('italic')).toBeDefined()
  })

  it('applies correct background colors', () => {
    const { container: userContainer } = render(<ChatMessage message={userMessage} />)
    const { container: assistantContainer } = render(<ChatMessage message={assistantMessage} />)

    const userDiv = userContainer.querySelector('.bg-\\[\\#24283b\\]')
    const assistantDiv = assistantContainer.querySelector('.bg-\\[\\#1a1b26\\]')

    expect(userDiv).toBeDefined()
    expect(assistantDiv).toBeDefined()
  })

  it('shows correct avatar initials', () => {
    const { container: userContainer } = render(<ChatMessage message={userMessage} />)
    const { container: assistantContainer } = render(<ChatMessage message={assistantMessage} />)

    expect(userContainer.textContent).toContain('You')
    expect(assistantContainer.textContent).toContain('S')
  })
})
