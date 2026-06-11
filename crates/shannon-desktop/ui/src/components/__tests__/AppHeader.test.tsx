import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppHeader } from '../AppHeader'
import type { PageId } from '../AppSidebar'

describe('AppHeader', () => {
  it('renders Chat title for chat page', () => {
    render(<AppHeader currentPage={'chat' as PageId} />)
    expect(screen.getByText('Chat')).toBeDefined()
  })

  it('renders Scheduled Tasks title for tasks page', () => {
    render(<AppHeader currentPage={'tasks' as PageId} />)
    expect(screen.getByText('Scheduled Tasks')).toBeDefined()
  })

  it('renders Goals title for goals page', () => {
    render(<AppHeader currentPage={'goals' as PageId} />)
    expect(screen.getByText('Goals')).toBeDefined()
  })

  it('renders Settings title for settings pages', () => {
    render(<AppHeader currentPage={'settings-general' as PageId} />)
    expect(screen.getByText('Settings')).toBeDefined()
  })

  it('renders Extensions title for extensions pages', () => {
    render(<AppHeader currentPage={'extensions-skills' as PageId} />)
    expect(screen.getByText('Extensions')).toBeDefined()
  })

  it('renders Projects title for opc page', () => {
    render(<AppHeader currentPage={'opc' as PageId} />)
    expect(screen.getByText('Projects')).toBeDefined()
  })

  it('renders header element', () => {
    const { container } = render(<AppHeader currentPage={'chat' as PageId} />)
    expect(container.querySelector('header')).toBeDefined()
  })

  it('uses fixed positioning', () => {
    const { container } = render(<AppHeader currentPage={'chat' as PageId} />)
    expect(container.querySelector('.fixed')).toBeDefined()
  })
})
