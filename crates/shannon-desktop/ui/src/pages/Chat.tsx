import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/context/AppContext'
import type { ChatMessage, ToolCall } from '@/types'

export default function Chat() {
  const {
    messages, streamingText, thinkingText, isQuerying, activeToolCalls, usage,
    sessions, currentSessionId, error,
    sendMessage, cancelQuery, createSession, switchSession, deleteSession, renameSession,
  } = useApp()

  const [input, setInput] = useState('')
  const [sessionSearch, setSessionSearch] = useState('')
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isQuerying) return
    sendMessage(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape' && isQuerying) {
      cancelQuery()
    }
  }

  const filteredSessions = sessionSearch
    ? sessions.filter(s => s.title.toLowerCase().includes(sessionSearch.toLowerCase()))
    : sessions

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return 'Today'
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString()
  }

  return (
    <div className="flex-1 flex w-full h-full relative">
      {/* Left Sidebar - Session History */}
      <aside className="w-[240px] border-r border-outline-variant/10 flex flex-col glass-panel shrink-0 bg-white/40">
        <div className="p-md border-b border-outline-variant/10">
          <Button
            className="w-full py-2 bg-primary text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-md active:scale-95 transition-all"
            onClick={createSession}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Chat
          </Button>
          <div className="relative mt-sm">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <Input
              className="w-full pl-xl pr-md py-xs bg-surface-container border-none rounded-lg text-body-sm focus:ring-1 focus:ring-primary/30"
              placeholder="Search sessions..."
              type="text"
              value={sessionSearch}
              onChange={e => setSessionSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1 p-sm space-y-xs">
          {filteredSessions.length === 0 && (
            <p className="text-body-sm text-on-surface-variant text-center py-lg opacity-60">No sessions</p>
          )}
          {filteredSessions.map(session => (
            <div
              key={session.id}
              className={`p-sm rounded-lg cursor-pointer group ${
                session.id === currentSessionId
                  ? 'bg-primary-fixed/40 border-l-4 border-primary shadow-sm'
                  : 'hover:bg-surface-container-high/50'
              }`}
              onClick={() => switchSession(session.id)}
              onContextMenu={e => {
                e.preventDefault()
                if (confirm('Delete this session?')) deleteSession(session.id)
              }}
              onDoubleClick={() => {
                setEditingSessionId(session.id)
                setEditTitle(session.title)
              }}
            >
              {editingSessionId === session.id ? (
                <Input
                  className="w-full text-sm py-0 px-xs"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onBlur={() => {
                    renameSession(session.id, editTitle)
                    setEditingSessionId(null)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      renameSession(session.id, editTitle)
                      setEditingSessionId(null)
                    }
                  }}
                  autoFocus
                />
              ) : (
                <>
                  <p className={`font-label-md truncate ${session.id === currentSessionId ? 'text-primary font-bold' : 'text-on-surface group-hover:text-primary transition-colors'}`}>
                    {session.title || 'Untitled'}
                  </p>
                  <p className="text-body-sm text-on-surface-variant opacity-70 truncate">
                    {session.message_count} messages · {formatTime(session.created_at)}
                  </p>
                </>
              )}
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Main Chat Canvas */}
      <section className="flex-1 flex flex-col relative bg-white/40 overflow-hidden">
        {/* Message Area */}
        <ScrollArea className="flex-1 p-xl space-y-xl pb-32">
          {messages.length === 0 && !streamingText && (
            <div className="flex items-center justify-center h-full opacity-40">
              <div className="text-center space-y-sm">
                <span className="material-symbols-outlined text-[48px] text-primary">chat_bubble</span>
                <p className="font-body-lg text-on-surface-variant">Start a conversation</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={`${msg.timestamp}-${i}`} message={msg} />
          ))}

          {/* Streaming response */}
          {(streamingText || thinkingText || activeToolCalls.length > 0) && (
            <div className="flex gap-md max-w-[90%]">
              <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-on-primary-container">smart_toy</span>
              </div>
              <div className="space-y-md flex-1">
                {thinkingText && (
                  <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/10">
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                      </div>
                      <span className="font-label-sm text-on-surface-variant block uppercase opacity-70">Thinking</span>
                      <p className="text-body-sm whitespace-pre-wrap">{thinkingText}</p>
                    </div>
                  </div>
                )}
                {activeToolCalls.map(tc => (
                  <ToolCallDisplay key={tc.tool_use_id} toolCall={tc} />
                ))}
                {streamingText && (
                  <div className="bg-white px-lg py-md rounded-2xl rounded-tl-none border border-outline-variant/20 shadow-sm">
                    <p className="font-body-md text-on-surface whitespace-pre-wrap">{streamingText}<span className="inline-block w-2 h-5 bg-primary/60 ml-xs animate-pulse align-text-bottom"></span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mx-auto max-w-md p-md bg-error/10 border border-error/20 rounded-xl text-center">
              <p className="text-body-sm text-error">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Bar */}
        <div className="absolute bottom-6 md:bottom-12 w-full px-lg md:px-xl py-lg bg-gradient-to-t from-background via-background/90 to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full opacity-50 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative glass-card bg-white/80 rounded-2xl border border-outline-variant/30 px-sm py-xs flex items-center shadow-lg group-focus-within:border-primary/50 group-focus-within:shadow-primary/10 transition-all duration-300">
              <Button variant="ghost" className="p-md text-on-surface-variant hover:text-primary">
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
              </Button>
              <span className="material-symbols-outlined p-md text-primary">{isQuerying ? 'hourglass_empty' : 'auto_awesome'}</span>
              <textarea
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 font-body-lg py-md px-sm placeholder:text-outline-variant/80 text-on-surface resize-none min-h-[24px] max-h-[200px]"
                placeholder={isQuerying ? 'Processing...' : 'Ask Shannon anything...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isQuerying}
              />
              <div className="flex items-center gap-2 px-sm">
                {isQuerying ? (
                  <Button className="bg-error/80 text-white p-3 rounded-xl active:scale-95 transition-all" onClick={cancelQuery}>
                    <span className="material-symbols-outlined text-[20px]">stop</span>
                  </Button>
                ) : (
                  <Button
                    className="bg-primary text-on-primary p-3 rounded-xl active:scale-95 hover:shadow-md hover:shadow-primary/30 transition-all disabled:opacity-40"
                    onClick={handleSend}
                    disabled={!input.trim()}
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Sidebar - Context */}
      <aside className="w-[300px] border-l border-outline-variant/10 glass-panel shrink-0 p-lg overflow-y-auto bg-white/50 hidden lg:block">
        <div className="space-y-xl">
          {/* Token Usage */}
          {usage && (
            <section>
              <h3 className="font-label-md text-on-surface uppercase tracking-wider opacity-60 mb-md">Usage</h3>
              <div className="p-md bg-surface-container rounded-xl border border-outline-variant/10 space-y-sm">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Input tokens</span>
                  <span className="font-bold text-on-surface">{usage.input_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Output tokens</span>
                  <span className="font-bold text-on-surface">{usage.output_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Cost</span>
                  <span className="font-bold text-primary">${usage.cost_usd.toFixed(4)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Active Tool Calls */}
          {activeToolCalls.length > 0 && (
            <section>
              <h3 className="font-label-md text-on-surface uppercase tracking-wider opacity-60 mb-md">
                Active Tools
                <span className="ml-xs px-xs py-[2px] bg-primary/10 text-primary text-[10px] font-bold rounded">{activeToolCalls.length}</span>
              </h3>
              <div className="space-y-sm">
                {activeToolCalls.map(tc => (
                  <div key={tc.tool_use_id} className="p-sm bg-surface-container rounded-xl flex items-center gap-sm border border-outline-variant/10">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${tc.status === 'running' ? 'bg-amber-500 animate-pulse' : tc.status === 'error' ? 'bg-error' : 'bg-green-500'}`}></span>
                    <p className="text-label-md truncate">{tc.tool_name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-primary-fixed text-on-primary-fixed px-lg py-md rounded-2xl rounded-tr-none shadow-sm">
          <p className="font-body-md whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-md max-w-[90%]">
      <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-md">
        <span className="material-symbols-outlined text-on-primary-container">smart_toy</span>
      </div>
      <div className="space-y-md flex-1">
        <div className="bg-white px-lg py-md rounded-2xl rounded-tl-none border border-outline-variant/20 shadow-sm">
          <p className="font-body-md text-on-surface whitespace-pre-wrap">{message.content}</p>
          {message.tool_calls && message.tool_calls.length > 0 && (
            <div className="mt-md space-y-sm">
              {message.tool_calls.map(tc => (
                <ToolCallDisplay key={tc.tool_use_id} toolCall={tc} />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-sm">
          <Button className="flex items-center gap-xs px-sm py-xs rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[18px]">thumb_up</span>
          </Button>
          <Button className="flex items-center gap-xs px-sm py-xs rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
          </Button>
          <Button className="flex items-center gap-xs px-sm py-xs rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ToolCallDisplay({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false)
  const statusIcon = toolCall.status === 'running' ? 'hourglass_empty' : toolCall.status === 'error' ? 'error' : 'check_circle'
  const statusColor = toolCall.status === 'running' ? 'text-amber-500' : toolCall.status === 'error' ? 'text-error' : 'text-green-500'

  return (
    <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant/10">
      <div className="flex items-center gap-sm cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <span className={`material-symbols-outlined text-[16px] ${statusColor} ${toolCall.status === 'running' ? 'animate-spin' : ''}`}>{statusIcon}</span>
        <span className="font-label-md text-on-surface flex-1 truncate">{toolCall.tool_name}</span>
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">{expanded ? 'expand_less' : 'expand_more'}</span>
      </div>
      {expanded && (
        <div className="mt-sm space-y-xs">
          {toolCall.tool_input ? (
            <pre className="text-body-sm text-on-surface-variant bg-surface-container p-sm rounded-lg overflow-x-auto max-h-[200px]">{JSON.stringify(toolCall.tool_input ?? null, null, 2)}</pre>
          ) : null}
          {toolCall.result && (
            <pre className={`text-body-sm p-sm rounded-lg overflow-x-auto max-h-[200px] ${toolCall.is_error ? 'bg-error/5 text-error' : 'bg-surface-container text-on-surface-variant'}`}>{toolCall.result}</pre>
          )}
        </div>
      )}
    </div>
  )
}
