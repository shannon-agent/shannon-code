// Enhanced tool execution panel with animated progress, live output, and diff previews
import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, AlertCircle, Loader2, Terminal, FileDiff, Copy, Check } from 'lucide-react'
import type { ViewMode } from '../types/tauri-events'

interface ToolCallDisplayProps {
  toolName: string
  toolInput: unknown
  output?: string
  isError?: boolean
  isRunning?: boolean
  isCancelled?: boolean
  duration?: number
  progress?: number
  stdout?: string
  stderr?: string
  diff?: { old: string; new: string }
  viewMode?: ViewMode
}

function getToolColor(toolName: string): string {
  const toolType = toolName.split('_')[0]
  switch (toolType) {
    case 'bash':
    case 'shell':
      return 'bg-[var(--error)] text-[var(--bg-primary)]' // red
    case 'file':
    case 'read':
    case 'write':
      return 'bg-[var(--warning)] text-[var(--bg-primary)]' // yellow
    case 'search':
    case 'grep':
      return 'bg-[var(--accent)] text-[var(--bg-primary)]' // blue
    case 'web':
    case 'fetch':
      return 'bg-[var(--purple)] text-[var(--bg-primary)]' // purple
    default:
      return 'bg-[var(--success)] text-[var(--bg-primary)]' // green
  }
}

function getStatusBadge(
  isRunning: boolean,
  isCancelled: boolean,
  isError: boolean
): { color: string; label: string } {
  if (isRunning) {
    return { color: 'bg-[var(--accent)] text-[var(--bg-primary)]', label: 'Running' }
  }
  if (isCancelled) {
    return { color: 'bg-[var(--warning)] text-[var(--bg-primary)]', label: 'Cancelled' }
  }
  if (isError) {
    return { color: 'bg-[var(--error)] text-[var(--bg-primary)]', label: 'Error' }
  }
  return { color: 'bg-[var(--success)] text-[var(--bg-primary)]', label: 'Success' }
}

function formatDiff(diff: { old: string; new: string }): JSX.Element {
  const oldLines = diff.old.split('\n')
  const newLines = diff.new.split('\n')
  const maxLines = Math.max(oldLines.length, newLines.length)

  const lines: JSX.Element[] = []
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i] ?? ''
    const newLine = newLines[i] ?? ''

    if (oldLine === newLine) {
      lines.push(
        <div key={i} className="text-[var(--text-secondary)]">
          <span className="text-[var(--text-muted)] mr-2 select-none"> </span>
          {oldLine || ' '}
        </div>
      )
    } else {
      if (oldLine) {
        lines.push(
          <div key={`${i}-old`} className="bg-[var(--error)]/20 text-[var(--error)]">
            <span className="text-[var(--error)] mr-2 select-none">-</span>
            {oldLine}
          </div>
        )
      }
      if (newLine) {
        lines.push(
          <div key={`${i}-new`} className="bg-[var(--success)]/20 text-[var(--success)]">
            <span className="text-[var(--success)] mr-2 select-none">+</span>
            {newLine}
          </div>
        )
      }
    }
  }

  return <div className="font-mono text-xs">{lines}</div>
}

