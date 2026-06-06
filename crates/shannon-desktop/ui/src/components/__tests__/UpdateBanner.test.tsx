import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UpdateBanner } from '../UpdateBanner'

describe('UpdateBanner', () => {
  it('renders nothing when no update is available', () => {
    const { container } = render(<UpdateBanner />)
    expect(container.innerHTML).toBe('')
  })

  it('has correct component structure', () => {
    // Component renders null initially (no update event fired)
    const { container } = render(<UpdateBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('does not crash without Tauri context', () => {
    expect(() => render(<UpdateBanner />)).not.toThrow()
  })
})
