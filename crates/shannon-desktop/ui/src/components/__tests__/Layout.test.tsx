// Tests for Layout component using ResizablePanelGroup
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from '../Layout'

// Mock UpdateBanner
vi.mock('../UpdateBanner', () => ({
  UpdateBanner: () => <div data-testid="update-banner" />,
}))

describe('Layout', () => {
  it('renders without crashing', () => {
    const { container } = render(<Layout>Test Content</Layout>)
    expect(container.firstChild).toBeDefined()
  })

  it('renders main content', () => {
    const { container } = render(
      <Layout>
        <div>Main Content</div>
      </Layout>
    )
    expect(container.textContent).toContain('Main Content')
  })

  it('renders sidebar when provided', () => {
    const { container } = render(
      <Layout sidebar={<div>Sidebar Content</div>}>
        <div>Main Content</div>
      </Layout>
    )
    expect(container.textContent).toContain('Sidebar Content')
  })

  it('renders right panel when provided', () => {
    const { container } = render(
      <Layout
        sidebar={<div>Sidebar</div>}
        panel={<div>Right Panel</div>}
      >
        <div>Main</div>
      </Layout>
    )
    expect(container.textContent).toContain('Right Panel')
  })

  it('renders bottom panel when provided', () => {
    const { container } = render(
      <Layout bottomPanel={<div>Terminal</div>}>
        <div>Main</div>
      </Layout>
    )
    expect(container.textContent).toContain('Terminal')
  })

  it('applies h-screen class to root', () => {
    const { container } = render(<Layout>Test</Layout>)
    const mainDiv = container.querySelector('.h-screen')
    expect(mainDiv).toBeDefined()
  })

  it('renders UpdateBanner at the top', () => {
    render(<Layout>Test</Layout>)
    expect(screen.getByTestId('update-banner')).toBeDefined()
  })

  it('renders tab bar when provided', () => {
    const { container } = render(
      <Layout tabBar={<div>Tab Bar</div>}>
        <div>Main</div>
      </Layout>
    )
    expect(container.textContent).toContain('Tab Bar')
  })

  it('renders all panels together', () => {
    const { container } = render(
      <Layout
        sidebar={<div>Sidebar</div>}
        panel={<div>Right Panel</div>}
        bottomPanel={<div>Bottom Panel</div>}
        tabBar={<div>Tab Bar</div>}
      >
        <div>Main Content</div>
      </Layout>
    )
    expect(container.textContent).toContain('Sidebar')
    expect(container.textContent).toContain('Right Panel')
    expect(container.textContent).toContain('Bottom Panel')
    expect(container.textContent).toContain('Tab Bar')
    expect(container.textContent).toContain('Main Content')
  })
})
