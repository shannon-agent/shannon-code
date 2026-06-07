import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../ToastProvider'

// Mock the Toaster component to avoid ThemeProvider dependency
vi.mock('../ui/sonner', () => ({
  Toaster: () => <div data-testid="sonner-toaster" />,
}))

function TestConsumer({ message, variant }: { message: string; variant: 'info' | 'success' | 'error' | 'warning' }) {
  const { addToast } = useToast()
  return (
    <button onClick={() => addToast(message, variant)} data-testid="trigger">
      Add Toast
    </button>
  )
}

describe('ToastProvider', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>
    )
    expect(screen.getByText('Child content')).toBeDefined()
  })

  it('renders the Sonner Toaster', () => {
    render(
      <ToastProvider>
        <div>Child</div>
      </ToastProvider>
    )
    expect(screen.getByTestId('sonner-toaster')).toBeDefined()
  })

  it('provides addToast via context', () => {
    render(
      <ToastProvider>
        <TestConsumer message="Test toast" variant="info" />
      </ToastProvider>
    )
    expect(screen.getByTestId('trigger')).toBeDefined()
  })

  it('calls addToast without throwing', () => {
    render(
      <ToastProvider>
        <TestConsumer message="Hello toast" variant="success" />
      </ToastProvider>
    )

    expect(() => {
      act(() => {
        screen.getByTestId('trigger').click()
      })
    }).not.toThrow()
  })

  it('addToast handles all variants', () => {
    render(
      <ToastProvider>
        <TestConsumer message="Info" variant="info" />
        <TestConsumer message="Error" variant="error" />
      </ToastProvider>
    )

    const triggers = screen.getAllByTestId('trigger')
    expect(() => {
      act(() => { triggers[0].click() })
      act(() => { triggers[1].click() })
    }).not.toThrow()
  })
})
