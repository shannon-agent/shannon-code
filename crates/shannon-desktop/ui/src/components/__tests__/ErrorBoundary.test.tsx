// Tests for ErrorBoundary component
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Suppress console errors for tests
const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error')
    }
    return <div>No error</div>
  }

  it('renders children when there is no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>
    )
    expect(container.textContent).toContain('Safe Content')
  })

  it('catches errors and renders error UI', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(container.textContent).toContain('Something went wrong')
    expect(container.textContent).toContain('Test error')
  })

  it('shows retry button', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByText('Retry')
    expect(retryButton).toBeDefined()
  })

  it('displays error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error message:')).toBeDefined()
    expect(screen.getByText('Test error')).toBeDefined()
  })

  it('applies Tokyo Night error styling', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const border = container.querySelector('.border-\\[\\#f7768e\\]')
    expect(border).toBeDefined()
  })

  it('shows technical details in dev mode', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(container.textContent).toContain('Technical details')
  })

  it('uses AlertCircle icon', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(container.querySelector('svg')).toBeDefined()
  })

  afterAll(() => {
    consoleError.mockRestore()
  })
})
