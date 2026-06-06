import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApprovalModeSelector } from '../ApprovalModeSelector'

describe('ApprovalModeSelector', () => {
  it('renders all approval modes as options', () => {
    render(<ApprovalModeSelector mode="suggest" onChange={vi.fn()} />)

    const select = screen.getByTitle('Approval mode for tool execution')
    expect(select).toBeDefined()

    const options = select.querySelectorAll('option')
    expect(options.length).toBe(10)
  })

  it('shows the selected mode', () => {
    render(<ApprovalModeSelector mode="auto" onChange={vi.fn()} />)

    const select = screen.getByTitle('Approval mode for tool execution') as HTMLSelectElement
    expect(select.value).toBe('auto')
  })

  it('calls onChange when a different mode is selected', () => {
    const onChange = vi.fn()
    render(<ApprovalModeSelector mode="suggest" onChange={onChange} />)

    const select = screen.getByTitle('Approval mode for tool execution')
    fireEvent.change(select, { target: { value: 'plan' } })

    expect(onChange).toHaveBeenCalledWith('plan')
  })

  it('is disabled when disabled prop is true', () => {
    render(<ApprovalModeSelector mode="suggest" onChange={vi.fn()} disabled />)

    const select = screen.getByTitle('Approval mode for tool execution') as HTMLSelectElement
    expect(select.disabled).toBe(true)
  })

  it('renders shield icon', () => {
    const { container } = render(<ApprovalModeSelector mode="suggest" onChange={vi.fn()} />)

    const svg = container.querySelector('svg')
    expect(svg).toBeDefined()
  })

  it('contains expected mode labels', () => {
    render(<ApprovalModeSelector mode="suggest" onChange={vi.fn()} />)

    const select = screen.getByTitle('Approval mode for tool execution')
    const optionTexts = Array.from(select.querySelectorAll('option')).map(o => o.textContent)

    expect(optionTexts).toContain('Auto')
    expect(optionTexts).toContain('Plan')
    expect(optionTexts).toContain('Full Auto')
    expect(optionTexts).toContain('Readonly')
    expect(optionTexts).toContain('Bypass')
  })
})
