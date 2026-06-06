// Tests for TaskBoard component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskBoard } from '../TaskBoard'
import type { TaskItem } from '../TaskBoard'

const mockTasks: TaskItem[] = [
  { id: '1', subject: 'Fix auth bug', description: 'Token refresh loop', status: 'in_progress', owner: 'worker-1' },
  { id: '2', subject: 'Add tests', status: 'pending' },
  { id: '3', subject: 'Refactor API', description: 'Clean up endpoints', status: 'completed', owner: 'worker-2' },
  { id: '4', subject: 'Deploy script', status: 'failed' },
]

describe('TaskBoard', () => {
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
    expect(screen.getByText('worker-1')).toBeDefined()
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
})
