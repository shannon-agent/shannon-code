// Tests for StatusBar component including ContextUsageIndicator
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBar } from '../StatusBar'

// Mock UsageStats component
vi.mock('../UsageStats', () => ({
  UsageStats: () => <div data-testid="usage-stats" />,
}))

// Default mock factory
const mockAppState = {
  model: 'claude-3-5-sonnet-20241022',
  provider: 'anthropic',
  querying: false,
  messages: [],
  config: null,
  loading: false,
  usage: null,
}

vi.mock('../../context/AppState', () => ({
  useAppState: () => mockAppState,
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

  it('renders UsageStats', () => {
    render(<StatusBar />)
    expect(screen.getByTestId('usage-stats')).toBeDefined()
  })

  describe('ContextUsageIndicator', () => {
    it('shows 0% when usage is null', () => {
      mockAppState.usage = null
      render(<StatusBar />)
      expect(screen.getByText('0%')).toBeDefined()
    })

    it('shows percentage based on token usage', () => {
      mockAppState.usage = { inputTokens: 40000, outputTokens: 40000 }
      render(<StatusBar />)
      expect(screen.getByText('40%')).toBeDefined()
    })

    it('renders context usage bar with correct percentage', () => {
      mockAppState.usage = { inputTokens: 50000, outputTokens: 30000 }
      render(<StatusBar />)
      // The percentage text should be visible
      expect(screen.getByText('40%')).toBeDefined()
    })
  })

  it('shows querying status when querying', () => {
    mockAppState.querying = true
    render(<StatusBar />)
    expect(screen.getByText('Querying')).toBeDefined()
    mockAppState.querying = false
  })
})
