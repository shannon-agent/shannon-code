import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import { MemoryRouter } from 'react-router-dom'
import DataSources from '@/components/extensions/DataSources'

function wrap(ui: React.ReactElement) {
  return (
    <AppProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AppProvider>
  )
}

describe('DataSources page', () => {
  it('renders data sources heading', () => {
    render(wrap(<DataSources />))
    expect(screen.getByText('Data Sources')).toBeInTheDocument()
  })

  it('renders add source button', () => {
    render(wrap(<DataSources />))
    expect(screen.getByText('Add Source')).toBeInTheDocument()
  })

  it('renders empty state when no servers', () => {
    render(wrap(<DataSources />))
    expect(screen.getByText('No MCP servers configured.')).toBeInTheDocument()
  })

  it('shows add form when Add Source is clicked', () => {
    render(wrap(<DataSources />))
    fireEvent.click(screen.getByText('Add Source'))
    expect(screen.getByText('Add MCP Server')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Name (e.g. my-server)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Command (e.g. npx my-mcp-server)')).toBeInTheDocument()
  })

  it('hides add form on Cancel', () => {
    render(wrap(<DataSources />))
    fireEvent.click(screen.getByText('Add Source'))
    expect(screen.getByText('Add MCP Server')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Add MCP Server')).not.toBeInTheDocument()
  })

  it('calls addMcpServer on form submit', async () => {
    render(wrap(<DataSources />))
    fireEvent.click(screen.getByText('Add Source'))
    fireEvent.change(screen.getByPlaceholderText('Name (e.g. my-server)'), { target: { value: 'test-server' } })
    fireEvent.change(screen.getByPlaceholderText('Command (e.g. npx my-mcp-server)'), { target: { value: 'npx test' } })
    fireEvent.click(screen.getByText('Add Server'))
    const api = await import('@/lib/tauri-api')
    expect(api.addMcpServer).toHaveBeenCalledWith('test-server', 'npx test', [], {})
  })

  it('renders add new source card', () => {
    render(wrap(<DataSources />))
    expect(screen.getByText('Add New Source')).toBeInTheDocument()
  })
})
