// Tests for PermissionDialog component
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PermissionDialog } from '../PermissionDialog'

// Mock the tauri-api module
vi.mock('../../lib/tauri-api', () => ({
  respondPermission: vi.fn(() => Promise.resolve()),
}))

import { respondPermission } from '../../lib/tauri-api'
const mockedRespondPermission = vi.mocked(respondPermission)

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
    const { container } = render(<PermissionDialog />)
    expect(container.firstChild).toBeNull()
  })

  it('renders when request is provided', () => {
    const { container } = render(<PermissionDialog request={mockRequest} />)
    expect(container.textContent).toContain('bash')
  })

  it('calls respondPermission(true) when Allow button is clicked', async () => {
    const { container } = render(<PermissionDialog request={mockRequest} />)

    const allowButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Allow')
    )

    expect(allowButton).toBeDefined()

    if (allowButton) {
      fireEvent.click(allowButton)
      await vi.waitFor(() => {
        expect(mockedRespondPermission).toHaveBeenCalledWith('req-123', true)
      })
    }
  })

  it('calls respondPermission(false) when Deny button is clicked', async () => {
    const { container } = render(<PermissionDialog request={mockRequest} />)

    const denyButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Deny')
    )

    expect(denyButton).toBeDefined()

    if (denyButton) {
      fireEvent.click(denyButton)
      await vi.waitFor(() => {
        expect(mockedRespondPermission).toHaveBeenCalledWith('req-123', false)
      })
    }
  })

  it('toggles always allow checkbox', () => {
    const { container } = render(<PermissionDialog request={mockRequest} />)

    const checkbox = container.querySelector('input[type="checkbox"]')
    expect(checkbox).toBeDefined()
    expect(checkbox).not.toBeChecked()

    if (checkbox) {
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    }
  })

  it('displays tool input as JSON', () => {
    const requestWithJson = {
      tool: 'bash',
      input: { command: 'ls -la', directory: '/home' },
      risk: 'medium',
      request_id: 'req-json'
    }

    const { container } = render(<PermissionDialog request={requestWithJson} />)
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

    const { container } = render(<PermissionDialog request={criticalRequest} />)
    expect(container.textContent).toContain('critical')
  })
})
