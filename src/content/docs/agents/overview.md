---
title: Agents — Core Platform
description: The heart of the Evonic AI — build, deploy, and manage AI agents.
sidebar:
  order: 1
---

The Evonic AI is fundamentally an **agentic AI platform**. Agents are the core building blocks that power everything — from simple chatbots to complex multi-step workflows.

## What is an Agent?

An agent is an independently configured LLM-powered assistant that can:

- **Reason and plan** — Break down complex tasks into steps
- **Take actions** — Execute tools, run code, query databases
- **Remember context** — Maintain conversation history across sessions
- **Connect anywhere** — Deploy to Telegram, WhatsApp, Discord, or web interfaces
- **Learn from knowledge** — Access reference documents and custom knowledge bases

## Architecture

```
User Message
    ↓
Channel (Telegram, Web, etc.)
    ↓
Agent Runtime
    ├─ Load agent config (system prompt, model, tools)
    ├─ Load/create session (per-user persistence)
    ├─ Build messages (system prompt + history + new message)
    ├─ Call LLM
    ├─ Execute tool calls (if any)
    ├─ Loop until final response
    └─ Save messages to session
    ↓
Response → Channel → User
```

## Key Concepts

### Agents

Each agent has a **workspace directory** (`agents/<agent_id>/workspace/`) for file operations. This is configurable per-agent in the General tab and provides an isolated filesystem context for tools like `runpy`, `bash`, and `write_file`.

For agents that need to operate on remote machines or devices, assign a **Workplace** — a first-class execution environment that can be a local directory, an SSH server, or any device running [Evonet](/agents/evonet) (a lightweight Go connector). See [Workplaces](/agents/workplaces) for details.

An agent is defined by a **slug ID** (e.g., `bookstore_bot`, `library_assistant`), a system prompt, an optional model override, and a set of assigned tools. Manage agents at `/agents` in the web UI.

### Knowledge Base

Each agent has a filesystem directory (`agents/<agent_id>/kb/`) for storing `.md` reference files. The agent can read these files using the built-in `read` tool during conversations. This keeps knowledge files editable and version-controllable.

### Tools

Agents can use tools from the tool registry. In production mode, tools call real Python backend implementations (in `backend/tools/`). The built-in `read` tool is always available and scoped to the agent's KB directory.

### Agent State

Agents operate in one of two modes: **Plan** or **Execute**. The agent state is persisted across conversation turns and survives LLM context summarization. Agents always start in **Plan** mode on a new session. See [Agent State](/agents/agent-state) for details.

### Channels

Channels connect agents to external messaging platforms. Each channel type (Telegram, WhatsApp, etc.) implements a common interface. Multiple channels can be connected to the same agent.

### Sessions

Conversations are persisted per-user, per-agent, per-channel. The same user can have separate conversations with different agents. Session history is used as context for each LLM call.

### Slash Commands

Agents support slash commands for quick actions. These work in both the web chat and Telegram channel:

| Command | Description |
|---------|-------------|
| `/clear` | Clear the current conversation history |
| `/help` | Display available slash commands |
| `/summary` | Trigger conversation summarization |

See [Slash Commands](/agents/slash-commands) for full details.

## Quick Start

1. Navigate to `/agents` in the web UI
2. Click **+ New Agent** and enter an ID (e.g., `my_assistant`)
3. Configure the system prompt in the **General** tab
4. Upload knowledge files in the **Knowledge** tab
5. Test immediately using the **Chat** tab
6. Optionally connect a Telegram bot in the **Channels** tab

## Next Steps

- [Creating and configuring agents](/agents/creating-agents)
- [Managing the knowledge base](/agents/knowledge-base)
- [Assigning tools](/agents/tools)
- [Setting up channels](/agents/channels)
- [Agent state system](/agents/agent-state)
- [Slash commands](/agents/slash-commands)
- [Workplaces — execution environments](/agents/workplaces)
- [Evonet — cloud workplace connector](/agents/evonet)
