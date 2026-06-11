import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataSourcesContent } from '../PageRouter'

// Mock the tauri-api imports
vi.mock('../../lib/tauri-api', () => ({
  listMcpServers: vi.fn(() => Promise.resolve([
    { name: 'filesystem', command: 'npx fs-server', enabled: true, connected: true, tool_count: 5, tools: [], last_connected: null },
    { name: 'database', command: 'npx db-server', enabled: true, connected: false, tool_count: 3, tools: [], last_connected: null },
  ])),
  addMcpServer: vi.fn(() => Promise.resolve(
    { name: 'new-server', command: 'test-cmd', enabled: true, connected: false, tool_count: 0, tools: [], last_connected: null }
  )),
  removeMcpServer: vi.fn(() => Promise.resolve(true)),
  restartMcpServer: vi.fn(() => Promise.resolve(
    { name: 'filesystem', command: 'npx fs-server', enabled: true, connected: true, tool_count: 5, tools: [], last_connected: null }
  )),
}))

describe('DataSourcesContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Data Sources heading', async () => {
    render(<DataSourcesContent />)
    expect(screen.getByText('Data Sources')).toBeDefined()
  })

  it('shows loading state then servers', async () => {
    render(<DataSourcesContent />)
    await waitFor(() => {
      expect(screen.getAllByText('filesystem').length).toBeGreaterThan(0)
      expect(screen.getByText('database')).toBeDefined()
    })
  })

  it('shows Add Server button', async () => {
    render(<DataSourcesContent />)
    expect(screen.getByText('+ Add Server')).toBeDefined()
  })

  it('opens add form when Add Server clicked', async () => {
    render(<DataSourcesContent />)
    fireEvent.click(screen.getByText('+ Add Server'))
    expect(screen.getByText('Add MCP Server')).toBeDefined()
    expect(screen.getByPlaceholderText(/Server name/)).toBeDefined()
  })

  it('calls addMcpServer when form submitted', async () => {
    const { addMcpServer } = await import('../../lib/tauri-api')
    render(<DataSourcesContent />)

    fireEvent.click(screen.getByText('+ Add Server'))
    fireEvent.change(screen.getByPlaceholderText(/Server name/), { target: { value: 'test-server' } })
    fireEvent.change(screen.getByPlaceholderText(/Command/), { target: { value: 'npx test-cmd' } })
    fireEvent.click(screen.getByText('Add'))

    await waitFor(() => {
      expect(addMcpServer).toHaveBeenCalledWith('test-server', 'npx test-cmd', [], {})
    })
  })

  it('shows restart and delete buttons for servers', async () => {
    render(<DataSourcesContent />)
    await waitFor(() => {
      expect(screen.getAllByText('filesystem').length).toBeGreaterThan(0)
    })
    const restartButtons = screen.getAllByTitle('Restart server')
    const deleteButtons = screen.getAllByTitle('Remove server')
    expect(restartButtons.length).toBeGreaterThan(0)
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('calls restartMcpServer when restart clicked', async () => {
    const { restartMcpServer } = await import('../../lib/tauri-api')
    render(<DataSourcesContent />)

    await waitFor(() => {
      expect(screen.getAllByText('filesystem').length).toBeGreaterThan(0)
    })

    const restartButtons = screen.getAllByTitle('Restart server')
    fireEvent.click(restartButtons[0])

    await waitFor(() => {
      expect(restartMcpServer).toHaveBeenCalled()
    })
  })

  it('calls removeMcpServer when delete clicked', async () => {
    const { removeMcpServer } = await import('../../lib/tauri-api')
    render(<DataSourcesContent />)

    await waitFor(() => {
      expect(screen.getAllByText('filesystem').length).toBeGreaterThan(0)
    })

    const deleteButtons = screen.getAllByTitle('Remove server')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(removeMcpServer).toHaveBeenCalled()
    })
  })

  it('shows server status (Healthy/Disconnected)', async () => {
    render(<DataSourcesContent />)
    await waitFor(() => {
      expect(screen.getByText('Healthy')).toBeDefined()
      expect(screen.getByText('Disconnected')).toBeDefined()
    })
  })

  it('cancels add form when Cancel clicked', async () => {
    render(<DataSourcesContent />)
    fireEvent.click(screen.getByText('+ Add Server'))
    expect(screen.getByText('Add MCP Server')).toBeDefined()

    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Add MCP Server')).toBeNull()
  })
})
