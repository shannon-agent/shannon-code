import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PluginCard } from '../PluginCard'

const defaultPlugin = {
  name: 'test-server',
  command: 'npx test-server',
  enabled: true,
  connected: true,
  toolCount: 5,
}

describe('PluginCard', () => {
  it('renders plugin name', () => {
    render(<PluginCard plugin={defaultPlugin} />)
    expect(screen.getByText('test-server')).toBeDefined()
  })

  it('shows connected status when connected', () => {
    render(<PluginCard plugin={defaultPlugin} />)
    expect(screen.getByText('Connected')).toBeDefined()
  })

  it('shows disconnected status when not connected', () => {
    render(<PluginCard plugin={{ ...defaultPlugin, connected: false }} />)
    expect(screen.getByText('Disconnected')).toBeDefined()
  })

  it('shows tool count', () => {
    render(<PluginCard plugin={defaultPlugin} />)
    expect(screen.getByText('5 tools')).toBeDefined()
  })

  it('shows command', () => {
    render(<PluginCard plugin={defaultPlugin} />)
    expect(screen.getByText('npx test-server')).toBeDefined()
  })

  it('calls onToggle when toggle button clicked', () => {
    const onToggle = vi.fn()
    render(<PluginCard plugin={defaultPlugin} onToggle={onToggle} />)
    const toggleBtn = screen.getByLabelText('Disable test-server')
    fireEvent.click(toggleBtn)
    expect(onToggle).toHaveBeenCalledWith('test-server')
  })

  it('calls onRemove with confirmation', () => {
    const onRemove = vi.fn()
    render(<PluginCard plugin={defaultPlugin} onRemove={onRemove} />)

    // First click shows confirmation
    const removeBtn = screen.getByLabelText('Remove test-server')
    fireEvent.click(removeBtn)
    expect(screen.getByText(/Remove test-server/)).toBeDefined()

    // Second click calls onRemove
    fireEvent.click(screen.getByText('Remove'))
    expect(onRemove).toHaveBeenCalledWith('test-server')
  })

  it('expands tools list when expand clicked', () => {
    const pluginWithTools = {
      ...defaultPlugin,
      tools: [
        { name: 'read_file', description: 'Read a file' },
        { name: 'write_file', description: 'Write a file' },
      ],
    }
    render(<PluginCard plugin={pluginWithTools} />)

    // Click expand button
    const expandBtn = screen.getByLabelText('Expand tools list')
    fireEvent.click(expandBtn)

    expect(screen.getByText('read_file')).toBeDefined()
    expect(screen.getByText('Write a file')).toBeDefined()
  })

  it('shows cancel option during remove confirmation', () => {
    const onRemove = vi.fn()
    render(<PluginCard plugin={defaultPlugin} onRemove={onRemove} />)

    const removeBtn = screen.getByLabelText('Remove test-server')
    fireEvent.click(removeBtn)

    const cancelBtn = screen.getByText('Cancel')
    fireEvent.click(cancelBtn)

    // onRemove should NOT have been called
    expect(onRemove).not.toHaveBeenCalled()
  })
})
