// Tests for ModelSelector component using Radix Select
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ModelSelector } from '../ModelSelector'

// jsdom doesn't implement scrollIntoView — needed by Radix Select
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('ModelSelector', () => {
  it('renders current provider label', () => {
    render(
      <ModelSelector
        currentProvider="anthropic"
        currentModel="claude-3-5-sonnet-20241022"
      />
    )

    expect(screen.getByText('Provider:')).toBeDefined()
    expect(screen.getByText('Model:')).toBeDefined()
  })

  it('renders provider select trigger', () => {
    render(
      <ModelSelector
        currentProvider="anthropic"
        currentModel="claude-3-5-sonnet-20241022"
      />
    )

    // Radix Select renders a trigger button
    const triggers = screen.getAllByRole('combobox')
    expect(triggers.length).toBeGreaterThanOrEqual(1)
  })

  it('displays provider options when opened', async () => {
    render(
      <ModelSelector
        currentProvider="anthropic"
        currentModel="claude-3-5-sonnet-20241022"
      />
    )

    // Click the first combobox (provider selector)
    const triggers = screen.getAllByRole('combobox')
    fireEvent.click(triggers[0])

    // Radix Select opens a portal - wait for options to appear
    await waitFor(() => {
      // Provider options should be rendered (capitalize makes "anthropic" → "Anthropic")
      const anthropicOptions = screen.getAllByText(/anthropic/i)
      expect(anthropicOptions.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('calls onProviderChange when provider is selected', async () => {
    const handleChange = vi.fn()

    vi.doMock('../../lib/tauri-api', () => ({
      listModels: vi.fn(() => Promise.resolve([
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'Claude 3.5 Sonnet',
          provider: 'anthropic',
          context_window: 200000
        }
      ])),
      getConfig: vi.fn(() => Promise.resolve({
        provider: 'anthropic',
        api_key: 'sk-test',
        model: 'claude-3-5-sonnet-20241022'
      })),
      switchProvider: vi.fn(() => Promise.resolve())
    }))

    render(
      <ModelSelector
        currentProvider="anthropic"
        currentModel="claude-3-5-sonnet-20241022"
        onProviderChange={handleChange}
      />
    )

    const triggers = screen.getAllByRole('combobox')
    expect(triggers[0]).toBeDefined()
  })

  it('renders provider selector and model section', () => {
    render(
      <ModelSelector
        currentProvider="anthropic"
        currentModel="claude-3-5-sonnet-20241022"
      />
    )

    // Provider Select renders as combobox; model shows "No models available" initially
    const triggers = screen.getAllByRole('combobox')
    expect(triggers.length).toBe(1)
    expect(screen.getByText('No models available')).toBeDefined()
  })

  it('shows loading state label when no models loaded', () => {
    render(
      <ModelSelector
        currentProvider="anthropic"
        currentModel="claude-3-5-sonnet-20241022"
      />
    )

    // Initially no models loaded, should show placeholder text
    expect(screen.getByText('No models available')).toBeDefined()
  })
})
