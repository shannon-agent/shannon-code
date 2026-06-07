// Tests for FileTree component
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileTree } from '../FileTree'

// Mock the tauri-api module
vi.mock('../../lib/tauri-api', () => ({
  getFileTree: vi.fn(() => Promise.resolve([
    {
      name: 'src',
      path: 'src',
      type: 'directory',
      children: [
        { name: 'main.ts', path: 'src/main.ts', type: 'file' },
        { name: 'utils.ts', path: 'src/utils.ts', type: 'file', modified: true },
      ],
    },
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: 'README.md', path: 'README.md', type: 'file' },
  ])),
  getWorkingDirInfo: vi.fn(() => Promise.resolve({
    root: '/test',
    branch: 'main',
    modified_files: ['src/utils.ts'],
    status: 'dirty' as const,
  })),
}))

import { getFileTree, getWorkingDirInfo } from '../../lib/tauri-api'

describe('FileTree', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header', async () => {
    render(<FileTree rootPath="/test" />)
    expect(screen.getByText('Files')).toBeDefined()
  })

  it('renders file tree from API', async () => {
    render(<FileTree rootPath="/test" />)

    await waitFor(() => {
      expect(screen.getByText('src')).toBeDefined()
      expect(screen.getByText('package.json')).toBeDefined()
      expect(screen.getByText('README.md')).toBeDefined()
    })
  })

  it('expands directory on click', async () => {
    render(<FileTree rootPath="/test" />)

    await waitFor(() => {
      expect(screen.getByText('src')).toBeDefined()
    })

    fireEvent.click(screen.getByText('src'))

    expect(screen.getByText('main.ts')).toBeDefined()
    expect(screen.getByText('utils.ts')).toBeDefined()
  })

  it('calls onFileSelect when file is clicked', async () => {
    const handleSelect = vi.fn()
    render(<FileTree rootPath="/test" onFileSelect={handleSelect} />)

    await waitFor(() => {
      expect(screen.getByText('package.json')).toBeDefined()
    })

    fireEvent.click(screen.getByText('package.json'))
    expect(handleSelect).toHaveBeenCalledWith('package.json')
  })

  it('shows empty state when no root path', () => {
    render(<FileTree />)
    expect(screen.getByText('Open a project to browse files')).toBeDefined()
  })

  it('sorts directories before files', async () => {
    render(<FileTree rootPath="/test" />)

    await waitFor(() => {
      const items = screen.getAllByText(/src|package\.json|README/)
      expect(items[0].textContent).toBe('src')
    })
  })

  it('highlights selected file', async () => {
    render(<FileTree rootPath="/test" selectedFile="package.json" />)

    await waitFor(() => {
      expect(screen.getByText('package.json')).toBeDefined()
    })

    const fileEl = screen.getByText('package.json').closest('div')
    expect(fileEl?.className).toContain('primary')
  })
})
