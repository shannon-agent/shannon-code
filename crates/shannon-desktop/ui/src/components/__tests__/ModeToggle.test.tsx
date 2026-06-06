// Tests for ModeToggle component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModeToggle } from '../ModeToggle'
import type { AgentMode } from '../ModeToggle'

describe('ModeToggle', () => {
  it('renders both mode buttons', () => {
    render(<ModeToggle mode="act" onChange={vi.fn()} />)
    expect(screen.getByText('Plan')).toBeDefined()
    expect(screen.getByText('Act')).toBeDefined()
  })

  it('highlights active mode', () => {
    render(<ModeToggle mode="plan" onChange={vi.fn()} />)
    const planBtn = screen.getByText('Plan').closest('button')!
    expect(planBtn.className).toContain('warning')
  })

  it('calls onChange when clicking inactive mode', () => {
    const handleChange = vi.fn()
    render(<ModeToggle mode="act" onChange={handleChange} />)

    fireEvent.click(screen.getByText('Plan'))
    expect(handleChange).toHaveBeenCalledWith('plan')
  })

  it('does not call onChange when clicking active mode', () => {
    const handleChange = vi.fn()
    render(<ModeToggle mode="act" onChange={handleChange} />)

    fireEvent.click(screen.getByText('Act'))
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('shows correct active styles for act mode', () => {
    render(<ModeToggle mode="act" onChange={vi.fn()} />)
    const actBtn = screen.getByText('Act').closest('button')!
    expect(actBtn.className).toContain('accent')
  })

  it('disables buttons when disabled prop is true', () => {
    render(<ModeToggle mode="act" onChange={vi.fn()} disabled />)
    const planBtn = screen.getByText('Plan').closest('button')!
    const actBtn = screen.getByText('Act').closest('button')!
    expect(planBtn).toBeDisabled()
    expect(actBtn).toBeDisabled()
    expect(planBtn.className).toContain('disabled:opacity-40')
    expect(actBtn.className).toContain('disabled:opacity-40')
  })

  it('has accessible titles', () => {
    render(<ModeToggle mode="act" onChange={vi.fn()} />)
    expect(screen.getByTitle('Read-only analysis')).toBeDefined()
    expect(screen.getByTitle('Execute changes')).toBeDefined()
  })
})
