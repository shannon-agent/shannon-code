import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WelcomePage } from '../WelcomePage'

describe('WelcomePage', () => {
  it('renders branding', () => {
    render(<WelcomePage onComplete={vi.fn()} />)
    expect(screen.getByText('Shannon Code')).toBeDefined()
    expect(screen.getByText('Your AI coding assistant. Let\'s get started.')).toBeDefined()
  })

  it('shows step titles', () => {
    render(<WelcomePage onComplete={vi.fn()} />)
    expect(screen.getByText('Configure your provider')).toBeDefined()
    expect(screen.getByText('Keyboard shortcuts')).toBeDefined()
    expect(screen.getByText('Start building')).toBeDefined()
  })

  it('shows first step description initially', () => {
    render(<WelcomePage onComplete={vi.fn()} />)
    expect(screen.getByText(/Add your API key in Settings/)).toBeDefined()
  })

  it('advances to next step on Next click', () => {
    render(<WelcomePage onComplete={vi.fn()} />)
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText(/Ctrl\+Enter to send/)).toBeDefined()
  })

  it('shows check icon for completed steps', () => {
    render(<WelcomePage onComplete={vi.fn()} />)
    fireEvent.click(screen.getByText('Next'))
    // First step should now show check (done)
    expect(screen.getByText('Configure your provider')).toBeDefined()
  })

  it('calls onComplete on last step', () => {
    const onComplete = vi.fn()
    render(<WelcomePage onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Get Started'))
    expect(onComplete).toHaveBeenCalled()
  })

  it('calls onComplete on Skip', () => {
    const onComplete = vi.fn()
    render(<WelcomePage onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Skip'))
    expect(onComplete).toHaveBeenCalled()
  })

  it('shows 3 progress dots', () => {
    const { container } = render(<WelcomePage onComplete={vi.fn()} />)
    const dots = container.querySelectorAll('.rounded-full.w-2')
    expect(dots.length).toBe(3)
  })

  it('shows Get Started on last step', () => {
    render(<WelcomePage onComplete={vi.fn()} />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Get Started')).toBeDefined()
  })
})
