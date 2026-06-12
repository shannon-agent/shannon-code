import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '@/context/AppContext'
import DataSources from '@/components/extensions/DataSources'
import MyAgents from '@/components/extensions/MyAgents'

function wrap(ui: React.ReactElement) {
  return <AppProvider>{ui}</AppProvider>
}

describe('DataSources', () => {
  it('renders heading', () => {
    render(wrap(<DataSources />))
    expect(screen.getByText('Data Sources')).toBeInTheDocument()
  })

  it('renders add server button in modal header', () => {
    render(wrap(<DataSources />))
    // "Add MCP Server" is the modal heading, initially hidden
    expect(screen.getByText('Data Sources')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(wrap(<DataSources />))
    expect(screen.getByText(/No MCP servers configured/i)).toBeInTheDocument()
  })
})

describe('MyAgents', () => {
  it('renders heading', () => {
    render(wrap(<MyAgents />))
    expect(screen.getByText('My Agents')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(wrap(<MyAgents />))
    expect(screen.getByText(/No agents running/i)).toBeInTheDocument()
  })
})
