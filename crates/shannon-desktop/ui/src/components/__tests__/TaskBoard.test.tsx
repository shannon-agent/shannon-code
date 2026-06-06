// Tests for TaskBoard component
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { TaskBoard } from '../TaskBoard'
import type { TaskItem } from '../TaskBoard'

const mockTasks: TaskItem[] = [
  { id: '1', subject: 'Fix auth bug', description: 'Token refresh loop', status: 'in_progress', owner: 'worker-1' },
  { id: '2', subject: 'Add tests', status: 'pending' },
  { id: '3', subject: 'Refactor API', description: 'Clean up endpoints', status: 'completed', owner: 'worker-2' },
  { id: '4', subject: 'Deploy script', status: 'failed' },
]

describe('TaskBoard', () => {
  afterEach(() => cleanup())

  it('renders header', () => {
    render(<TaskBoard tasks={[]} />)
    expect(screen.getByText('Tasks')).toBeDefined()
  })

  it('shows empty state when no tasks', () => {
    render(<TaskBoard tasks={[]} />)
    expect(screen.getByText('No tasks')).toBeDefined()
  })

  it('renders all task subjects', () => {
    render(<TaskBoard tasks={mockTasks} />)
    expect(screen.getByText('Fix auth bug')).toBeDefined()
    expect(screen.getByText('Add tests')).toBeDefined()
    expect(screen.getByText('Refactor API')).toBeDefined()
    expect(screen.getByText('Deploy script')).toBeDefined()
  })

  it('shows task descriptions', () => {
    render(<TaskBoard tasks={mockTasks} />)
    expect(screen.getByText('Token refresh loop')).toBeDefined()
    expect(screen.getByText('Clean up endpoints')).toBeDefined()
  })

  it('shows owner names', () => {
    render(<TaskBoard tasks={mockTasks} />)
    const owners = screen.getAllByText('worker-1')
    expect(owners.length).toBeGreaterThan(0)
    expect(screen.getByText('worker-2')).toBeDefined()
  })

  it('shows active and done counts in header', () => {
    render(<TaskBoard tasks={mockTasks} />)
    expect(screen.getByText('1 active')).toBeDefined()
    expect(screen.getByText('1 done')).toBeDefined()
    expect(screen.getByText('1 failed')).toBeDefined()
  })

  it('shows total and remaining in footer', () => {
    render(<TaskBoard tasks={mockTasks} />)
    expect(screen.getByText('4 tasks')).toBeDefined()
    expect(screen.getByText('2 remaining')).toBeDefined()
  })

  it('calls onSelect when task is clicked', () => {
    const handleSelect = vi.fn()
    render(<TaskBoard tasks={mockTasks} onSelect={handleSelect} />)

    fireEvent.click(screen.getByText('Fix auth bug'))
    expect(handleSelect).toHaveBeenCalledWith('1')
  })

  it('highlights selected task', () => {
    const { container } = render(<TaskBoard tasks={mockTasks} selectedId="2" />)
    const selected = container.querySelector('.border-l-2')
    expect(selected).toBeDefined()
    expect(selected?.textContent).toContain('Add tests')
  })

  it('sorts tasks with in_progress first', () => {
    render(<TaskBoard tasks={mockTasks} />)
    const subjects = screen.getAllByText(/Fix auth bug|Add tests|Refactor API|Deploy script/)
    expect(subjects[0].textContent).toBe('Fix auth bug')
  })

  it('shows completed task with strikethrough', () => {
    render(<TaskBoard tasks={mockTasks} />)
    const completed = screen.getByText('Refactor API')
    expect(completed.className).toContain('line-through')
  })

  it('handles single task singular', () => {
    const single: TaskItem[] = [{ id: '1', subject: 'Only task', status: 'pending' }]
    render(<TaskBoard tasks={single} />)
    expect(screen.getByText('1 task')).toBeDefined()
    expect(screen.getByText('1 remaining')).toBeDefined()
  })

  // Filter tabs
  it('shows filter tabs with counts', () => {
    render(<TaskBoard tasks={mockTasks} />)
    expect(screen.getByText('All (4)')).toBeDefined()
    expect(screen.getByText('Active (2)')).toBeDefined()
    expect(screen.getByText('Done (1)')).toBeDefined()
    expect(screen.getByText('Failed (1)')).toBeDefined()
  })

  it('filters to active tasks only', () => {
    render(<TaskBoard tasks={mockTasks} />)
    fireEvent.click(screen.getByText('Active (2)'))
    expect(screen.getByText('Fix auth bug')).toBeDefined()
    expect(screen.getByText('Add tests')).toBeDefined()
    expect(screen.queryByText('Refactor API')).toBeNull()
    expect(screen.queryByText('Deploy script')).toBeNull()
  })

  it('filters to completed tasks only', () => {
    render(<TaskBoard tasks={mockTasks} />)
    fireEvent.click(screen.getByText('Done (1)'))
    expect(screen.queryByText('Fix auth bug')).toBeNull()
    expect(screen.getByText('Refactor API')).toBeDefined()
  })

  it('shows all tasks after clearing filter', () => {
    render(<TaskBoard tasks={mockTasks} />)
    fireEvent.click(screen.getByText('Active (2)'))
    expect(screen.queryByText('Refactor API')).toBeNull()
    fireEvent.click(screen.getByText('All (4)'))
    expect(screen.getByText('Refactor API')).toBeDefined()
  })

  it('shows no matching tasks for empty filter', () => {
    const onlyDone: TaskItem[] = [
      { id: '1', subject: 'Task 1', status: 'completed' },
    ]
    render(<TaskBoard tasks={onlyDone} />)
    // "Active" tab shows (0 count, no suffix), click it to see empty
    fireEvent.click(screen.getByText('Active'))
    expect(screen.getByText('No matching tasks')).toBeDefined()
  })

  // Refresh button
  it('shows refresh button when onRefresh provided', () => {
    const { container } = render(<TaskBoard tasks={mockTasks} onRefresh={vi.fn()} />)
    expect(container.querySelector('[title="Refresh tasks"]')).toBeDefined()
  })

  it('does not show refresh button without onRefresh', () => {
    const { container } = render(<TaskBoard tasks={mockTasks} />)
    expect(container.querySelector('[title="Refresh tasks"]')).toBeNull()
  })

  it('calls onRefresh when refresh button clicked', () => {
    const handleRefresh = vi.fn()
    const { container } = render(<TaskBoard tasks={mockTasks} onRefresh={handleRefresh} />)
    fireEvent.click(container.querySelector('[title="Refresh tasks"]')!)
    expect(handleRefresh).toHaveBeenCalledTimes(1)
  })
})
