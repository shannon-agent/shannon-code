// Enhanced tool execution panel with animated progress, live output, and diff previews
import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, AlertCircle, Loader2, Terminal, FileDiff, Copy, Check } from 'lucide-react'
import type { ViewMode } from '../types/tauri-events'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible'
import { cn } from '../lib/utils'

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

function getToolBadgeVariant(toolName: string): 'default' | 'success' | 'warning' | 'error' | 'secondary' {
  const toolType = toolName.split('_')[0]
  switch (toolType) {
    case 'bash':
    case 'shell':
      return 'error'
    case 'file':
    case 'read':
    case 'write':
      return 'warning'
    case 'search':
    case 'grep':
      return 'default'
    case 'web':
    case 'fetch':
      return 'secondary'
    default:
      return 'success'
  }
}

function getStatusBadgeVariant(
  isRunning: boolean,
  isCancelled: boolean,
  isError: boolean
): { variant: 'default' | 'success' | 'warning' | 'error'; label: string } {
  if (isRunning) {
    return { variant: 'default', label: 'Running' }
  }
  if (isCancelled) {
    return { variant: 'warning', label: 'Cancelled' }
  }
  if (isError) {
    return { variant: 'error', label: 'Error' }
  }
  return { variant: 'success', label: 'Success' }
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
        <div key={i} className="text-secondary-foreground">
          <span className="text-muted-foreground mr-2 select-none"> </span>
          {oldLine || ' '}
        </div>
      )
    } else {
      if (oldLine) {
        lines.push(
          <div key={`${i}-old`} className="bg-destructive/20 text-destructive">
            <span className="text-destructive mr-2 select-none">-</span>
            {oldLine}
          </div>
        )
      }
      if (newLine) {
        lines.push(
          <div key={`${i}-new`} className="bg-success/20 text-success">
            <span className="text-success mr-2 select-none">+</span>
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

  const statusInfo = getStatusBadgeVariant(isRunning, isCancelled, isError)
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
    <Card className={cn(
      'mx-4 my-2 transition-all',
      isError
        ? 'border-destructive bg-destructive/5'
        : 'border-border bg-card'
    )}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Tool Header */}
        <CollapsibleTrigger className="w-full px-4 py-2 flex items-center gap-2 text-left hover:bg-secondary transition-colors rounded-t-lg">
          {isRunning ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}

          <Badge variant={getToolBadgeVariant(toolName)}>{toolName}</Badge>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>

          {hasBash && (
            <Terminal className="w-4 h-4 text-muted-foreground" aria-label="Bash command" />
          )}
          {bashCommand && !isRunning && (
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyCommand() }}
              className="ml-auto px-2 py-0.5 text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              aria-label="Copy command to clipboard"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          {hasFileEdit && diff && (
            <FileDiff className="w-4 h-4 text-muted-foreground" aria-label="File edit with diff" />
          )}

          {isError && (
            <AlertCircle className="w-4 h-4 text-destructive" aria-label="Error occurred" />
          )}

          {duration && (
            <span className="ml-auto text-xs text-muted-foreground" aria-label={`Duration: ${duration}ms`}>
              {duration}ms
            </span>
          )}
        </CollapsibleTrigger>

        {/* Animated Progress Bar for Running Tools */}
        {isRunning && (
          <div className="px-4 pb-2">
            <div className="w-full bg-secondary rounded-full h-1 overflow-hidden">
              <div
                className="bg-primary h-full animate-pulse transition-all duration-300"
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
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            {/* Input Section */}
            <div className="mb-2">
              <button
                onClick={() => setShowInput(!showInput)}
                className="text-xs text-primary hover:text-foreground transition-colors flex items-center gap-1"
                aria-label={`${showInput ? 'Hide' : 'Show'} tool input`}
              >
                {showInput ? '▼' : '▶'} Input
              </button>
              {showInput && (
                <pre className="mt-2 text-xs text-secondary-foreground bg-secondary p-3 rounded overflow-x-auto">
                  <code>{JSON.stringify(toolInput, null, 2)}</code>
                </pre>
              )}
            </div>

            {/* Bash Output Section */}
            {(stdout || stderr) && hasBash && (
              <div className="mb-2">
                <button
                  onClick={() => setShowStdout(!showStdout)}
                  className="text-xs text-primary hover:text-foreground transition-colors flex items-center gap-1"
                  aria-label={`${showStdout ? 'Hide' : 'Show'} bash output`}
                >
                  {showStdout ? '▼' : '▶'} Terminal Output
                </button>
                {showStdout && (
                  <div className="mt-2 space-y-1">
                    {stdout && (
                      <pre className="text-xs text-secondary-foreground bg-secondary p-3 rounded overflow-x-auto font-mono">
                        <code>{stdout}</code>
                      </pre>
                    )}
                    {stderr && (
                      <pre className="text-xs text-destructive bg-destructive/10 p-3 rounded overflow-x-auto font-mono">
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
                  className="text-xs text-primary hover:text-foreground transition-colors flex items-center gap-1"
                  aria-label={`${showDiff ? 'Hide' : 'Show'} file diff`}
                >
                  {showDiff ? '▼' : '▶'} File Diff
                </button>
                {showDiff && (
                  <div className="mt-2 p-3 bg-secondary rounded overflow-x-auto">
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
                  className="text-xs text-primary hover:text-foreground transition-colors flex items-center gap-1"
                  aria-label={`${showOutput ? 'Hide' : 'Show'} ${isError ? 'error' : 'output'}`}
                >
                  {showOutput ? '▼' : '▶'} {isError ? 'Error' : 'Output'}
                </button>
                {showOutput && (
                  <pre
                    className={cn(
                      'mt-2 text-xs p-3 rounded overflow-x-auto font-mono',
                      isError
                        ? 'text-destructive bg-destructive/10'
                        : 'text-secondary-foreground bg-secondary'
                    )}
                  >
                    <code>{output}</code>
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
