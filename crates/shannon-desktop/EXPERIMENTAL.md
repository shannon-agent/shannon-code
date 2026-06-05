# Shannon Desktop

**Status: MVP in development — streaming LLM chat with tool display working.**

Tauri v2 desktop app wrapping Shannon's core query engine for a native desktop
chat experience.

## Current Features (MVP)

- Multi-provider LLM support (Anthropic, OpenAI, DeepSeek, Ollama)
- Streaming responses via Tauri event system
- Markdown rendering (marked.js + highlight.js)
- Tool call display with collapsible input/output
- Provider/model switching at runtime
- Config persistence (`~/.shannon/desktop.json`)

## Building

Requires Tauri system deps (GTK3, webkit2gtk on Linux). Then:

```bash
just desktop            # dev build
just desktop-release    # release build
```

## What's Not Yet Done

- File edit/read tools integration (tool execution pipeline)
- Conversation persistence across sessions
- React frontend (Phase 2 — currently vanilla JS)
- Auto-updater, system tray, window state persistence
- Proper permission prompts for tool execution
