---
title: Slash Commands
description: Quick actions for agents via slash commands including /clear, /help, and /summary.
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
• /clear: Clear conversation history
• /help: Show this help message
• /summary: Summarize conversation
```

### `/summary`

Triggers conversation summarization for the current session. This compresses the conversation history into a concise summary, freeing up context space for the LLM.

**Behavior:**
- Runs the summarization algorithm on the current session
- Replaces the full message history with a summary
- The agent responds with a confirmation

## How Commands Are Processed

When a message starts with `/`, the agent runtime intercepts it before sending to the LLM:

1. Parse the command name (text after `/`, before any space)
2. Match against known commands (`clear`, `help`, `summary`)
3. Execute the corresponding action
4. If the command is unknown, pass the message to the LLM normally

## Implementation

Slash commands are implemented in `backend/slash_commands.py` and integrated into the agent runtime (`backend/agent_runtime.py`) and Telegram channel (`backend/channels/telegram.py`).
