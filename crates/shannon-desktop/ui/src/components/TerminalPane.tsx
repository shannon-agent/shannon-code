// Lightweight terminal pane with ANSI color support and command input
import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { Terminal, Send, Trash2 } from 'lucide-react'

interface TerminalLine {
  text: string
  type: 'input' | 'output' | 'error' | 'system'
}

interface TerminalPaneProps {
  workingDir?: string
  onRunCommand?: (cmd: string) => Promise<string>
}

interface AnsiSegment {
  text: string
  className: string
}

// Parse ANSI codes into typed segments for safe rendering
function parseAnsi(text: string): AnsiSegment[] {
  // First strip all unhandled ANSI codes
  const cleaned = text.replace(/\x1b\[[0-9;]*m/g, (match) => {
    // Keep known color codes
    if (['\x1b[31m', '\x1b[32m', '\x1b[33m', '\x1b[34m', '\x1b[36m', '\x1b[1m', '\x1b[2m', '\x1b[0m'].includes(match)) return match
    return ''
  })

  const segments: AnsiSegment[] = []
  let current = ''
  let currentClass = ''

  const flush = () => {
    if (current) {
      segments.push({ text: current, className: currentClass })
      current = ''
    }
  }

  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '\x1b' && cleaned[i + 1] === '[') {
      const endIdx = cleaned.indexOf('m', i)
      if (endIdx !== -1) {
        flush()
        const code = cleaned.slice(i, endIdx + 1)
        switch (code) {
          case '\x1b[31m': currentClass = 'text-[var(--error)]'; break
          case '\x1b[32m': currentClass = 'text-[var(--success)]'; break
          case '\x1b[33m': currentClass = 'text-[var(--warning)]'; break
          case '\x1b[34m': currentClass = 'text-[var(--accent)]'; break
          case '\x1b[36m': currentClass = 'text-[var(--info)]'; break
          case '\x1b[1m': currentClass = 'font-bold'; break
          case '\x1b[2m': currentClass = 'opacity-60'; break
          case '\x1b[0m': currentClass = ''; break
        }
        i = endIdx
        continue
      }
    }
    current += cleaned[i]
  }
  flush()
  return segments.length > 0 ? segments : [{ text: cleaned, className: '' }]
}

function AnsiOutput({ text }: { text: string }): ReactNode {
  const segments = parseAnsi(text)
  return <>
    {segments.map((seg, i) =>
      seg.className ? <span key={i} className={seg.className}>{seg.text}</span> : <span key={i}>{seg.text}</span>
    )}
  </>
}

export function TerminalPane({ workingDir, onRunCommand }: TerminalPaneProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'Shannon Desktop Terminal', type: 'system' },
    { text: workingDir ? `Working directory: ${workingDir}` : 'Ready', type: 'system' },
  ])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [running, setRunning] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  const runCommand = useCallback(async (cmd: string) => {
    if (!cmd.trim()) return

    setLines(prev => [...prev, { text: `$ ${cmd}`, type: 'input' }])
    setHistory(prev => [...prev, cmd])
    setHistoryIdx(-1)
    setRunning(true)

    try {
      if (onRunCommand) {
        const output = await onRunCommand(cmd)
        if (output) {
          setLines(prev => [...prev, { text: output, type: 'output' }])
        }
      } else {
        // Fallback: show command in output
        setLines(prev => [...prev, { text: `(command queued: ${cmd})`, type: 'system' }])
      }
    } catch (err) {
      setLines(prev => [...prev, { text: String(err), type: 'error' }])
    } finally {
      setRunning(false)
    }
  }, [onRunCommand])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() && !running) {
      runCommand(input.trim())
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIdx = historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1)
        setHistoryIdx(newIdx)
        setInput(history[newIdx])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdx >= 0) {
        const newIdx = historyIdx + 1
        if (newIdx >= history.length) {
          setHistoryIdx(-1)
          setInput('')
        } else {
          setHistoryIdx(newIdx)
          setInput(history[newIdx])
        }
      }
    }
  }

  const clear = () => {
    setLines([{ text: 'Terminal cleared', type: 'system' }])
  }

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-[var(--accent)]'
      case 'error': return 'text-[var(--error)]'
      case 'system': return 'text-[var(--text-muted)]'
      default: return 'text-[var(--text-secondary)]'
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">Terminal</span>
          {workingDir && (
            <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[200px]">{workingDir}</span>
          )}
        </div>
        <button
          onClick={clear}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
          title="Clear terminal"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-[18px]">
        {lines.map((line, i) => (
          <div key={i} className={`${lineColor(line.type)} whitespace-pre-wrap break-all`}>
            {line.type === 'output' ? (
              <AnsiOutput text={line.text} />
            ) : (
              line.text
            )}
          </div>
        ))}
        {running && (
          <div className="text-[var(--accent)] animate-pulse">...</div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-[var(--border)] bg-[var(--bg-secondary)]/50">
        <span className="text-[var(--success)] text-xs font-bold">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={running}
          placeholder="Enter command..."
          className="flex-1 bg-transparent text-[var(--text-secondary)] text-xs font-mono placeholder-[var(--text-muted)] focus:outline-none disabled:opacity-40"
        />
        <button
          onClick={() => { if (input.trim() && !running) { runCommand(input.trim()); setInput('') } }}
          disabled={!input.trim() || running}
          className={`p-1 rounded transition-colors ${
            input.trim() && !running
              ? 'text-[var(--accent)] hover:bg-[var(--accent)]/10'
              : 'text-[var(--text-muted)] cursor-not-allowed'
          }`}
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
