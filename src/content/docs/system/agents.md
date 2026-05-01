---
title: Agents
description: Agent architecture: runtime, sessions, knowledge bases, tools, and channels.
sidebar:
  order: 2
---

Agents are the core building blocks of Evonic. Each agent is an independently configured LLM-powered assistant that can reason, plan, take actions, and communicate through channels.

## Agent Runtime

When a user sends a message, the agent runtime orchestrates the full lifecycle:

```
User Message
    ↓
Channel (Telegram, Web, etc.)
    ↓
Agent Runtime
    ├── Load agent config (system prompt, model, tools)
    ├── Load/create session (per-user persistence)
    ├── Build messages (system prompt + history + new message)
    ├── Call LLM
    ├── Execute tool calls (if any)
    ├── Loop until final response
    └── Save messages to session
    ↓
Response → Channel → User
```

## Key Concepts

### Agent Workspace

Each agent has a **workspace directory** (`agents/<agent_id>/workspace/`) for file operations. This provides an isolated filesystem context for tools like `runpy`, `bash`, and `write_file`.

### Knowledge Base

Each agent has a filesystem directory (`agents/<agent_id>/kb/`) for storing reference documents (`.md` files). The agent can read these files using the built-in `read` tool during conversations.

### Tools

Agents use tools from the tool registry. In production mode, tools call real Python backend implementations located in `backend/tools/`. The built-in `read` tool is always available and scoped to the agent's KB directory.

### Agent State

Agents operate in one of two modes: **Plan** or **Execute**. The agent state is persisted across conversation turns and survives LLM context summarization. Agents always start in **Plan** mode on a new session. See [Agent State](/agents/agent-state) for details.

### Sessions

Conversations are persisted per-user, per-agent, per-channel. The same user can have separate conversations with different agents. Session history is used as context for each LLM call.

### Channels

Channels connect agents to external messaging platforms (Telegram, WhatsApp, Discord, web chat). Each channel type implements a common interface, and multiple channels can be connected to the same agent.

## Learn More

- [Agents: Core Platform](/agents/overview): full introduction
- [Creating and configuring agents](/agents/creating-agents)
- [Knowledge Base](/agents/knowledge-base)
- [Tools](/agents/tools)
- [Channels](/agents/channels)
- [Agent State](/agents/agent-state)
- [Slash Commands](/agents/slash-commands)
