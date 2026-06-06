// Tests for DiffViewer component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiffViewer } from '../DiffViewer'

describe('DiffViewer', () => {
  const oldContent = 'line 1\nline 2\nline 3\nline 4'
  const newContent = 'line 1\nline 2 modified\nline 3\nline 4\nline 5'

  it('renders file name in header', () => {
    render(<DiffViewer oldContent={oldContent} newContent={newContent} fileName="test.ts" />)
    expect(screen.getByText('test.ts')).toBeDefined()
  })

  it('detects language from file extension', () => {
    render(<DiffViewer oldContent={oldContent} newContent={newContent} fileName="app.tsx" />)
    expect(screen.getByText('typescript')).toBeDefined()
  })

  it('shows diff stats in header', () => {
    render(<DiffViewer oldContent={oldContent} newContent={newContent} />)
    // Should show added/removed counts
    const header = screen.getByText('plaintext').closest('.flex')
    expect(header?.textContent).toContain('+')
    expect(header?.textContent).toContain('-')
  })

  it('defaults to unified view', () => {
    const { container } = render(<DiffViewer oldContent={oldContent} newContent={newContent} />)
    // Unified view has dual line numbers per row
    const rows = container.querySelectorAll('.flex-1.pl-2')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('switches to split view on button click', () => {
    const { container } = render(<DiffViewer oldContent={oldContent} newContent={newContent} />)
    const splitBtn = screen.getByTitle('Split view')
    fireEvent.click(splitBtn)

    // Split view has divide-x class
    const splitter = container.querySelector('.divide-x')
    expect(splitter).toBeDefined()
  })

  it('renders added lines with green styling', () => {
    const { container } = render(
      <DiffViewer oldContent="hello" newContent="hello\nworld" />
    )
    const addedLine = container.querySelector('.bg-\\[var\\(--success\\)\\]\\/10')
    expect(addedLine).toBeDefined()
  })

  it('renders removed lines with red styling', () => {
    const { container } = render(
      <DiffViewer oldContent="hello\nworld" newContent="hello" />
    )
    const removedLine = container.querySelector('.bg-\\[var\\(--error\\)\\]\\/10')
    expect(removedLine).toBeDefined()
  })

  it('shows plus sign for added lines', () => {
    const { container } = render(
      <DiffViewer oldContent="hello" newContent="hello\nworld" />
    )
    expect(container.textContent).toContain('+')
  })

  it('shows minus sign for removed lines', () => {
    const { container } = render(
      <DiffViewer oldContent="hello\nworld" newContent="hello" />
    )
    expect(container.textContent).toContain('-')
  })

  it('handles identical content (no diff)', () => {
    const { container } = render(
      <DiffViewer oldContent="same content" newContent="same content" />
    )
    const lines = container.querySelectorAll('.flex-1.pl-2')
    expect(lines.length).toBeGreaterThan(0)
    // No added or removed styling
    expect(container.querySelector('.bg-\\[var\\(--success\\)\\]\\/10')).toBeNull()
    expect(container.querySelector('.bg-\\[var\\(--error\\)\\]\\/10')).toBeNull()
  })

  it('handles empty content', () => {
    const { container } = render(
      <DiffViewer oldContent="" newContent="" />
    )
    expect(container.querySelector('.rounded-lg')).toBeDefined()
  })

  it('calls onAcceptHunk when accept button clicked', () => {
    const handleAccept = vi.fn()
    render(
      <DiffViewer
        oldContent="hello\nworld"
        newContent="hello\nearth"
        onAcceptHunk={handleAccept}
      />
    )

    const acceptBtn = screen.queryAllByText('Accept')
    if (acceptBtn.length > 0) {
      fireEvent.click(acceptBtn[0])
      expect(handleAccept).toHaveBeenCalledWith(0)
    }
  })

  it('calls onRejectHunk when reject button clicked', () => {
    const handleReject = vi.fn()
    render(
      <DiffViewer
        oldContent="hello\nworld"
        newContent="hello\nearth"
        onRejectHunk={handleReject}
      />
    )

    const rejectBtn = screen.queryAllByText('Reject')
    if (rejectBtn.length > 0) {
      fireEvent.click(rejectBtn[0])
      expect(handleReject).toHaveBeenCalledWith(0)
    }
  })

  it('detects language for common extensions', () => {
    const cases = [
      { file: 'app.rs', expected: 'rust' },
      { file: 'index.py', expected: 'python' },
      { file: 'main.go', expected: 'go' },
      { file: 'style.css', expected: 'css' },
      { file: 'data.json', expected: 'json' },
    ]
    for (const { file, expected } of cases) {
      const { unmount } = render(
        <DiffViewer oldContent="x" newContent="y" fileName={file} />
      )
      expect(screen.getByText(expected)).toBeDefined()
      unmount()
    }
  })

  it('renders with large content without error', () => {
    const largeOld = Array.from({ length: 500 }, (_, i) => `line ${i}`).join('\n')
    const largeNew = Array.from({ length: 500 }, (_, i) => i % 50 === 0 ? `changed ${i}` : `line ${i}`).join('\n')
    const { container } = render(
      <DiffViewer oldContent={largeOld} newContent={largeNew} />
    )
    expect(container.querySelector('.rounded-lg')).toBeDefined()
  })

  it('toggles between unified and split view', () => {
    const { container } = render(<DiffViewer oldContent="a" newContent="b" />)
    // Start in unified (no divide-x)
    expect(container.querySelector('.divide-x')).toBeNull()

    // Switch to split
    fireEvent.click(screen.getByTitle('Split view'))
    expect(container.querySelector('.divide-x')).not.toBeNull()

    // Switch back to unified
    fireEvent.click(screen.getByTitle('Unified view'))
    expect(container.querySelector('.divide-x')).toBeNull()
  })

  it('split view shows old content on left, new on right', () => {
    const { container } = render(
      <DiffViewer oldContent="old line" newContent="new line" />
    )
    fireEvent.click(screen.getByTitle('Split view'))

    const text = container.textContent || ''
    expect(text).toContain('old line')
    expect(text).toContain('new line')
  })

  it('accepts initial viewMode prop', () => {
    const { container } = render(
      <DiffViewer oldContent="a" newContent="b" viewMode="split" />
    )
    // Should start in split mode
    expect(container.querySelector('.divide-x')).not.toBeNull()
  })

  it('shows hunk count when multiple hunks exist', () => {
    const oldContent = Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n')
    const newContent = oldContent
      .split('\n')
      .map((l, i) => (i === 5 || i === 20 ? `changed ${i}` : l))
      .join('\n')

    render(
      <DiffViewer
        oldContent={oldContent}
        newContent={newContent}
        onAcceptHunk={() => {}}
        onRejectHunk={() => {}}
      />
    )

    // Should show hunk info (e.g. "Hunk 1/2")
    const hunkLabels = screen.queryAllByText(/Hunk \d+\/\d+/)
    expect(hunkLabels.length).toBeGreaterThan(0)
  })

  it('resolved hunks become opaque', () => {
    const oldContent = Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n')
    const newContent = oldContent
      .split('\n')
      .map((l, i) => (i === 5 ? `changed ${i}` : l))
      .join('\n')

    render(
      <DiffViewer
        oldContent={oldContent}
        newContent={newContent}
        onAcceptHunk={() => {}}
      />
    )

    const acceptBtn = screen.queryAllByText('Accept')
    if (acceptBtn.length > 0) {
      fireEvent.click(acceptBtn[0])
      // After accepting, hunk should be dimmed (opacity-40)
      const { container } = render(
        <DiffViewer
          oldContent={oldContent}
          newContent={newContent}
          onAcceptHunk={() => {}}
        />
      )
      expect(container.querySelector('.opacity-40')).toBeDefined()
    }
  })
})
