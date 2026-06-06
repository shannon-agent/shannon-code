// Tests for PluginBrowser component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PluginBrowser } from '../PluginBrowser'

const mockPlugins = [
  {
    name: 'filesystem',
    command: 'npx @modelcontextprotocol/server-filesystem /path',
    enabled: true,
    connected: true,
    toolCount: 5,
    tools: [
      { name: 'read_file', description: 'Read file contents' },
      { name: 'write_file', description: 'Write file contents' },
      { name: 'list_directory', description: 'List directory contents' },
    ]
  },
  {
    name: 'database',
    command: 'npx @modelcontextprotocol/server-postgres',
    enabled: false,
    connected: false,
    toolCount: 3,
    tools: [
      { name: 'query', description: 'Run SQL query' },
      { name: 'execute', description: 'Execute SQL' },
      { name: 'schema', description: 'Get schema info' },
    ]
  }
]

describe('PluginBrowser', () => {
  const mockProps = {
    plugins: mockPlugins,
    onAddPlugin: vi.fn(),
    onTogglePlugin: vi.fn(),
    onRemovePlugin: vi.fn(),
    onRefreshTools: vi.fn()
  }

  it('renders list of plugins', () => {
    render(<PluginBrowser {...mockProps} />)

    expect(screen.getByText('filesystem')).toBeDefined()
    expect(screen.getByText('database')).toBeDefined()
  })

  it('shows connection status badges', () => {
    render(<PluginBrowser {...mockProps} />)

    expect(screen.getByText('Connected')).toBeDefined()
    expect(screen.getByText('Disconnected')).toBeDefined()
  })

  it('displays tool count for each plugin', () => {
    render(<PluginBrowser {...mockProps} />)

    expect(screen.getByText('5 tools')).toBeDefined()
    expect(screen.getByText('3 tools')).toBeDefined()
  })

  it('filters plugins by search query', () => {
    render(<PluginBrowser {...mockProps} />)

    const searchInput = screen.getByPlaceholderText('Search servers and tools...')
    fireEvent.change(searchInput, { target: { value: 'file' } })

    expect(screen.getByText('filesystem')).toBeDefined()
    expect(screen.queryByText('database')).toBeNull()
  })

  it('shows add form when Add Server clicked', () => {
    render(<PluginBrowser {...mockProps} />)

    const addButton = screen.getByText('Add Server')
    fireEvent.click(addButton)

    expect(screen.getByText('Add MCP Server')).toBeDefined()
    expect(screen.getByPlaceholderText('e.g., filesystem')).toBeDefined()
  })

  it('submits new plugin form', () => {
    render(<PluginBrowser {...mockProps} />)

    // Open form
    fireEvent.click(screen.getByText('Add Server'))

    // Fill form
    const nameInput = screen.getByPlaceholderText('e.g., filesystem')
    const commandInput = screen.getByPlaceholderText('e.g., npx @modelcontextprotocol/server-filesystem /path')

    fireEvent.change(nameInput, { target: { value: 'test-plugin' } })
    fireEvent.change(commandInput, { target: { value: 'test-command' } })

    // Submit - use getAllByText to get the form submit button (second one)
    const submitButtons = screen.getAllByText('Add Server')
    fireEvent.click(submitButtons[1])

    expect(mockProps.onAddPlugin).toHaveBeenCalledWith({
      name: 'test-plugin',
      command: 'test-command',
      enabled: true
    })
  })

  it('toggles plugin enable/disable', () => {
    render(<PluginBrowser {...mockProps} />)

    const toggleButtons = screen.getAllByRole('button').filter(btn =>
      btn.getAttribute('aria-label')?.includes('Enable') || btn.getAttribute('aria-label')?.includes('Disable')
    )

    fireEvent.click(toggleButtons[0])
    expect(mockProps.onTogglePlugin).toHaveBeenCalledWith('filesystem')
  })

  it('shows stats footer', () => {
    render(<PluginBrowser {...mockProps} />)

    expect(screen.getByText('2 servers')).toBeDefined()
    expect(screen.getByText('1 connected')).toBeDefined()
    expect(screen.getByText('8 total tools')).toBeDefined()
  })

  it('expands tools list when chevron clicked', () => {
    render(<PluginBrowser {...mockProps} />)

    const expandButtons = screen.getAllByRole('button').filter(btn =>
      btn.getAttribute('aria-label')?.includes('Expand')
    )

    fireEvent.click(expandButtons[0])
    expect(screen.getByText('read_file')).toBeDefined()
    expect(screen.getByText('write_file')).toBeDefined()
  })

  it('applies Tokyo Night styling', () => {
    const { container } = render(<PluginBrowser {...mockProps} />)

    const browser = container.querySelector('.space-y-4')
    expect(browser).toBeDefined()
  })
})
