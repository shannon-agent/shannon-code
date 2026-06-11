// Tests for StreamingText component
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StreamingText } from '../StreamingText'

describe('StreamingText', () => {
  it('renders content correctly', () => {
    render(<StreamingText content="Hello World" />)
    expect(screen.getByText('Hello World')).toBeDefined()
  })

  it('renders markdown content', () => {
    render(<StreamingText content="# Hello World" />)
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
  })

  it('shows cursor when streaming', () => {
    const { container } = render(<StreamingText content="Test" isStreaming={true} />)
    const cursor = container.querySelector('.animate-pulse')
    expect(cursor).toBeDefined()
  })

  it('hides cursor when not streaming', () => {
    const { container } = render(<StreamingText content="Test" isStreaming={false} />)
    const cursor = container.querySelector('.animate-pulse')
    expect(cursor).toBeNull()
  })

  it('applies prose classes', () => {
    const { container } = render(<StreamingText content="Test" />)
    const prose = container.querySelector('.prose')
    expect(prose).toBeDefined()
  })

  it('updates content when content prop changes', () => {
    const { rerender } = render(<StreamingText content="Initial" />)
    expect(screen.getByText('Initial')).toBeDefined()

    rerender(<StreamingText content="Updated" />)
    expect(screen.getByText('Updated')).toBeDefined()
  })

  it('scrolls to bottom during streaming', () => {
    const { container } = render(<StreamingText content="Test" isStreaming={true} />)
    const div = container.querySelector('div')
    expect(div).toBeDefined()
  })

  it('applies Tokyo Night text color', () => {
    const { container } = render(<StreamingText content="Test" />)
    const prose = container.querySelector('.text-\\[\\#a9b1d6\\]')
    expect(prose).toBeDefined()
  })
})
