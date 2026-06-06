// Enhanced tool execution panel with animated progress, live output, and diff previews
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, AlertCircle, Loader2, Terminal, FileDiff } from 'lucide-react'

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
}

function getToolColor(toolName: string): string {
  const toolType = toolName.split('_')[0]
  switch (toolType) {
    case 'bash':
    case 'shell':
      return 'bg-[#f7768e] text-[#1a1b26]' // red
    case 'file':
    case 'read':
    case 'write':
      return 'bg-[#e0af68] text-[#1a1b26]' // yellow
    case 'search':
    case 'grep':
      return 'bg-[#7aa2f7] text-[#1a1b26]' // blue
    case 'web':
    case 'fetch':
      return 'bg-[#bb9af7] text-[#1a1b26]' // purple
    default:
      return 'bg-[#9ece6a] text-[#1a1b26]' // green
  }
}

function getStatusBadge(
  isRunning: boolean,
  isCancelled: boolean,
  isError: boolean
): { color: string; label: string } {
  if (isRunning) {
    return { color: 'bg-[#7aa2f7] text-[#1a1b26]', label: 'Running' }
  }
  if (isCancelled) {
    return { color: 'bg-[#e0af68] text-[#1a1b26]', label: 'Cancelled' }
  }
  if (isError) {
    return { color: 'bg-[#f7768e] text-[#1a1b26]', label: 'Error' }
  }
  return { color: 'bg-[#9ece6a] text-[#1a1b26]', label: 'Success' }
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
        <div key={i} className="text-[#a9b1d6]">
          <span className="text-[#565f89] mr-2 select-none"> </span>
          {oldLine || ' '}
        </div>
      )
    } else {
      if (oldLine) {
        lines.push(
          <div key={`${i}-old`} className="bg-[#f7768e]/20 text-[#f7768e]">
            <span className="text-[#f7768e] mr-2 select-none">-</span>
            {oldLine}
          </div>
        )
      }
      if (newLine) {
        lines.push(
          <div key={`${i}-new`} className="bg-[#9ece6a]/20 text-[#9ece6a]">
            <span className="text-[#9ece6a] mr-2 select-none">+</span>
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
  diff
}: ToolCallDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(isRunning)
  const [showInput, setShowInput] = useState(true)
  const [showOutput, setShowOutput] = useState(false)
  const [showStdout, setShowStdout] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  const statusBadge = getStatusBadge(isRunning, isCancelled, isError)
  const hasFileEdit = toolName.includes('edit') || toolName.includes('write')
  const hasBash = toolName.includes('bash') || toolName.includes('shell')

  // Auto-expand when running, collapse when complete
  useEffect(() => {
    if (isRunning) {
      setIsExpanded(true)
      setShowStdout(true)
    } else if (!isError) {
      setShowStdout(false)
    }
  }, [isRunning, isError])

  return (
    <div
      className={`mx-4 my-2 rounded-lg border transition-all ${
        isError
          ? 'border-[#f7768e] bg-[#f7768e]/10'
          : 'border-[#414868] bg-[#24283b]'
      }`}
    >
      {/* Tool Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-[#1a1b26] transition-colors"
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${toolName} details`}
      >
        {isRunning ? (
          <Loader2 className="w-4 h-4 text-[#7aa2f7] animate-spin" />
        ) : isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[#565f89]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#565f89]" />
        )}

        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getToolColor(toolName)}`}>
          {toolName}
        </span>

        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge.color}`}>
          {statusBadge.label}
        </span>

        {hasBash && (
          <Terminal className="w-4 h-4 text-[#565f89]" aria-label="Bash command" />
        )}
        {hasFileEdit && diff && (
          <FileDiff className="w-4 h-4 text-[#565f89]" aria-label="File edit with diff" />
        )}

        {isError && (
          <AlertCircle className="w-4 h-4 text-[#f7768e]" aria-label="Error occurred" />
        )}

        {duration && (
          <span className="ml-auto text-xs text-[#565f89]" aria-label={`Duration: ${duration}ms`}>
            {duration}ms
          </span>
        )}
      </button>

      {/* Animated Progress Bar for Running Tools */}
      {isRunning && (
        <div className="px-4 pb-2">
          <div className="w-full bg-[#1a1b26] rounded-full h-1 overflow-hidden">
            <div
              className="bg-[#7aa2f7] h-full animate-pulse transition-all duration-300"
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
              className="text-xs text-[#7aa2f7] hover:text-[#c0caf4] transition-colors flex items-center gap-1"
              aria-label={`${showInput ? 'Hide' : 'Show'} tool input`}
            >
              {showInput ? '▼' : '▶'} Input
            </button>
            {showInput && (
              <pre className="mt-2 text-xs text-[#a9b1d6] bg-[#1a1b26] p-3 rounded overflow-x-auto">
                <code>{JSON.stringify(toolInput, null, 2)}</code>
              </pre>
            )}
          </div>

          {/* Bash Output Section */}
          {(stdout || stderr) && hasBash && (
            <div className="mb-2">
              <button
                onClick={() => setShowStdout(!showStdout)}
                className="text-xs text-[#7aa2f7] hover:text-[#c0caf4] transition-colors flex items-center gap-1"
                aria-label={`${showStdout ? 'Hide' : 'Show'} bash output`}
              >
                {showStdout ? '▼' : '▶'} Terminal Output
              </button>
              {showStdout && (
                <div className="mt-2 space-y-1">
                  {stdout && (
                    <pre className="text-xs text-[#a9b1d6] bg-[#1a1b26] p-3 rounded overflow-x-auto font-mono">
                      <code>{stdout}</code>
                    </pre>
                  )}
                  {stderr && (
                    <pre className="text-xs text-[#f7768e] bg-[#f7768e]/10 p-3 rounded overflow-x-auto font-mono">
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
                className="text-xs text-[#7aa2f7] hover:text-[#c0caf4] transition-colors flex items-center gap-1"
                aria-label={`${showDiff ? 'Hide' : 'Show'} file diff`}
              >
                {showDiff ? '▼' : '▶'} File Diff
              </button>
              {showDiff && (
                <div className="mt-2 p-3 bg-[#1a1b26] rounded overflow-x-auto">
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
                className="text-xs text-[#7aa2f7] hover:text-[#c0caf4] transition-colors flex items-center gap-1"
                aria-label={`${showOutput ? 'Hide' : 'Show'} ${isError ? 'error' : 'output'}`}
              >
                {showOutput ? '▼' : '▶'} {isError ? 'Error' : 'Output'}
              </button>
              {showOutput && (
                <pre
                  className={`mt-2 text-xs p-3 rounded overflow-x-auto font-mono ${
                    isError
                      ? 'text-[#f7768e] bg-[#f7768e]/10'
                      : 'text-[#a9b1d6] bg-[#1a1b26]'
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
