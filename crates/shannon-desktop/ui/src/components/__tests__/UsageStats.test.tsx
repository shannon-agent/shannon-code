// Tests for UsageStats component
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UsageStats } from '../UsageStats'

describe('UsageStats', () => {
  it('shows empty state when no usage data', () => {
    render(<UsageStats usage={null} />)
    expect(screen.getByText('No usage data yet')).toBeDefined()
  })

  it('renders total tokens', () => {
    render(<UsageStats usage={{ inputTokens: 1500, outputTokens: 500, costUsd: 0.05 }} />)
    expect(screen.getByText('2.0K')).toBeDefined()
    expect(screen.getByText('tokens')).toBeDefined()
  })

  it('renders cost with dollar sign icon', () => {
    const { container } = render(<UsageStats usage={{ inputTokens: 100, outputTokens: 50, costUsd: 1.23 }} />)
    expect(container.textContent).toContain('$1.23')
  })

  it('formats small cost', () => {
    const { container } = render(<UsageStats usage={{ inputTokens: 100, outputTokens: 50, costUsd: 0.005 }} />)
    expect(container.textContent).toContain('<$0.01')
  })

  it('shows message count when provided', () => {
    render(<UsageStats usage={{ inputTokens: 100, outputTokens: 50, costUsd: 0 }} messageCount={5} />)
    expect(screen.getByText('5')).toBeDefined()
  })

  it('shows session duration when provided', () => {
    render(<UsageStats usage={{ inputTokens: 100, outputTokens: 50, costUsd: 0 }} sessionDuration={90000} />)
    expect(screen.getByText('1m')).toBeDefined()
  })

  it('shows details link', () => {
    render(<UsageStats usage={{ inputTokens: 100, outputTokens: 50, costUsd: 0 }} />)
    expect(screen.getByText('details')).toBeDefined()
  })

  it('formats large token counts', () => {
    render(<UsageStats usage={{ inputTokens: 1500000, outputTokens: 500000, costUsd: 2.5 }} />)
    expect(screen.getByText('2.00M')).toBeDefined()
  })

  it('formats sub-thousand tokens as plain number', () => {
    render(<UsageStats usage={{ inputTokens: 500, outputTokens: 200, costUsd: 0.01 }} />)
    // Total is 700, shown in main view
    const all700 = screen.getAllByText('700')
    expect(all700.length).toBeGreaterThanOrEqual(1)
  })
})
