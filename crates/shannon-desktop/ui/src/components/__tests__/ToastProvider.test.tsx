import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ToastProvider, useToast } from '../ToastProvider'

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

  it('provides addToast via context', () => {
    render(
      <ToastProvider>
        <TestConsumer message="Test toast" variant="info" />
      </ToastProvider>
    )
    expect(screen.getByTestId('trigger')).toBeDefined()
  })

  it('shows toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestConsumer message="Hello toast" variant="success" />
      </ToastProvider>
    )

    act(() => {
      screen.getByTestId('trigger').click()
    })

    expect(screen.getByText('Hello toast')).toBeDefined()
  })

  it('renders multiple toasts', () => {
    render(
      <ToastProvider>
        <TestConsumer message="First" variant="info" />
        <TestConsumer message="Second" variant="error" />
      </ToastProvider>
    )

    const triggers = screen.getAllByTestId('trigger')
    act(() => { triggers[0].click() })
    act(() => { triggers[1].click() })

    expect(screen.getByText('First')).toBeDefined()
    expect(screen.getByText('Second')).toBeDefined()
  })
})
