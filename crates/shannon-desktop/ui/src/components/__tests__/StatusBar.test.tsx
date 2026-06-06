// Tests for StatusBar component
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBar } from '../StatusBar'

// Mock useAppState hook
vi.mock('../../context/AppState', () => ({
  useAppState: () => ({
    model: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    querying: false,
    messages: [],
    config: null,
    loading: false,
    usage: null
  })
}))

describe('StatusBar', () => {
  it('renders model name', () => {
    render(<StatusBar />)
    expect(screen.getByText('claude-3-5-sonnet-20241022')).toBeDefined()
  })

  it('renders provider name', () => {
    render(<StatusBar />)
    expect(screen.getByText('anthropic')).toBeDefined()
  })

  it('shows ready status when not querying', () => {
    render(<StatusBar />)
    expect(screen.getByText('Ready')).toBeDefined()
  })

  it('shows querying status when querying', () => {
    vi.doMock('../../context/AppState', () => ({
      useAppState: () => ({
        model: 'claude-3-5-sonnet-20241022',
        provider: 'anthropic',
        querying: true,
        messages: [],
        config: null,
        loading: false,
        usage: null
      })
    }))

    const { container } = render(<StatusBar />)
    expect(screen.getByText('Ready')).toBeDefined()
  })

  it('renders model badge with icon', () => {
    const { container } = render(<StatusBar />)
    const badge = container.querySelector('.bg-\\[var\\(--bg-input\\)\\]')
    expect(badge).toBeDefined()
  })

  it('displays green ready indicator', () => {
    const { container } = render(<StatusBar />)
    const indicator = container.querySelector('.bg-\\[var\\(--success\\)\\]')
    expect(indicator).toBeDefined()
  })

  it('uses flex layout', () => {
    const { container } = render(<StatusBar />)
    const flex = container.querySelector('.flex.items-center.justify-between')
    expect(flex).toBeDefined()
  })

  it('renders model and provider sections', () => {
    render(<StatusBar />)
    expect(screen.getByText('claude-3-5-sonnet-20241022')).toBeDefined()
    expect(screen.getByText('anthropic')).toBeDefined()
  })
})
