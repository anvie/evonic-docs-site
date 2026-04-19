---
title: Creating Agents
description: How to create and configure agents with system prompts.
sidebar:
  order: 2
---

# Creating Agents

Agents are the core building blocks of the Evonic AI Platform. Each agent is an independently configured LLM-powered assistant that can reason, plan, and take actions.

## Creating an Agent

### Via the Web UI

1. Go to `/agents`
2. Click **+ New Agent**
3. Fill in:
   - **Agent ID** — slug format, alphanumeric + underscores only (e.g., `bookstore_bot`)
   - **Name** — display name (e.g., "Bookstore Assistant")
   - **Description** — short description
4. Click **Create** — you'll be redirected to the agent's config page

### Via the API

```bash
curl -X POST http://localhost:8080/api/agents \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "bookstore_bot",
    "name": "Bookstore Assistant",
    "description": "Book recommendation assistant for a local bookstore"
  }'
```

## Agent Configuration

The agent detail page (`/agents/<id>`) has five tabs:

### General Tab

| Field | Description |
|---|---|
| **Name** | Display name |
| **Description** | Short description |
| **Model Override** | Use a different model than the default (leave empty for default) |
| **System Prompt** | The agent's persona and instructions |
| **Workspace Directory** | Custom filesystem directory for the agent's file operations (optional, defaults to `agents/<agent_id>/workspace/`) |
| **Timeout Retries** | Number of times to retry the LLM call if it times out (default: 1) |

The system prompt defines who the agent is and how it behaves. Example:

```
You are a book recommendation assistant for a local bookstore.

Always respond in English. Be friendly and professional.

## POPULAR BOOKS
| Title | Author | Price |
| The Great Gatsby | F. Scott Fitzgerald | $12.99 |
| To Kill a Mockingbird | Harper Lee | $14.99 |
```

### Model Selection

You can override the default model for a specific agent. This is useful when you want different agents to use different models based on their requirements:

```env
# In the Model Override field:
llama3.2:3b
```

Or use a remote model:

```env
# For cloud models:
meta-llama/Llama-3-8b-Instruct
```

### Workspace Directory

Each agent has a **workspace directory** for file operations. By default, this is `agents/<agent_id>/workspace/`. You can customize it in the General tab to point to any directory on the filesystem.

The workspace provides an isolated context for tools like `runpy`, `bash`, `write_file`, and `patch`. All file paths in these tools are resolved relative to the workspace directory.

### Agent State

Agents operate in one of two modes: **Plan** or **Execute**. This state is persisted across conversation turns and survives LLM context summarization.

- **Plan mode** — The agent generates plans and reasoning before executing. This is the default mode when a new session starts.
- **Execute mode** — The agent executes actions directly.

The agent state is managed automatically by the runtime. See [Agent State](/agents/agent-state) for details.

### Knowledge Tab

Upload `.md` files that the agent can read during conversations. See [Knowledge Base](/agents/knowledge-base).

### Tools Tab

Assign tools from the registry that the agent can invoke. See [Tools](/agents/tools).

### Channels Tab

Connect external messaging platforms. See [Channels](/agents/channels).

### Chat Tab

Chat directly with the agent from the browser to test its behavior before deploying to external channels. The chat interface supports:

- **Stop button** — Interrupt the agent while it's processing
- **Thinking timeline** — Visual timeline showing the agent's reasoning process
- **Tab persistence** — Your active tab is remembered across page refreshes (via URL hash)
- **Mobile layout** — Responsive design for mobile devices

## Updating an Agent

```bash
curl -X PUT http://localhost:8080/api/agents/bookstore_bot \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Bookstore Bot",
    "system_prompt": "Updated system prompt here..."
  }'
```

## Deleting an Agent

Deleting an agent removes its database records, all channel configurations, chat sessions, and the KB directory on disk.

```bash
curl -X DELETE http://localhost:8080/api/agents/bookstore_bot
```

## Agent ID Rules

- Alphanumeric characters and underscores only: `^[a-zA-Z0-9_]+$`
- No spaces, hyphens, or special characters
- Must be unique
- Used as the filesystem directory name (`agents/<id>/kb/`)
- Cannot be changed after creation
