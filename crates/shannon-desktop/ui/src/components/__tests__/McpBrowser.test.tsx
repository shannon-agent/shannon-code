// Tests for McpBrowser component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { McpBrowser } from '../McpBrowser'
import type { McpServer } from '../McpBrowser'

const mockServers: McpServer[] = [
  {
    name: 'filesystem',
    status: 'connected',
    tools: [
      { name: 'read_file', description: 'Read a file' },
      { name: 'write_file', description: 'Write a file' },
    ],
  },
  {
    name: 'github',
    status: 'connected',
    tools: [
      { name: 'create_issue', description: 'Create an issue' },
    ],
  },
  {
    name: 'broken-server',
    status: 'error',
    tools: [],
    error: 'Connection refused',
  },
]

describe('McpBrowser', () => {
  it('renders header', () => {
    render(<McpBrowser servers={[]} />)
    expect(screen.getByText('MCP Servers')).toBeDefined()
  })

  it('shows empty state when no servers', () => {
    render(<McpBrowser servers={[]} />)
    expect(screen.getByText('No MCP servers configured')).toBeDefined()
  })

  it('renders all server names', () => {
    render(<McpBrowser servers={mockServers} />)
    expect(screen.getByText('filesystem')).toBeDefined()
    expect(screen.getByText('github')).toBeDefined()
    expect(screen.getByText('broken-server')).toBeDefined()
  })

  it('shows connected count', () => {
    render(<McpBrowser servers={mockServers} />)
    expect(screen.getByText('2/3')).toBeDefined()
  })

  it('shows total tool count', () => {
    render(<McpBrowser servers={mockServers} />)
    expect(screen.getByText('3 tools')).toBeDefined()
  })

  it('shows tool names', () => {
    render(<McpBrowser servers={mockServers} />)
    expect(screen.getByText('read_file')).toBeDefined()
    expect(screen.getByText('write_file')).toBeDefined()
    expect(screen.getByText('create_issue')).toBeDefined()
  })

  it('shows tool descriptions', () => {
    render(<McpBrowser servers={mockServers} />)
    expect(screen.getByText('Read a file')).toBeDefined()
    expect(screen.getByText('Write a file')).toBeDefined()
  })

  it('shows error for broken server', () => {
    render(<McpBrowser servers={mockServers} />)
    expect(screen.getByText('Connection refused')).toBeDefined()
  })

  it('shows tool count per server', () => {
    render(<McpBrowser servers={mockServers} />)
    expect(screen.getByText('2 tools')).toBeDefined()
    expect(screen.getByText('1 tool')).toBeDefined()
  })

  it('collapses server on click', () => {
    render(<McpBrowser servers={mockServers} />)

    // filesystem tools visible initially
    expect(screen.getByText('read_file')).toBeDefined()

    // Click to collapse
    fireEvent.click(screen.getByText('filesystem'))

    // Tools should be hidden
    expect(screen.queryByText('read_file')).toBeNull()
  })

  it('calls onRefresh when refresh button clicked', () => {
    const handleRefresh = vi.fn()
    render(<McpBrowser servers={mockServers} onRefresh={handleRefresh} />)

    fireEvent.click(screen.getByTitle('Refresh servers'))
    expect(handleRefresh).toHaveBeenCalled()
  })

  it('shows no tools message for server with empty tools', () => {
    render(<McpBrowser servers={mockServers} />)
    expect(screen.getByText('No tools available')).toBeDefined()
  })
})
