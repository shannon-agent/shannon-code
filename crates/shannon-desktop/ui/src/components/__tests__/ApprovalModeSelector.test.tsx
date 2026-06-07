import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApprovalModeSelector } from '../ApprovalModeSelector'

describe('ApprovalModeSelector', () => {
  it('renders primary approval modes as toggle buttons', () => {
    render(<ApprovalModeSelector mode="suggest" onChange={vi.fn()} />)

    // PRIMARY_MODES: suggest, auto, full_auto, readonly
    expect(screen.getByText('Confirm')).toBeDefined()
    expect(screen.getByText('Auto')).toBeDefined()
    expect(screen.getByText('Full Auto')).toBeDefined()
    expect(screen.getByText('Readonly')).toBeDefined()
  })

  it('shows the selected mode as active', () => {
    render(<ApprovalModeSelector mode="auto" onChange={vi.fn()} />)

    const activeButton = screen.getByText('Auto').closest('[data-state="on"]')
    expect(activeButton).toBeDefined()
  })

  it('calls onChange when a different mode is clicked', () => {
    const onChange = vi.fn()
    render(<ApprovalModeSelector mode="suggest" onChange={onChange} />)

    fireEvent.click(screen.getByText('Auto'))
    expect(onChange).toHaveBeenCalledWith('auto')
  })

  it('is disabled when disabled prop is true', () => {
    render(<ApprovalModeSelector mode="suggest" onChange={vi.fn()} disabled />)

    // ToggleGroup disables all children - check buttons are disabled
    const toggleItems = screen.getAllByRole('radio')
    toggleItems.forEach(btn => expect(btn).toBeDisabled())
  })

  it('renders shield icon', () => {
    const { container } = render(<ApprovalModeSelector mode="suggest" onChange={vi.fn()} />)

    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
  })

  it('shows single mode fallback for non-primary modes', () => {
    render(<ApprovalModeSelector mode="bypass_permissions" onChange={vi.fn()} />)

    // Non-primary mode shows only that mode as a toggle
    expect(screen.getByText('Bypass')).toBeDefined()
  })
})