export function ToolCallDisplay({
  toolName,
  toolInput,
  output,
  isError = false,
  isRunning = false,
  isCancelled = false,
  duration,
  progress,
  stdout,
  stderr,
  diff,
  viewMode = 'normal'
}: ToolCallDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(viewMode === 'verbose' && isRunning)

  // Summary mode: hide completed successful tool calls, show errors and running
  if (viewMode === 'summary' && !isRunning && !isError) {
    return null
  }
  const [showInput, setShowInput] = useState(true)
  const [showOutput, setShowOutput] = useState(false)
  const [showStdout, setShowStdout] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [copied, setCopied] = useState(false)

  const statusBadge = getStatusBadge(isRunning, isCancelled, isError)
  const hasFileEdit = toolName.includes('edit') || toolName.includes('write')
  const hasBash = toolName.includes('bash') || toolName.includes('shell')

  const bashCommand = hasBash && toolInput && typeof toolInput === 'object'
    ? (toolInput as Record<string, unknown>).command as string | undefined
    : undefined

  const handleCopyCommand = useCallback(async () => {
    if (bashCommand) {
      await navigator.clipboard.writeText(bashCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [bashCommand])

  // Auto-expand when running in verbose mode, collapse when complete
  useEffect(() => {
    if (isRunning && viewMode === 'verbose') {
      setIsExpanded(true)
      setShowStdout(true)
    } else if (!isRunning) {
      setShowStdout(false)
    }
  }, [isRunning, isError, viewMode])

  return (
    <div
      className={`mx-4 my-2 rounded-lg border transition-all ${
        isError
          ? 'border-[var(--error)] bg-[var(--error)]/10'
          : 'border-[var(--border)] bg-[var(--bg-secondary)]'
      }`}
    >
      {/* Tool Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-[var(--bg-primary)] transition-colors"
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${toolName} details`}
      >
        {isRunning ? (
          <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin" />
        ) : isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        )}

        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getToolColor(toolName)}`}>
          {toolName}
        </span>

        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge.color}`}>
          {statusBadge.label}
        </span>

        {hasBash && (
          <Terminal className="w-4 h-4 text-[var(--text-muted)]" aria-label="Bash command" />
        )}
        {bashCommand && !isRunning && (
          <button
            onClick={(e) => { e.stopPropagation(); handleCopyCommand() }}
            className="ml-auto px-2 py-0.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
            aria-label="Copy command to clipboard"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
        {hasFileEdit && diff && (
          <FileDiff className="w-4 h-4 text-[var(--text-muted)]" aria-label="File edit with diff" />
        )}

        {isError && (
          <AlertCircle className="w-4 h-4 text-[var(--error)]" aria-label="Error occurred" />
        )}

        {duration && (
          <span className="ml-auto text-xs text-[var(--text-muted)]" aria-label={`Duration: ${duration}ms`}>
            {duration}ms
          </span>
        )}
      </button>

      {/* Animated Progress Bar for Running Tools */}
      {isRunning && (
        <div className="px-4 pb-2">
          <div className="w-full bg-[var(--bg-primary)] rounded-full h-1 overflow-hidden">
            <div
              className="bg-[var(--accent)] h-full animate-pulse transition-all duration-300"
              style={{ width: progress ? `${progress}%` : '100%' }}
              role="progressbar"
              aria-valuenow={progress ?? 100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Tool execution progress"
            />
          </div>
        </div>
      )}

      {/* Tool Details */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Input Section */}
          <div className="mb-2">
            <button
              onClick={() => setShowInput(!showInput)}
              className="text-xs text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
              aria-label={`${showInput ? 'Hide' : 'Show'} tool input`}
            >
              {showInput ? '▼' : '▶'} Input
            </button>
            {showInput && (
              <pre className="mt-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] p-3 rounded overflow-x-auto">
                <code>{JSON.stringify(toolInput, null, 2)}</code>
              </pre>
            )}
          </div>

          {/* Bash Output Section */}
          {(stdout || stderr) && hasBash && (
            <div className="mb-2">
              <button
                onClick={() => setShowStdout(!showStdout)}
                className="text-xs text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                aria-label={`${showStdout ? 'Hide' : 'Show'} bash output`}
              >
                {showStdout ? '▼' : '▶'} Terminal Output
              </button>
              {showStdout && (
                <div className="mt-2 space-y-1">
                  {stdout && (
                    <pre className="text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] p-3 rounded overflow-x-auto font-mono">
                      <code>{stdout}</code>
                    </pre>
                  )}
                  {stderr && (
                    <pre className="text-xs text-[var(--error)] bg-[var(--error)]/10 p-3 rounded overflow-x-auto font-mono">
                      <code>{stderr}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Diff Preview Section */}
          {diff && hasFileEdit && (
            <div className="mb-2">
              <button
                onClick={() => setShowDiff(!showDiff)}
                className="text-xs text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                aria-label={`${showDiff ? 'Hide' : 'Show'} file diff`}
              >
                {showDiff ? '▼' : '▶'} File Diff
              </button>
              {showDiff && (
                <div className="mt-2 p-3 bg-[var(--bg-primary)] rounded overflow-x-auto">
                  {formatDiff(diff)}
                </div>
              )}
            </div>
          )}

          {/* General Output Section */}
          {output && !stdout && (
            <div>
              <button
                onClick={() => setShowOutput(!showOutput)}
                className="text-xs text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                aria-label={`${showOutput ? 'Hide' : 'Show'} ${isError ? 'error' : 'output'}`}
              >
                {showOutput ? '▼' : '▶'} {isError ? 'Error' : 'Output'}
              </button>
              {showOutput && (
                <pre
                  className={`mt-2 text-xs p-3 rounded overflow-x-auto font-mono ${
                    isError
                      ? 'text-[var(--error)] bg-[var(--error)]/10'
                      : 'text-[var(--text-secondary)] bg-[var(--bg-primary)]'
                  }`}
                >
                  <code>{output}</code>
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
