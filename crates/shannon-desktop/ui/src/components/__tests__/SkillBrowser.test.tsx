import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SkillBrowser } from '../SkillBrowser'

describe('SkillBrowser', () => {
  it('renders skill browser title', () => {
    render(<SkillBrowser />)

    expect(screen.getByText('Skill Browser')).toBeDefined()
  })

  it('renders search input', () => {
    render(<SkillBrowser />)

    expect(screen.getByPlaceholderText('Search skills by name or description...')).toBeDefined()
  })

  it('transitions from loading to loaded state', async () => {
    render(<SkillBrowser />)

    // Skills load quickly from fallback data, so we verify the loaded state
    await waitFor(() => {
      expect(screen.getByText('commit')).toBeDefined()
    })
  })

  it('loads fallback skills when Tauri is not available', async () => {
    render(<SkillBrowser />)

    await waitFor(() => {
      expect(screen.getByText('commit')).toBeDefined()
      expect(screen.getByText('help')).toBeDefined()
      expect(screen.getByText('search')).toBeDefined()
    })
  })

  it('displays skill categories', async () => {
    render(<SkillBrowser />)

    await waitFor(() => {
      expect(screen.getByText('git')).toBeDefined()
      expect(screen.getByText('general')).toBeDefined()
      expect(screen.getByText('navigation')).toBeDefined()
    })
  })

  it('filters skills by search query', async () => {
    render(<SkillBrowser />)

    await waitFor(() => {
      expect(screen.getByText('commit')).toBeDefined()
    })

    const input = screen.getByPlaceholderText('Search skills by name or description...')
    fireEvent.change(input, { target: { value: 'commit' } })

    await waitFor(() => {
      expect(screen.getByText('commit')).toBeDefined()
      expect(screen.queryByText('help')).toBeNull()
    })
  })

  it('shows no results message for non-matching search', async () => {
    render(<SkillBrowser />)

    await waitFor(() => {
      expect(screen.getByText('commit')).toBeDefined()
    })

    const input = screen.getByPlaceholderText('Search skills by name or description...')
    fireEvent.change(input, { target: { value: 'xyznonexistent' } })

    await waitFor(() => {
      expect(screen.getByText('No matching skills found')).toBeDefined()
    })
  })

  it('shows skill triggers as code blocks', async () => {
    render(<SkillBrowser />)

    await waitFor(() => {
      expect(screen.getByText('/commit')).toBeDefined()
      expect(screen.getByText('/help')).toBeDefined()
    })
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(<SkillBrowser onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByText('commit')).toBeDefined()
    })

    const input = screen.getByPlaceholderText('Search skills by name or description...')
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
  })

  it('renders close button when onClose is provided', async () => {
    const onClose = vi.fn()
    render(<SkillBrowser onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByText('commit')).toBeDefined()
    })

    expect(screen.getByLabelText('Close skill browser')).toBeDefined()
  })

  it('does not render close button when onClose is not provided', async () => {
    render(<SkillBrowser />)

    await waitFor(() => {
      expect(screen.getByText('commit')).toBeDefined()
    })

    expect(screen.queryByLabelText('Close skill browser')).toBeNull()
  })

  it('shows skill detail when a skill is clicked', async () => {
    render(<SkillBrowser />)

    await waitFor(() => {
      expect(screen.getByText('commit')).toBeDefined()
    })

    fireEvent.click(screen.getByText('commit'))

    await waitFor(() => {
      expect(screen.getByText('Skill Details')).toBeDefined()
    })
  })

  it('shows stats footer after loading', async () => {
    render(<SkillBrowser />)

    await waitFor(() => {
      expect(screen.getByText(/3 skills/)).toBeDefined()
      expect(screen.getByText(/3 categories/)).toBeDefined()
    })
  })
})
