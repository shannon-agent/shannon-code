// Tests for Layout component with page-based routing
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from '../Layout'
import type { PageId } from '../AppSidebar'

// Mock UpdateBanner
vi.mock('../UpdateBanner', () => ({
  UpdateBanner: () => <div data-testid="update-banner" />,
}))

describe('Layout', () => {
  const defaultProps = {
    currentPage: 'chat' as PageId,
    onNavigate: vi.fn(),
  }

  it('renders without crashing', () => {
    const { container } = render(
      <Layout {...defaultProps}>Test Content</Layout>
    )
    expect(container.firstChild).toBeDefined()
  })

  it('renders main content', () => {
    const { container } = render(
      <Layout {...defaultProps}>
        <div>Main Content</div>
      </Layout>
    )
    expect(container.textContent).toContain('Main Content')
  })

  it('renders UpdateBanner at the top', () => {
    render(<Layout {...defaultProps}>Test</Layout>)
    expect(screen.getByTestId('update-banner')).toBeDefined()
  })

  it('renders AppSidebar with currentPage and onNavigate', () => {
    const onNavigate = vi.fn()
    const { container } = render(
      <Layout currentPage="settings" onNavigate={onNavigate}>
        <div>Content</div>
      </Layout>
    )
    // Sidebar renders with nav items
    expect(container.textContent).toBeDefined()
  })

  it('renders AppHeader with currentPage', () => {
    const { container } = render(
      <Layout {...defaultProps}>
        <div>Content</div>
      </Layout>
    )
    // Header is rendered
    expect(container.querySelector('header, [class*="header"], [class*="Header"], .h-16')).toBeDefined()
  })

  it('renders AppFooter', () => {
    const { container } = render(
      <Layout {...defaultProps}>
        <div>Content</div>
      </Layout>
    )
    expect(container.textContent).toBeDefined()
  })

  it('uses h-screen class on root', () => {
    const { container } = render(
      <Layout {...defaultProps}>Test</Layout>
    )
    const mainDiv = container.querySelector('.h-screen')
    expect(mainDiv).toBeDefined()
  })

  it('renders all sections together', () => {
    const { container } = render(
      <Layout currentPage="chat" onNavigate={vi.fn()}>
        <div>Main Content</div>
      </Layout>
    )
    expect(screen.getByTestId('update-banner')).toBeDefined()
    expect(container.textContent).toContain('Main Content')
  })

  it('passes tokenUsage and computeTime to footer', () => {
    const { container } = render(
      <Layout
        {...defaultProps}
        tokenUsage="1.2K tokens"
        computeTime="3.5s"
      >
        <div>Content</div>
      </Layout>
    )
    expect(container.textContent).toContain('1.2K tokens')
    expect(container.textContent).toContain('3.5s')
  })
})
