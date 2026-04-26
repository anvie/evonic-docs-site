---
title: Slash Commands
description: Quick actions for agents via slash commands including /clear, /help, /summary, and Kanban commands.
sidebar:
  order: 6
---

## Overview

Agents support **slash commands** for quick actions. These work in both the web chat and Telegram channel. Commands are recognized by messages starting with `/`.

## Built-in Commands

### `/clear`

Clears the current conversation history for the active session. The agent starts fresh with no prior context.

**Behavior:**
- Deletes all messages from the current session
- Resets the session summary
- The agent responds with a confirmation message

### `/help`

Displays a list of available slash commands with brief descriptions.

**Response format:**
```
Available commands:
• /clear — Clear conversation history
• /help — Show this help message
• /summary — Summarize conversation
```

### `/summary`

Triggers conversation summarization for the current session. This compresses the conversation history into a concise summary, freeing up context space for the LLM.

**Behavior:**
- Runs the summarization algorithm on the current session
- Replaces the full message history with a summary
- The agent responds with a confirmation

## Kanban Slash Commands

When the **Kanban plugin** is installed and the agent has the Kanban skill enabled, additional slash commands become available:

### `/kanban-add-task`

Create a new task on the Kanban board directly from chat.

**Usage:**
```
/kanban-add-task Fix login bug
/kanban-add-task Add search feature high
/kanban-add-task Update README medium documentation_agent
```

| Argument | Required | Description |
|---|---|---|
| `title` | Yes | Task title |
| `priority` | No | `low`, `medium`, or `high` (default: `low`) |
| `assignee` | No | Agent ID to assign the task to |

### `/kanban-rm-task`

Delete a task from the Kanban board.

**Usage:**
```
/kanban-rm-task 42
```

### `/kanban-update-task`

Update an existing task's priority, title, or other fields.

**Usage:**
```
/kanban-update-task 42 high
```

> **Note:** Kanban slash commands are provided by the Kanban plugin and are only available when the Kanban skill is enabled for the agent.

## How Commands Are Processed

When a message starts with `/`, the agent runtime intercepts it before sending to the LLM:

1. Parse the command name (text after `/`, before any space)
2. Match against known commands (`clear`, `help`, `summary`, and any plugin-registered commands)
3. Execute the corresponding action
4. If the command is unknown, pass the message to the LLM normally

## Implementation

Slash commands are implemented in `backend/slash_commands.py` and integrated into the agent runtime (`backend/agent_runtime.py`) and Telegram channel (`backend/channels/telegram.py`). Plugins can register additional commands via the `command_registry`.
