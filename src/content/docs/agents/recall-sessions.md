---
title: recall_sessions
description: Built-in tool for querying session summaries from the database with keyword search.
sidebar:
  order: 11
---

## Overview

*Introduced in v0.3.19.*

The `recall_sessions` tool lets an agent search through its past conversation summaries. It queries the database for session recap data, making it easy for the agent to remember what happened in previous conversations — even after the current context has been summarized.

This is similar to the `recall` (long-term memory) tool, but focused specifically on **session summaries** rather than explicit memory entries.

## When to Use It

Use `recall_sessions` when you want an agent to:

- **Remember past conversations** — "What did we discuss last time?"
- **Find specific topics** — "Did we talk about the login bug before?"
- **Get context before continuing** — "What was the status of that project?"
- **Summarize recent activity** — "What sessions have I been involved in?"

## How It Works

The tool queries the database for session summaries associated with the agent. Each summary includes:

- **Session ID** — A short identifier for the conversation
- **Channel** — Where the conversation took place (web, Telegram, etc.)
- **Date** — When the session was active
- **Message count** — How many messages were exchanged
- **Summary text** — A generated summary of what was discussed

## Tool Reference

### `recall_sessions()`

```json
{
  "type": "function",
  "function": {
    "name": "recall_sessions",
    "description": "Recall session summaries from previous conversations with this agent. Use without query to get all recent sessions. Use query to search for specific topics by keyword.",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Search keyword (e.g. 'login bug', 'kanban'). Leave empty to get all sessions."
        },
        "limit": {
          "type": "integer",
          "description": "Maximum number of sessions to return (default: 20, max: 50)."
        }
      },
      "required": []
    }
  }
}
```

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `query` | No | `""` | Keyword to search for in session summaries. Leave empty to get all recent sessions. |
| `limit` | No | `20` | Maximum number of sessions to return (max: 50). |

### Returns

Returns a formatted markdown list of matching sessions. Each session shows:

```
### Session a1b2c3d4 (web, 2026-05-14)
- Messages: 12

Summary of what was discussed in that session...
```

## Examples

### Search for a specific topic

```
recall_sessions(query: "login bug")
```

Returns any sessions that discussed login-related issues.

### Get all recent sessions

```
recall_sessions(limit: 5)
```

Returns the 5 most recent session summaries.

## Under the Hood

The tool calls `db.get_agent_summaries(agent_id, query, limit)` which searches the database for session recap records associated with the agent. If no matching summaries are found, the tool returns `"No session summaries found."`

The `recall_sessions` tool is registered as a **built-in** tool in the ToolRegistry, alongside other built-ins like `read`, `remember`, `recall`, and `state`. It's automatically available to all agents — no configuration or assignment needed.
