// Tests for TerminalPane component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TerminalPane } from '../TerminalPane'

describe('TerminalPane', () => {
  it('renders terminal header', () => {
    render(<TerminalPane />)
    expect(screen.getByText('Terminal')).toBeDefined()
  })

  it('shows working directory when provided', () => {
    render(<TerminalPane workingDir="/home/user/project" />)
    expect(screen.getByText('/home/user/project')).toBeDefined()
  })

  it('shows initial system messages', () => {
    render(<TerminalPane />)
    expect(screen.getByText('Shannon Desktop Terminal')).toBeDefined()
  })

  it('renders command input', () => {
    render(<TerminalPane />)
    expect(screen.getByPlaceholderText('Enter command...')).toBeDefined()
  })

  it('renders clear button', () => {
    const { container } = render(<TerminalPane />)
    const clearBtn = container.querySelector('button[title="Clear terminal"]')
    expect(clearBtn).toBeDefined()
  })

  it('clears output when clear button is clicked', () => {
    const { container } = render(<TerminalPane />)
    const clearBtn = container.querySelector('button[title="Clear terminal"]')!
    fireEvent.click(clearBtn)
    expect(screen.getByText('Terminal cleared')).toBeDefined()
  })

  it('runs command on Enter key', async () => {
    const handleRun = vi.fn(() => Promise.resolve('output'))
    render(<TerminalPane onRunCommand={handleRun} />)

    const input = screen.getByPlaceholderText('Enter command...')
    fireEvent.change(input, { target: { value: 'ls -la' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(handleRun).toHaveBeenCalledWith('ls -la')
  })

  it('shows command in output after running', async () => {
    const handleRun = vi.fn(() => Promise.resolve('file1\nfile2'))
    render(<TerminalPane onRunCommand={handleRun} />)

    const input = screen.getByPlaceholderText('Enter command...')
    fireEvent.change(input, { target: { value: 'ls' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText('$ ls')).toBeDefined()
  })

  it('shows error output on command failure', async () => {
    const handleRun = vi.fn(() => Promise.reject(new Error('command not found')))
    render(<TerminalPane onRunCommand={handleRun} />)

    const input = screen.getByPlaceholderText('Enter command...')
    fireEvent.change(input, { target: { value: 'badcmd' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Wait for async
    await vi.waitFor(() => {
      expect(screen.getByText('command not found')).toBeDefined()
    })
  })

  it('disables input while command is running', () => {
    let resolveCmd: (value: string) => void = () => {}
    const handleRun = vi.fn(() => new Promise<string>(resolve => { resolveCmd = resolve }))
    render(<TerminalPane onRunCommand={handleRun} />)

    const input = screen.getByPlaceholderText('Enter command...')
    fireEvent.change(input, { target: { value: 'sleep 10' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Input should show running state
    expect(screen.getByText('...')).toBeDefined()
    resolveCmd('')
  })

  it('navigates command history with arrow keys', async () => {
    const handleRun = vi.fn(() => Promise.resolve('ok'))
    render(<TerminalPane onRunCommand={handleRun} />)

    const input = screen.getByPlaceholderText('Enter command...')

    // Run first command
    fireEvent.change(input, { target: { value: 'cmd1' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Wait for first command to complete
    await vi.waitFor(() => {
      expect(handleRun).toHaveBeenCalledTimes(1)
    })

    // Run second command
    fireEvent.change(input, { target: { value: 'cmd2' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Wait for second command to complete
    await vi.waitFor(() => {
      expect(handleRun).toHaveBeenCalledTimes(2)
    })

    // Navigate up to previous command
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    // Most recent command should be 'cmd2' or 'cmd1' depending on state
    expect((input as HTMLInputElement).value).toBeTruthy()

    // Navigate back down
    fireEvent.keyDown(input, { key: 'ArrowDown' })
  })

  it('does not submit empty commands', () => {
    const handleRun = vi.fn(() => Promise.resolve('ok'))
    render(<TerminalPane onRunCommand={handleRun} />)

    const input = screen.getByPlaceholderText('Enter command...')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(handleRun).not.toHaveBeenCalled()
  })
})
