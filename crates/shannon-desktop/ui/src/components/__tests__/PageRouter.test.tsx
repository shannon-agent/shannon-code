import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataSourcesContent, MyAgentsContent } from '../PageRouter'

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
  listAgents: vi.fn(() => Promise.resolve([
    { id: 'agent-1', name: 'Researcher', model: 'claude-sonnet-4-6', status: 'running', task: 'Analyzing codebase' },
    { id: 'agent-2', name: 'Engineer', model: 'claude-sonnet-4-6', status: 'completed', task: 'Build feature' },
  ])),
  listSkills: vi.fn(() => Promise.resolve([
    { name: 'commit', description: 'Create git commit', trigger: '/commit', source: 'builtin', category: 'git' },
  ])),
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

describe('MyAgentsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders My Agents heading', async () => {
    render(<MyAgentsContent />)
    expect(screen.getByText('My Agents')).toBeDefined()
  })

  it('shows agents from API', async () => {
    render(<MyAgentsContent />)
    await waitFor(() => {
      expect(screen.getByText('Researcher')).toBeDefined()
      expect(screen.getByText('Engineer')).toBeDefined()
    })
  })

  it('opens add agent dialog when New Specialization clicked', async () => {
    render(<MyAgentsContent />)

    await waitFor(() => {
      expect(screen.getByText('Researcher')).toBeDefined()
    })

    fireEvent.click(screen.getByText('New Specialization'))
    expect(screen.getByText('Add Agent Specialization')).toBeDefined()
    expect(screen.getByPlaceholderText('e.g. Code Reviewer')).toBeDefined()
  })

  it('closes add agent dialog on Cancel', async () => {
    render(<MyAgentsContent />)

    await waitFor(() => {
      expect(screen.getByText('Researcher')).toBeDefined()
    })

    fireEvent.click(screen.getByText('New Specialization'))
    expect(screen.getByText('Add Agent Specialization')).toBeDefined()

    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Add Agent Specialization')).toBeNull()
  })

  it('closes add agent dialog on Create', async () => {
    render(<MyAgentsContent />)

    await waitFor(() => {
      expect(screen.getByText('Researcher')).toBeDefined()
    })

    fireEvent.click(screen.getByText('New Specialization'))
    fireEvent.click(screen.getByText('Create'))
    expect(screen.queryByText('Add Agent Specialization')).toBeNull()
  })
})
