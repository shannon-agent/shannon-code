import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
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
})
