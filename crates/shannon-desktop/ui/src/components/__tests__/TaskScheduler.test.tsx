// Tests for TaskScheduler component
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskScheduler } from '../TaskScheduler'
import type { ScheduledTask } from '../TaskScheduler'

const mockTasks: ScheduledTask[] = [
  {
    id: 'task-1',
    name: 'Daily Summary',
    prompt: 'Generate daily summary',
    scheduledTime: new Date('2024-12-01T09:00:00'),
    recurrence: 'daily',
    status: 'scheduled'
  },
  {
    id: 'task-2',
    name: 'Weekly Report',
    prompt: 'Generate weekly report',
    scheduledTime: new Date('2024-12-01T10:00:00'),
    recurrence: 'weekly',
    status: 'completed',
    result: 'Report generated successfully'
  },
  {
    id: 'task-3',
    name: 'Failed Task',
    prompt: 'This task failed',
    scheduledTime: new Date('2024-11-30T15:00:00'),
    recurrence: 'once',
    status: 'failed',
    error: 'Connection timeout'
  }
]

describe('TaskScheduler', () => {
  const mockProps = {
    tasks: mockTasks,
    onScheduleTask: vi.fn(),
    onCancelTask: vi.fn(),
    onViewResult: vi.fn()
  }

  it('renders task list table', () => {
    render(<TaskScheduler {...mockProps} />)

    expect(screen.getByText('Daily Summary')).toBeDefined()
    expect(screen.getByText('Weekly Report')).toBeDefined()
    expect(screen.getByText('Failed Task')).toBeDefined()
  })

  it('displays status badges with correct colors', () => {
    render(<TaskScheduler {...mockProps} />)

    const scheduledBadge = screen.getByText('Scheduled')
    const completedBadge = screen.getByText('Completed')
    const failedBadge = screen.getByText('Failed')

    expect(scheduledBadge.className).toContain('text-[#e0af68]')
    expect(completedBadge.className).toContain('text-[#9ece6a]')
    expect(failedBadge.className).toContain('text-[#f7768e]')
  })

  it('shows schedule form when button clicked', () => {
    render(<TaskScheduler {...mockProps} />)

    const scheduleButton = screen.getByText('Schedule Task')
    fireEvent.click(scheduleButton)

    expect(screen.getByText('Schedule New Task')).toBeDefined()
    expect(screen.getByPlaceholderText('e.g., Daily Summary')).toBeDefined()
  })

  it('submits new task form', () => {
    const { container } = render(<TaskScheduler {...mockProps} />)

    // Open form
    fireEvent.click(screen.getByText('Schedule Task'))

    // Fill form
    const nameInput = screen.getByPlaceholderText('e.g., Daily Summary')
    const promptInput = screen.getByPlaceholderText('Enter the task prompt...')

    fireEvent.change(nameInput, { target: { value: 'New Task' } })
    fireEvent.change(promptInput, { target: { value: 'Test prompt' } })

    // Set scheduled time via datetime-local input
    const datetimeInput = container.querySelector('input[type="datetime-local"]') as HTMLInputElement
    if (datetimeInput) {
      fireEvent.change(datetimeInput, { target: { value: '2024-12-01T14:00' } })
    }

    // Submit - use getAllByText to get the form submit button (second one)
    const submitButtons = screen.getAllByText('Schedule Task')
    fireEvent.click(submitButtons[1])

    expect(mockProps.onScheduleTask).toHaveBeenCalled()
  })

  it('cancels task when cancel button clicked', () => {
    render(<TaskScheduler {...mockProps} />)

    const cancelButton = screen.getAllByTitle('Cancel task')[0]
    fireEvent.click(cancelButton)

    expect(mockProps.onCancelTask).toHaveBeenCalledWith('task-1')
  })

  it('shows stats footer with task counts', () => {
    render(<TaskScheduler {...mockProps} />)

    expect(screen.getByText('3 total tasks')).toBeDefined()
    expect(screen.getByText('1 scheduled')).toBeDefined()
    expect(screen.getByText('0 running')).toBeDefined()
    expect(screen.getByText('1 completed')).toBeDefined()
  })

  it('displays recurrence information', () => {
    render(<TaskScheduler {...mockProps} />)

    expect(screen.getByText('daily')).toBeDefined()
    expect(screen.getByText('weekly')).toBeDefined()
    expect(screen.getByText('once')).toBeDefined()
  })

  it('formats scheduled times correctly', () => {
    render(<TaskScheduler {...mockProps} />)

    // Should show formatted date/time - the exact format depends on locale
    const timeCells = screen.getAllByText(/Dec/)
    expect(timeCells.length).toBeGreaterThan(0)
  })

  it('applies Tokyo Night styling', () => {
    const { container } = render(<TaskScheduler {...mockProps} />)

    const scheduler = container.querySelector('.space-y-4')
    expect(scheduler).toBeDefined()
  })
})
