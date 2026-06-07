// Tests for ModeToggle component using ToggleGroup
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ModeToggle } from '../ModeToggle'

describe('ModeToggle', () => {
  it('renders both mode buttons', () => {
    render(<ModeToggle mode="act" onChange={vi.fn()} />)
    expect(screen.getByText('Plan')).toBeDefined()
    expect(screen.getByText('Act')).toBeDefined()
  })

  it('calls onChange when clicking inactive mode', () => {
    const handleChange = vi.fn()
    render(<ModeToggle mode="act" onChange={handleChange} />)

    fireEvent.click(screen.getByText('Plan'))
    expect(handleChange).toHaveBeenCalledWith('plan')
  })

  it('has accessible titles', () => {
    render(<ModeToggle mode="act" onChange={vi.fn()} />)
    expect(screen.getByTitle('Read-only analysis')).toBeDefined()
    expect(screen.getByTitle('Execute changes')).toBeDefined()
  })

  it('renders Plan and Act text labels', () => {
    render(<ModeToggle mode="plan" onChange={vi.fn()} />)
    expect(screen.getByText('Plan')).toBeDefined()
    expect(screen.getByText('Act')).toBeDefined()
  })
})
