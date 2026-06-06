// Tests for FileTree component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileTree } from '../FileTree'
import type { FileNode } from '../FileTree'

const mockTree: FileNode[] = [
  {
    name: 'src',
    path: 'src',
    type: 'directory',
    children: [
      { name: 'main.ts', path: 'src/main.ts', type: 'file' },
      { name: 'utils.ts', path: 'src/utils.ts', type: 'file', modified: true },
    ],
  },
  {
    name: 'package.json',
    path: 'package.json',
    type: 'file',
  },
  {
    name: 'README.md',
    path: 'README.md',
    type: 'file',
  },
]

describe('FileTree', () => {
  it('renders header', () => {
    render(<FileTree onRefresh={vi.fn(() => Promise.resolve(mockTree))} />)
    expect(screen.getByText('Files')).toBeDefined()
  })

  it('shows loading state', () => {
    render(<FileTree onRefresh={vi.fn(() => new Promise(() => {}))} />)
    // Should show spinner
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeDefined()
  })

  it('renders file tree from refresh callback', async () => {
    render(<FileTree onRefresh={vi.fn(() => Promise.resolve(mockTree))} />)

    await vi.waitFor(() => {
      expect(screen.getByText('src')).toBeDefined()
      expect(screen.getByText('package.json')).toBeDefined()
      expect(screen.getByText('README.md')).toBeDefined()
    })
  })

  it('expands directory on click', async () => {
    render(<FileTree onRefresh={vi.fn(() => Promise.resolve(mockTree))} />)

    await vi.waitFor(() => {
      expect(screen.getByText('src')).toBeDefined()
    })

    fireEvent.click(screen.getByText('src'))

    expect(screen.getByText('main.ts')).toBeDefined()
    expect(screen.getByText('utils.ts')).toBeDefined()
  })

  it('calls onFileSelect when file is clicked', async () => {
    const handleSelect = vi.fn()
    render(
      <FileTree
        onRefresh={vi.fn(() => Promise.resolve(mockTree))}
        onFileSelect={handleSelect}
      />
    )

    await vi.waitFor(() => {
      expect(screen.getByText('package.json')).toBeDefined()
    })

    fireEvent.click(screen.getByText('package.json'))
    expect(handleSelect).toHaveBeenCalledWith('package.json')
  })

  it('shows modified file count', async () => {
    const modified = new Set(['src/utils.ts'])
    render(
      <FileTree
        onRefresh={vi.fn(() => Promise.resolve(mockTree))}
        modifiedFiles={modified}
      />
    )

    await vi.waitFor(() => {
      expect(screen.getByText('1 modified')).toBeDefined()
    })
  })

  it('shows empty state when no root path', () => {
    render(<FileTree />)
    expect(screen.getByText('Open a project to browse files')).toBeDefined()
  })

  it('sorts directories before files', async () => {
    render(<FileTree onRefresh={vi.fn(() => Promise.resolve(mockTree))} />)

    await vi.waitFor(() => {
      const items = screen.getAllByText(/src|package\.json|README/)
      // 'src' (directory) should come first
      expect(items[0].textContent).toBe('src')
    })
  })

  it('highlights selected file', async () => {
    render(
      <FileTree
        onRefresh={vi.fn(() => Promise.resolve(mockTree))}
        selectedFile="package.json"
      />
    )

    await vi.waitFor(() => {
      expect(screen.getByText('package.json')).toBeDefined()
    })

    const fileEl = screen.getByText('package.json').closest('div')
    expect(fileEl?.className).toContain('accent')
  })
})
