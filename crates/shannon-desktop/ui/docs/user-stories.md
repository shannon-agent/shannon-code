# Shannon Desktop UI - User Stories

## Chat Page

### US-CHAT-01: Send Messages
As a user, I want to type and send messages to the AI so I can get coding assistance.
- Type in input, press Enter to send
- Shift+Enter for multi-line
- Empty messages not sent
- Input disabled during query

### US-CHAT-02: Session Management
As a user, I want to manage chat sessions so I can organize conversations.
- Create new session via "New Chat" button
- Switch between sessions by clicking
- Search sessions by name
- Rename session inline (double-click)
- Delete session with confirmation

### US-CHAT-03: Streaming Responses
As a user, I want to see AI responses stream in real-time.
- Streaming text appears with cursor animation
- Thinking indicator shows during processing
- Tool calls display with expand/collapse

### US-CHAT-04: Message Actions
As a user, I want to interact with AI responses.
- Copy message to clipboard
- Regenerate AI response
- Like/unlike messages

### US-CHAT-05: Context Panel
As a user, I want to see context about the current session.
- Token usage (input/output/cost)
- Active tool calls with status
- File context list

### US-CHAT-06: Cancel Query
As a user, I want to cancel an ongoing query.
- Press Escape during query to cancel
- Cancel button visible during processing

### US-CHAT-07: Permission Handling
As a user, I want to approve/deny tool execution.
- Modal shows tool name, input, risk level
- Approve/Deny buttons

## Scheduled (Tasks) Page

### US-TASK-01: View Tasks
As a user, I want to see all my scheduled tasks.
- Task list with status badges (Completed, Running, Failed, Pending)
- Task details (title, description, assignee, priority)
- Empty state when no tasks

### US-TASK-02: Create Background Task
As a user, I want to create new background tasks.
- "New Background Task" button opens prompt
- Enter task prompt and submit
- Task appears in execution log

### US-TASK-03: Cancel Tasks
As a user, I want to cancel running tasks.
- Cancel button on running tasks
- Cancel button on running background tasks

### US-TASK-04: Filter Tasks
As a user, I want to filter tasks by status.
- Filter buttons (All, Pending, Running, Completed)
- Clicking a filter shows only matching tasks

### US-TASK-05: Calendar View
As a user, I want to see tasks on a calendar.
- Month navigation (prev/next)
- Days with tasks highlighted
- Today highlighted
- Active tasks listed below calendar

### US-TASK-06: Task Detail
As a user, I want to see full task details.
- Click task to open detail drawer
- Shows title, status, description, priority, assignee
- Close button to dismiss

### US-TASK-07: AI Efficiency
As a user, I want to see task completion efficiency.
- Percentage of completed tasks
- Progress bar visualization

### US-TASK-08: Agent Allocation
As a user, I want to see how agents are allocated to tasks.
- Agent names with distribution bars
- Shows when agents exist

## Goals Page

### US-GOAL-01: Task Tree View
As a user, I want to see all tasks in a tree structure.
- Active, pending, completed tasks with status indicators
- Progress bars for tasks with progress
- Search to filter tasks

### US-GOAL-02: Agent Pipeline
As a user, I want to see active agents.
- Agent timeline with names and status
- Agent count

### US-GOAL-03: Human-in-the-Loop
As a user, I want to approve or adjust agent actions.
- Approve button to continue
- Adjust button to request changes

### US-GOAL-04: Task Summary
As a user, I want to see task summary counts.
- Active, pending, completed counts

### US-GOAL-05: Goal Input
As a user, I want to ask questions about my goals.
- Text input with Enter to send
- Send button

## Extensions Page

### US-EXT-01: Browse Skills
As a user, I want to browse available skills.
- Skills grouped by category
- Color-coded icons
- Skill cards with name, description, trigger

### US-EXT-02: Filter Skills
As a user, I want to toggle between trending and recent skills.
- Trending/Recent toggle buttons
- Clicking changes sort order

### US-EXT-03: Manage Data Sources
As a user, I want to manage MCP server connections.
- Add server (name, command, args)
- Remove server with confirmation
- Restart server
- View connection status and tool count

### US-EXT-04: View Agents
As a user, I want to see running agents.
- Agent cards with status, model, task
- Progress tracking
- Performance metrics
- Task completion stats

### US-EXT-05: Search Extensions
As a user, I want to search extensions.
- Search input with dynamic placeholder
- Filters displayed results

## OPC Page

### US-OPC-01: Kanban Board
As a user, I want to see tasks in a kanban board.
- 5 columns: To Do, Pending, Doing, Done, Deprecated
- Color-coded cards by status
- Priority badges on task cards
- Progress bars for in-progress tasks

### US-OPC-02: Agent Swarm
As a user, I want to see active agents in sidebar.
- Agent cards with name, model, status
- Active count badge
- Empty state when no agents

### US-OPC-03: Quick Task
As a user, I want to quickly create a task from the OPC board.
- Text input with add button
- Submit creates background task

### US-OPC-04: Strategic Focus
As a user, I want to see the project's mission statement.
- Display provider-specific or default mission
- Visual banner with label

### US-OPC-05: OPC Task Detail
As a user, I want to view individual OPC task details.
- Agent workflow visualization
- Task description
- Execution log timeline
- Human-in-the-loop review (Approve/Rollback/Revision)
- Efficiency metrics (cost, tokens, agents)

## Settings Page

### US-SET-01: Approval Mode
As a user, I want to configure my approval mode.
- Slider with 5 modes (Suggest, Confirm, Plan, Auto Edit, Full Auto)
- Current mode description
- Persisted to backend

### US-SET-02: Model Configuration
As a user, I want to configure AI models.
- Performance strategy toggle (Speed/Balanced/High Quality)
- Provider tabs with model list
- Switch active model
- API key input with visibility toggle
- Temperature slider
- Max tokens slider

### US-SET-03: Theme Selection
As a user, I want to change the app theme.
- Theme grid with preview cards
- Active theme highlighted
- Color swatches for active theme

### US-SET-04: Advanced Configuration
As a user, I want to configure advanced settings.
- Memory management toggle
- Clear session cache
- Data privacy toggles (telemetry, encryption)
- Debug console toggle
- Factory reset with confirmation

### US-SET-05: Usage & Billing
As a user, I want to view my usage and billing info.
- Current plan display
- Token usage ring chart
- Cache hit rate ring chart
- Cost analysis bar chart (30 days)
- Billing history table
