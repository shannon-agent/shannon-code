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

// Helper: click filter tab by text content (filter tabs have capitalize class)
function clickFilterTab(label: string) {
  // Filter tabs are buttons with "capitalize" class
  const buttons = screen.getAllByRole('button')
  const tab = buttons.find(b => b.textContent === label && b.className.includes('capitalize'))
  if (!tab) throw new Error(`Filter tab "${label}" not found`)
  fireEvent.click(tab)
}

describe('TaskBoard', () => {
  afterEach(() => cleanup())

  it('renders header "Scheduled Tasks"', () => {
    render(<TaskBoard tasks={[]} />)
    expect(screen.getByText('Scheduled Tasks')).toBeDefined()
  })

  it('shows empty state when no tasks', () => {
    render(<TaskBoard tasks={[]} />)
    expect(screen.getByText('No tasks found')).toBeDefined()
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

  it('shows "System" for tasks without owner', () => {
    render(<TaskBoard tasks={mockTasks} />)
    // "Add tests" and "Deploy script" have no owner, both show "System"
    const systemLabels = screen.getAllByText('System')
    expect(systemLabels.length).toBeGreaterThanOrEqual(2)
  })

  it('calls onSelect when task is clicked', () => {
    const handleSelect = vi.fn()
    render(<TaskBoard tasks={mockTasks} onSelect={handleSelect} />)

    fireEvent.click(screen.getByText('Fix auth bug'))
    expect(handleSelect).toHaveBeenCalledWith('1')
  })

  it('highlights selected task with primary border', () => {
    const { container } = render(<TaskBoard tasks={mockTasks} selectedId="2" />)
    const selected = container.querySelector('.border-md3-primary\\/50')
    expect(selected).toBeDefined()
    expect(selected?.textContent).toContain('Add tests')
  })

  it('sorts tasks with in_progress first', () => {
    render(<TaskBoard tasks={mockTasks} />)
    const subjects = screen.getAllByText(/Fix auth bug|Add tests|Refactor API|Deploy script/)
    expect(subjects[0].textContent).toBe('Fix auth bug')
  })

  it('shows status badges on tasks', () => {
    render(<TaskBoard tasks={mockTasks} />)
    // Status badges appear in task cards and may duplicate with filter tabs
    expect(screen.getAllByText('in progress').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('failed').length).toBeGreaterThanOrEqual(1)
  })

  it('shows filter tabs', () => {
    render(<TaskBoard tasks={mockTasks} />)
    // Filter tabs are buttons with capitalize class showing all/active/completed/failed
    clickFilterTab('all')
    clickFilterTab('active')
    // "completed" and "failed" also appear as status badges, so verify via button role
    expect(screen.getAllByRole('button').some(b => b.textContent === 'completed' && b.className.includes('capitalize'))).toBe(true)
    expect(screen.getAllByRole('button').some(b => b.textContent === 'failed' && b.className.includes('capitalize'))).toBe(true)
  })

  it('filters to active tasks when active tab clicked', () => {
    render(<TaskBoard tasks={mockTasks} />)
    clickFilterTab('active')
    expect(screen.getByText('Fix auth bug')).toBeDefined()
    expect(screen.getByText('Add tests')).toBeDefined()
    expect(screen.queryByText('Refactor API')).toBeNull()
    expect(screen.queryByText('Deploy script')).toBeNull()
  })

  it('filters to completed tasks when completed tab clicked', () => {
    render(<TaskBoard tasks={mockTasks} />)
    clickFilterTab('completed')
    expect(screen.queryByText('Fix auth bug')).toBeNull()
    expect(screen.getByText('Refactor API')).toBeDefined()
  })

  it('shows all tasks after clicking all tab', () => {
    render(<TaskBoard tasks={mockTasks} />)
    clickFilterTab('active')
    expect(screen.queryByText('Refactor API')).toBeNull()
    clickFilterTab('all')
    expect(screen.getByText('Refactor API')).toBeDefined()
  })

  it('shows "No tasks found" for empty filter result', () => {
    const onlyDone: TaskItem[] = [
      { id: '1', subject: 'Task 1', status: 'completed' },
    ]
    render(<TaskBoard tasks={onlyDone} />)
    clickFilterTab('active')
    expect(screen.getByText('No tasks found')).toBeDefined()
  })

  it('shows refresh button', () => {
    render(<TaskBoard tasks={mockTasks} onRefresh={vi.fn()} />)
    expect(screen.getByText('Refresh')).toBeDefined()
  })

  it('shows execution log for completed/in_progress tasks', () => {
    render(<TaskBoard tasks={mockTasks} />)
    expect(screen.getByText('Task Execution Log')).toBeDefined()
  })

  it('shows calendar widget', () => {
    render(<TaskBoard tasks={mockTasks} />)
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const currentMonth = monthNames[new Date().getMonth()]
    expect(screen.getByText(new RegExp(currentMonth))).toBeDefined()
  })

  it('navigates calendar months with chevron buttons', () => {
    render(<TaskBoard tasks={mockTasks} />)
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const currentMonth = new Date().getMonth()

    // Click previous month
    const prevBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('chevron_left'))
    expect(prevBtn).toBeDefined()
    fireEvent.click(prevBtn!)

    const prevMonthName = currentMonth === 0 ? monthNames[11] : monthNames[currentMonth - 1]
    expect(screen.getByText(new RegExp(prevMonthName))).toBeDefined()

    // Click next to go back, then next again for next month
    const nextBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('chevron_right'))
    fireEvent.click(nextBtn!)
    fireEvent.click(nextBtn!)

    const nextMonthName = monthNames[(currentMonth + 1) % 12]
    expect(screen.getByText(new RegExp(nextMonthName))).toBeDefined()
  })

  it('shows efficiency card', () => {
    render(<TaskBoard tasks={mockTasks} />)
    expect(screen.getByText('AI Efficiency')).toBeDefined()
    // 1 completed out of 4 = 25%
    expect(screen.getByText('25%')).toBeDefined()
  })
})
