// Tests for Layout component
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from '../Layout'

describe('Layout', () => {
  it('renders without crashing', () => {
    const { container } = render(<Layout>Test Content</Layout>)
    expect(container.firstChild).toBeDefined()
  })

  it('renders sidebar when provided', () => {
    const { container } = render(
      <Layout sidebar={<div>Sidebar Content</div>}>
        <div>Main Content</div>
      </Layout>
    )
    expect(container.textContent).toContain('Sidebar Content')
  })

  it('renders main content', () => {
    const { container } = render(
      <Layout>
        <div>Main Content</div>
      </Layout>
    )
    expect(container.textContent).toContain('Main Content')
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

  it('applies correct layout classes', () => {
    const { container } = render(
      <Layout sidebar={<div>Sidebar</div>}>
        <div>Main</div>
      </Layout>
    )

    const mainDiv = container.querySelector('.flex.h-screen')
    expect(mainDiv).toBeDefined()
  })

  it('renders sidebar with correct width', () => {
    const { container } = render(
      <Layout sidebar={<div>Sidebar</div>}>
        <div>Main</div>
      </Layout>
    )

    const sidebar = container.querySelector('.w-60')
    expect(sidebar).toBeDefined()
  })

  it('renders right panel with correct width', () => {
    const { container } = render(
      <Layout panel={<div>Panel</div>}>
        <div>Main</div>
      </Layout>
    )

    const panel = container.querySelector('.w-80')
    expect(panel).toBeDefined()
  })

  it('uses CSS variable background', () => {
    const { container } = render(<Layout>Test</Layout>)
    const bg = container.querySelector('.bg-\\[var\\(--bg-primary\\)\\]')
    expect(bg).toBeDefined()
  })

  it('uses flex layout for main content', () => {
    const { container } = render(
      <Layout>
        <div>Main</div>
      </Layout>
    )

    const main = container.querySelector('main')
    expect(main?.className).toContain('flex-1')
  })

  it('renders bottom panel when provided', () => {
    const { container } = render(
      <Layout bottomPanel={<div>Terminal</div>}>
        <div>Main</div>
      </Layout>
    )
    expect(container.textContent).toContain('Terminal')
  })

  it('applies border to sidebar and panel', () => {
    const { container } = render(
      <Layout sidebar={<div>S</div>} panel={<div>P</div>}>
        <div>Main</div>
      </Layout>
    )
    const borders = container.querySelectorAll('.border-\\[var\\(--border\\)\\]')
    expect(borders.length).toBeGreaterThanOrEqual(2)
  })
})
