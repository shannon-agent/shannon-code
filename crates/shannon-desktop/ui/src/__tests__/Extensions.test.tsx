import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import Extensions from '@/pages/Extensions'

function renderWithRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/*" element={<Extensions />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Extensions', () => {
  it('renders default search placeholder', () => {
    renderWithRoute('/extensions')
    expect(screen.getByPlaceholderText('Search extensions...')).toBeInTheDocument()
  })

  it('does not show CTA on default extensions route', () => {
    renderWithRoute('/extensions')
    expect(screen.queryByText(/Create New Agent/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Add Data Source/)).not.toBeInTheDocument()
  })

  it('renders agents search placeholder on agents route', () => {
    renderWithRoute('/extensions/agents')
    expect(screen.getByPlaceholderText('Search components...')).toBeInTheDocument()
  })

  it('shows Create New Agent CTA on agents route', () => {
    renderWithRoute('/extensions/agents')
    expect(screen.getByText('Create New Agent')).toBeInTheDocument()
  })

  it('renders datasources search placeholder on datasources route', () => {
    renderWithRoute('/extensions/datasources')
    expect(screen.getByPlaceholderText('Search knowledge...')).toBeInTheDocument()
  })

  it('shows Add Data Source CTA on datasources route', () => {
    renderWithRoute('/extensions/datasources')
    expect(screen.getByText('Add Data Source')).toBeInTheDocument()
  })

  // US-EXT-05: Search Extensions
  it('updates search input value on typing', () => {
    renderWithRoute('/extensions')
    const input = screen.getByPlaceholderText('Search extensions...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'my query' } })
    expect(input.value).toBe('my query')
  })

  it('updates search on agents route', () => {
    renderWithRoute('/extensions/agents')
    const input = screen.getByPlaceholderText('Search components...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'agent1' } })
    expect(input.value).toBe('agent1')
  })

  // CTA button navigation
  it('Create New Agent CTA has add icon', () => {
    renderWithRoute('/extensions/agents')
    const btn = screen.getByText('Create New Agent').closest('button')!
    expect(btn.querySelector('.material-symbols-outlined')?.textContent).toBe('add')
  })

  it('Add Data Source CTA has add_circle icon', () => {
    renderWithRoute('/extensions/datasources')
    const btn = screen.getByText('Add Data Source').closest('button')!
    expect(btn.querySelector('.material-symbols-outlined')?.textContent).toBe('add_circle')
  })
})
