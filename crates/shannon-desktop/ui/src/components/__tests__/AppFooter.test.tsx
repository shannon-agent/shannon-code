import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppFooter } from '../AppFooter'

describe('AppFooter', () => {
  it('renders footer element', () => {
    const { container } = render(<AppFooter />)
    expect(container.querySelector('footer')).toBeDefined()
  })

  it('renders nothing when no props given', () => {
    const { container } = render(<AppFooter />)
    expect(container.querySelector('footer')).toBeDefined()
  })

  it('renders token usage', () => {
    render(<AppFooter tokenUsage="1.2K tokens" />)
    expect(screen.getByText(/1.2K tokens/)).toBeDefined()
  })

  it('renders compute time', () => {
    render(<AppFooter computeTime="3.5s" />)
    expect(screen.getByText(/3.5s/)).toBeDefined()
  })

  it('renders both usage and compute separated by pipe', () => {
    render(<AppFooter tokenUsage="1.2K tokens" computeTime="3.5s" />)
    expect(screen.getByText(/1.2K tokens/)).toBeDefined()
    expect(screen.getByText(/3.5s/)).toBeDefined()
  })

  it('renders active agents', () => {
    render(<AppFooter activeAgents={['researcher', 'engineer']} />)
    expect(screen.getByText(/researcher, engineer/)).toBeDefined()
  })

  it('renders Active Agents label with pulse indicator', () => {
    render(<AppFooter activeAgents={['agent-1']} />)
    expect(screen.getByText(/Active Agents/)).toBeDefined()
  })

  it('does not render agents section when empty array', () => {
    const { container } = render(<AppFooter activeAgents={[]} />)
    expect(container.textContent).not.toContain('Active Agents')
  })

  it('uses fixed positioning at bottom', () => {
    const { container } = render(<AppFooter />)
    expect(container.querySelector('.fixed.bottom-0')).toBeDefined()
  })
})
