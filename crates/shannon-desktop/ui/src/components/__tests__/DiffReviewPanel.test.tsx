import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiffReviewPanel } from '../DiffReviewPanel'

// Mock tauri-api
vi.mock('../../lib/tauri-api', () => ({
  getFileDiff: vi.fn(() => Promise.resolve({ old_content: 'old', new_content: 'new' })),
}))

const mockFiles = [
  {
    path: 'src/main.ts',
    status: 'modified' as const,
    hunks: [
      { oldStart: 1, oldLines: 3, newStart: 1, newLines: 4, content: '-old\n+new' },
    ],
  },
  {
    path: 'src/utils.ts',
    status: 'added' as const,
    hunks: [],
  },
]

describe('DiffReviewPanel', () => {
  it('renders diff review header', () => {
    render(
      <DiffReviewPanel files={mockFiles} onClose={vi.fn()} onApplyDiff={vi.fn()} />
    )
    expect(screen.getByText('Diff Review')).toBeDefined()
  })

  it('shows file count', () => {
    render(
      <DiffReviewPanel files={mockFiles} onClose={vi.fn()} onApplyDiff={vi.fn()} />
    )
    expect(screen.getByText('2 files')).toBeDefined()
  })

  it('renders file list with status badges', () => {
    render(
      <DiffReviewPanel files={mockFiles} onClose={vi.fn()} onApplyDiff={vi.fn()} />
    )
    expect(screen.getByText('main.ts')).toBeDefined()
    expect(screen.getByText('utils.ts')).toBeDefined()
    expect(screen.getAllByText('M').length).toBeGreaterThan(0)
    expect(screen.getAllByText('A').length).toBeGreaterThan(0)
  })

  it('shows file navigation with index', () => {
    render(
      <DiffReviewPanel files={mockFiles} onClose={vi.fn()} onApplyDiff={vi.fn()} />
    )
    expect(screen.getByText('1 / 2')).toBeDefined()
  })

  it('switches files on click', () => {
    render(
      <DiffReviewPanel files={mockFiles} onClose={vi.fn()} onApplyDiff={vi.fn()} />
    )
    fireEvent.click(screen.getByText('utils.ts'))
    expect(screen.getByText('2 / 2')).toBeDefined()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(
      <DiffReviewPanel files={mockFiles} onClose={onClose} onApplyDiff={vi.fn()} />
    )
    // The close button is the X icon button in the header
    const closeButtons = screen.getAllByRole('button')
    // Find the button with X icon (first close button in header)
    fireEvent.click(closeButtons[1]) // Accept All is [0], close X is [1]
    expect(onClose).toHaveBeenCalled()
  })

  it('shows keyboard shortcuts hint', () => {
    render(
      <DiffReviewPanel files={mockFiles} onClose={vi.fn()} onApplyDiff={vi.fn()} />
    )
    expect(screen.getByText('Shortcuts:')).toBeDefined()
    expect(screen.getByText('Accept hunk')).toBeDefined()
    expect(screen.getByText('Reject hunk')).toBeDefined()
  })

  it('shows Accept All button', () => {
    render(
      <DiffReviewPanel files={mockFiles} onClose={vi.fn()} onApplyDiff={vi.fn()} />
    )
    expect(screen.getByText('Accept All')).toBeDefined()
  })

  it('shows file stats badges', () => {
    render(
      <DiffReviewPanel files={mockFiles} onClose={vi.fn()} onApplyDiff={vi.fn()} />
    )
    expect(screen.getByText('M: 1')).toBeDefined()
    expect(screen.getByText('A: 1')).toBeDefined()
  })
})
