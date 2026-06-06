// Tests for PermissionDialog component
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PermissionDialog } from '../PermissionDialog'

describe('PermissionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockRequest = {
    tool: 'bash',
    input: { command: 'ls' },
    risk: 'medium',
    request_id: 'req-123'
  }

  it('does not render when no request', () => {
    const { container } = render(
      <PermissionDialog onApprove={vi.fn()} onDeny={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders when request is provided', () => {
    const { container } = render(
      <PermissionDialog
        request={mockRequest}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />
    )

    expect(container.textContent).toContain('bash')
  })

  it('calls onApprove when Allow button is clicked', () => {
    const handleApprove = vi.fn()

    const { container } = render(
      <PermissionDialog
        request={mockRequest}
        onApprove={handleApprove}
        onDeny={vi.fn()}
      />
    )

    const allowButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Allow')
    )

    expect(allowButton).toBeDefined()

    if (allowButton) {
      fireEvent.click(allowButton)
      expect(handleApprove).toHaveBeenCalledWith('req-123', false)
    }
  })

  it('calls onDeny when Deny button is clicked', () => {
    const handleDeny = vi.fn()

    const { container } = render(
      <PermissionDialog
        request={mockRequest}
        onApprove={vi.fn()}
        onDeny={handleDeny}
      />
    )

    const denyButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Deny')
    )

    expect(denyButton).toBeDefined()

    if (denyButton) {
      fireEvent.click(denyButton)
      expect(handleDeny).toHaveBeenCalledWith('req-123')
    }
  })

  it('toggles always allow checkbox', () => {
    const { container } = render(
      <PermissionDialog
        request={mockRequest}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />
    )

    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeDefined()
    expect(checkbox).not.toBeChecked()

    if (checkbox) {
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    }
  })

  it('passes always allow state to onApprove', () => {
    const handleApprove = vi.fn()

    const { container } = render(
      <PermissionDialog
        request={mockRequest}
        onApprove={handleApprove}
        onDeny={vi.fn()}
      />
    )

    const checkbox = container.querySelector('input[type="checkbox"]')
    const allowButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Allow')
    )

    if (checkbox && allowButton) {
      fireEvent.click(checkbox)
      fireEvent.click(allowButton)

      expect(handleApprove).toHaveBeenCalledWith('req-123', true)
    }
  })

  it('displays tool input as JSON', () => {
    const requestWithJson = {
      tool: 'bash',
      input: { command: 'ls -la', directory: '/home' },
      risk: 'medium',
      request_id: 'req-json'
    }

    const { container } = render(
      <PermissionDialog
        request={requestWithJson}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />
    )

    expect(container.textContent).toContain('command')
    expect(container.textContent).toContain('ls -la')
  })

  it('displays risk level badge', () => {
    const criticalRequest = {
      tool: 'bash',
      input: { command: 'rm -rf /' },
      risk: 'critical',
      request_id: 'req-456'
    }

    const { container } = render(
      <PermissionDialog
        request={criticalRequest}
        onApprove={vi.fn()}
        onDeny={vi.fn()}
      />
    )

    expect(container.textContent).toContain('critical')
  })
})
