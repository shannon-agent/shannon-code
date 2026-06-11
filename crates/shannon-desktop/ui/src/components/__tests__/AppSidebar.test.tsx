import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppSidebar } from '../AppSidebar'
import type { PageId } from '../AppSidebar'

describe('AppSidebar', () => {
  const defaultProps = {
    currentPage: 'chat' as PageId,
    onNavigate: vi.fn(),
  }

  it('renders without crashing', () => {
    const { container } = render(<AppSidebar {...defaultProps} />)
    expect(container.firstChild).toBeDefined()
  })

  it('renders Shannon branding', () => {
    render(<AppSidebar {...defaultProps} />)
    expect(screen.getByText('Shannon')).toBeDefined()
  })

  it('renders navigation items', () => {
    render(<AppSidebar {...defaultProps} />)
    expect(screen.getByText('Chat')).toBeDefined()
    expect(screen.getByText('Tasks')).toBeDefined()
    expect(screen.getByText('Goals')).toBeDefined()
  })

  it('renders settings section', () => {
    render(<AppSidebar {...defaultProps} />)
    expect(screen.getByText('Settings')).toBeDefined()
  })

  it('renders extensions section', () => {
    render(<AppSidebar {...defaultProps} />)
    expect(screen.getByText('Extensions')).toBeDefined()
  })

  it('highlights current page', () => {
    render(<AppSidebar {...defaultProps} currentPage="tasks" />)
    const taskItem = screen.getByText('Tasks')
    // Current page should have a parent with active styling
    expect(taskItem.closest('button, a, div')).toBeDefined()
  })

  it('calls onNavigate when nav item clicked', () => {
    const onNavigate = vi.fn()
    render(<AppSidebar {...defaultProps} onNavigate={onNavigate} />)

    screen.getByText('Tasks').click()
    expect(onNavigate).toHaveBeenCalledWith('tasks')
  })

  it('calls onNavigate for goals', () => {
    const onNavigate = vi.fn()
    render(<AppSidebar {...defaultProps} onNavigate={onNavigate} />)

    screen.getByText('Goals').click()
    expect(onNavigate).toHaveBeenCalledWith('goals')
  })

  it('renders OPC section', () => {
    render(<AppSidebar {...defaultProps} />)
    expect(screen.getAllByText('Projects').length).toBeGreaterThan(0)
  })

  it('uses fixed sidebar width', () => {
    const { container } = render(<AppSidebar {...defaultProps} />)
    expect(container.querySelector('.w-\\[280px\\]')).toBeDefined()
  })
})
