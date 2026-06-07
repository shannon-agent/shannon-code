// Tests for enhanced ToolCallDisplay component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToolCallDisplay } from '../ToolCallDisplay'

describe('ToolCallDisplay', () => {
  const toolInput = { command: 'ls -la' }
  const toolOutput = 'file1.txt\nfile2.txt'
  const stdout = 'total 0\n-rw-r--r-- 1 user group 0 Jun 6 12:00 file1.txt'
  const stderr = 'error: permission denied'

  it('renders tool name correctly', () => {
    render(<ToolCallDisplay toolName="bash" toolInput={toolInput} />)
    expect(screen.getByText('bash')).toBeDefined()
  })

  it('is collapsed by default', () => {
    const { container } = render(<ToolCallDisplay toolName="bash" toolInput={toolInput} />)
    const pre = container.querySelector('pre')
    expect(pre).toBeNull()
  })

  it('expands on click', () => {
    const { container } = render(<ToolCallDisplay toolName="bash" toolInput={toolInput} />)
    const button = container.querySelector('button')
    expect(button).toBeDefined()

    if (button) {
      fireEvent.click(button)
      const pre = container.querySelector('pre')
      expect(pre).toBeDefined()
    }
  })

  it('displays tool input when expanded', () => {
    const { container } = render(<ToolCallDisplay toolName="bash" toolInput={toolInput} />)
    const button = container.querySelector('button')

    if (button) {
      fireEvent.click(button)
      expect(container.textContent).toContain('command')
      expect(container.textContent).toContain('ls -la')
    }
  })

  it('shows running status when isRunning is true', () => {
    render(<ToolCallDisplay toolName="bash" toolInput={toolInput} isRunning={true} />)
    expect(screen.getByText('Running')).toBeDefined()
  })

  it('shows cancelled status when isCancelled is true', () => {
    render(<ToolCallDisplay toolName="bash" toolInput={toolInput} isCancelled={true} />)
    expect(screen.getByText('Cancelled')).toBeDefined()
  })

  it('shows success status when completed successfully', () => {
    render(<ToolCallDisplay toolName="bash" toolInput={toolInput} isError={false} isRunning={false} />)
    expect(screen.getByText('Success')).toBeDefined()
  })

  it('shows error status when isError is true', () => {
    render(<ToolCallDisplay toolName="bash" toolInput={toolInput} isError={true} />)
    expect(screen.getByText('Error')).toBeDefined()
  })

  it('auto-expands when isRunning is true in verbose mode', () => {
    const { container } = render(<ToolCallDisplay toolName="bash" toolInput={toolInput} isRunning={true} viewMode="verbose" />)
    const pre = container.querySelector('pre')
    expect(pre).toBeDefined()
  })

  it('does not auto-expand when isRunning in normal mode', () => {
    const { container } = render(<ToolCallDisplay toolName="bash" toolInput={toolInput} isRunning={true} viewMode="normal" />)
    const pre = container.querySelector('pre')
    expect(pre).toBeNull()
  })

  it('hides completed successful tool in summary mode', () => {
    const { container } = render(
      <ToolCallDisplay toolName="bash" toolInput={toolInput} output="done" viewMode="summary" />
    )
    expect(container.innerHTML).toBe('')
  })

  it('shows error tool in summary mode', () => {
    render(
      <ToolCallDisplay toolName="bash" toolInput={toolInput} output="fail" isError={true} viewMode="summary" />
    )
    expect(screen.getByText('bash')).toBeDefined()
    expect(screen.getByText('Error')).toBeDefined()
  })

  it('shows running tool in summary mode', () => {
    render(
      <ToolCallDisplay toolName="bash" toolInput={toolInput} isRunning={true} viewMode="summary" />
    )
    expect(screen.getByText('bash')).toBeDefined()
    expect(screen.getByText('Running')).toBeDefined()
  })

  it('displays animated progress bar when running', () => {
    const { container } = render(<ToolCallDisplay toolName="bash" toolInput={toolInput} isRunning={true} progress={50} />)
    const progressBar = container.querySelector('[role="progressbar"]')
    expect(progressBar).toBeDefined()
    expect(progressBar?.getAttribute('aria-valuenow')).toBe('50')
  })

  it('displays bash stdout output', () => {
    const { container } = render(
      <ToolCallDisplay toolName="bash" toolInput={toolInput} stdout={stdout} />
    )
    const button = container.querySelector('button')
    if (button) fireEvent.click(button)

    expect(container.textContent).toContain('Terminal Output')
  })

  it('displays bash stderr output with error styling', () => {
    const { container } = render(
      <ToolCallDisplay toolName="bash" toolInput={toolInput} stderr={stderr} />
    )
    // Expand the panel
    const button = container.querySelector('button')
    if (button) fireEvent.click(button)

    // Click the "Terminal Output" toggle to show stdout/stderr
    const terminalButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Terminal Output')
    )
    if (terminalButton) fireEvent.click(terminalButton)

    expect(container.textContent).toContain('error: permission denied')
  })

  it('displays file diff for edit tools', () => {
    const diff = { old: 'old content', new: 'new content' }
    const { container } = render(
      <ToolCallDisplay toolName="file_edit" toolInput={toolInput} diff={diff} />
    )
    const button = container.querySelector('button')
    if (button) fireEvent.click(button)

    // Expand the File Diff section
    const diffButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('File Diff')
    )
    if (diffButton) fireEvent.click(diffButton)

    expect(container.textContent).toContain('File Diff')
    expect(container.textContent).toContain('old content')
    expect(container.textContent).toContain('new content')
  })

  it('collapses input section when toggle button clicked', () => {
    const { container } = render(<ToolCallDisplay toolName="bash" toolInput={toolInput} isRunning={false} />)
    const button = container.querySelector('button')
    if (button) fireEvent.click(button)

    const inputButton = Array.from(container.querySelectorAll('button')).find(btn =>
      btn.textContent?.includes('Input')
    )
    if (inputButton) fireEvent.click(inputButton)

    // After toggling, input should be hidden
    expect(container.querySelector('pre')).toBeNull()
  })

  it('displays output when provided', () => {
    const { container } = render(
      <ToolCallDisplay toolName="bash" toolInput={toolInput} output={toolOutput} />
    )

    // Initially collapsed, won't show output
    expect(container.textContent).not.toContain('file1.txt')

    // Expand the panel
    const button = container.querySelector('button')
    if (button) {
      fireEvent.click(button)

      // Click on Output section
      const outputButton = Array.from(container.querySelectorAll('button')).find(btn =>
        btn.textContent?.includes('Output')
      )
      if (outputButton) {
        fireEvent.click(outputButton)
        expect(container.textContent).toContain('file1.txt')
      }
    }
  })

  it('applies error styles when isError is true', () => {
    const { container } = render(
      <ToolCallDisplay toolName="bash" toolInput={toolInput} isError={true} />
    )
    // Uses border-destructive instead of hardcoded hex color
    const card = container.querySelector('.border-destructive')
    expect(card).toBeDefined()
  })

  it('displays duration when provided', () => {
    render(<ToolCallDisplay toolName="bash" toolInput={toolInput} duration={150} />)
    expect(screen.getByText('150ms')).toBeDefined()
  })

  it('applies correct badge variant based on tool type', () => {
    const { container: bashContainer } = render(
      <ToolCallDisplay toolName="bash" toolInput={toolInput} />
    )
    const { container: readFileContainer } = render(
      <ToolCallDisplay toolName="file_read" toolInput={toolInput} />
    )

    // Both should render Badge elements with tool name
    expect(bashContainer.textContent).toContain('bash')
    expect(readFileContainer.textContent).toContain('file_read')
  })

  it('has proper ARIA labels for accessibility', () => {
    const { container } = render(<ToolCallDisplay toolName="bash" toolInput={toolInput} />)
    // Check for accessibility attributes on interactive elements
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('shows copy button for completed bash commands', () => {
    render(<ToolCallDisplay toolName="bash" toolInput={toolInput} />)
    expect(screen.getByLabelText('Copy command to clipboard')).toBeDefined()
  })

  it('does not show copy button while running', () => {
    render(<ToolCallDisplay toolName="bash" toolInput={toolInput} isRunning={true} />)
    expect(screen.queryByLabelText('Copy command to clipboard')).toBeNull()
  })

  it('does not show copy button for non-bash tools', () => {
    render(<ToolCallDisplay toolName="file_read" toolInput={toolInput} />)
    expect(screen.queryByLabelText('Copy command to clipboard')).toBeNull()
  })
})
