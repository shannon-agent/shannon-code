// Tests for AgentDashboard component
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { AgentDashboard } from '../AgentDashboard'
import type { AgentInfo } from '../AgentDashboard'

const mockAgents: AgentInfo[] = [
  { id: '1', name: 'worker-1', model: 'opus', status: 'running', task: 'Fix auth module', progress: 65, toolsUsed: 3, duration: 12000 },
  { id: '2', name: 'worker-2', model: 'sonnet', status: 'pending', task: 'Update tests' },
  { id: '3', name: 'worker-3', model: 'haiku', status: 'completed', task: 'Refactor utils', toolsUsed: 5, duration: 8000 },
]

describe('AgentDashboard', () => {
  afterEach(() => cleanup())

  it('renders header', () => {
    render(<AgentDashboard agents={[]} />)
    expect(screen.getByText('Agents')).toBeDefined()
  })

  it('shows empty state when no agents', () => {
    render(<AgentDashboard agents={[]} />)
    expect(screen.getByText('No active agents')).toBeDefined()
  })

  it('renders all agents', () => {
    render(<AgentDashboard agents={mockAgents} />)
    expect(screen.getByText('worker-1')).toBeDefined()
    expect(screen.getByText('worker-2')).toBeDefined()
    expect(screen.getByText('worker-3')).toBeDefined()
  })

  it('shows running count in header', () => {
    render(<AgentDashboard agents={mockAgents} />)
    expect(screen.getByText('1 running')).toBeDefined()
    expect(screen.getByText('1 done')).toBeDefined()
  })

  it('shows agent tasks', () => {
    render(<AgentDashboard agents={mockAgents} />)
    expect(screen.getByText('Fix auth module')).toBeDefined()
    expect(screen.getByText('Update tests')).toBeDefined()
  })

  it('shows model names', () => {
    render(<AgentDashboard agents={mockAgents} />)
    expect(screen.getByText('opus')).toBeDefined()
    expect(screen.getByText('sonnet')).toBeDefined()
    expect(screen.getByText('haiku')).toBeDefined()
  })

  it('formats duration correctly', () => {
    render(<AgentDashboard agents={mockAgents} />)
    expect(screen.getByText('12.0s')).toBeDefined()
    expect(screen.getByText('8.0s')).toBeDefined()
  })

  it('shows tools used count', () => {
    render(<AgentDashboard agents={mockAgents} />)
    expect(screen.getByText('3 tools used')).toBeDefined()
    expect(screen.getByText('5 tools used')).toBeDefined()
  })

  it('shows cancel button for running agents', () => {
    const handleCancel = vi.fn()
    render(<AgentDashboard agents={mockAgents} onCancel={handleCancel} />)

    const cancelButtons = screen.getAllByText('Cancel')
    expect(cancelButtons).toHaveLength(1)

    fireEvent.click(cancelButtons[0])
    expect(handleCancel).toHaveBeenCalledWith('1')
  })

  it('does not show cancel when no onCancel prop', () => {
    render(<AgentDashboard agents={mockAgents} />)
    expect(screen.queryByText('Cancel')).toBeNull()
  })

  it('renders failed agent with error styling', () => {
    const failedAgent: AgentInfo[] = [
      { id: '4', name: 'worker-4', model: 'sonnet', status: 'failed', task: 'Bad task', duration: 2000 },
    ]
    render(<AgentDashboard agents={failedAgent} />)
    expect(screen.getByText('worker-4')).toBeDefined()
    expect(screen.getByText('2.0s')).toBeDefined()
  })

  it('renders progress bar for running agents with progress', () => {
    const { container } = render(<AgentDashboard agents={mockAgents} />)
    const progressBar = container.querySelector('[style*="width: 65%"]')
    expect(progressBar).toBeDefined()
  })

  it('formats sub-second duration', () => {
    const agent: AgentInfo[] = [
      { id: '5', name: 'fast-worker', model: 'haiku', status: 'completed', duration: 500 },
    ]
    render(<AgentDashboard agents={agent} />)
    expect(screen.getByText('500ms')).toBeDefined()
  })

  it('formats minute+ duration', () => {
    const agent: AgentInfo[] = [
      { id: '6', name: 'slow-worker', model: 'opus', status: 'running', duration: 125000 },
    ]
    render(<AgentDashboard agents={agent} />)
    expect(screen.getByText('2m 5s')).toBeDefined()
  })

  // Filter tabs
  it('shows filter tabs when agents exist', () => {
    render(<AgentDashboard agents={mockAgents} />)
    // "All" tab always shows
    const allTabs = screen.getAllByText(/All/)
    expect(allTabs.length).toBeGreaterThan(0)
    // "Running" tab shows because there's 1 running agent
    expect(screen.getByText(/Running \(/)).toBeDefined()
  })

  it('filters agents by running status', () => {
    render(<AgentDashboard agents={mockAgents} />)
    fireEvent.click(screen.getByText(/Running \(/))
    expect(screen.getByText('worker-1')).toBeDefined()
    expect(screen.queryByText('worker-2')).toBeNull()
    expect(screen.queryByText('worker-3')).toBeNull()
  })

  it('filters agents by completed status', () => {
    render(<AgentDashboard agents={mockAgents} />)
    fireEvent.click(screen.getByText(/Done \(/))
    expect(screen.queryByText('worker-1')).toBeNull()
    expect(screen.getByText('worker-3')).toBeDefined()
  })

  it('shows all agents again after filtering', () => {
    render(<AgentDashboard agents={mockAgents} />)
    fireEvent.click(screen.getByText(/Running \(/))
    expect(screen.queryByText('worker-2')).toBeNull()
    // Click "All" tab (first one)
    const allTabs = screen.getAllByText(/All/)
    fireEvent.click(allTabs[0])
    expect(screen.getByText('worker-2')).toBeDefined()
  })

  it('shows no matching agents when filter has no results', () => {
    const pendingOnly: AgentInfo[] = [
      { id: '1', name: 'p1', model: 'haiku', status: 'pending' },
    ]
    render(<AgentDashboard agents={pendingOnly} />)
    fireEvent.click(screen.getByText('Running'))
    expect(screen.getByText('No matching agents')).toBeDefined()
  })

  it('shows failed count badge in header', () => {
    const agents: AgentInfo[] = [
      ...mockAgents,
      { id: '7', name: 'worker-7', model: 'sonnet', status: 'failed', task: 'Boom', duration: 1000 },
    ]
    render(<AgentDashboard agents={agents} />)
    expect(screen.getByText('1 failed')).toBeDefined()
  })
})
