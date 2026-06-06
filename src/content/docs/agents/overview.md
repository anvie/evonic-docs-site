---
title: "Agents: Core Platform"
description: "The heart of Evonic: design, deploy, and orchestrate AI agents with custom models, tools, knowledge bases, channels, and skills."
sidebar:
  order: 1
---

Evonic is fundamentally an **agentic AI platform**. Agents are the core building blocks that power everything — from simple chatbots to complex multi-agent workflows. With Evonic, you design agents from concept to production, defining every aspect of their behavior: the underlying model, available tools, knowledge base, communication channels, and installed skills.

---

## What is an Agent?

An agent is an independently configured, LLM-powered assistant that can:

- **Reason and plan** — Break down complex tasks into actionable steps
- **Take actions** — Execute tools, run code, query databases, and call APIs
- **Remember context** — Maintain conversation history across sessions with persistent state management
- **Communicate** — Talk to other agents natively via the agent-to-agent protocol
- **Connect anywhere** — Deploy to Telegram, WhatsApp, Discord, or web interfaces
- **Learn from knowledge** — Access reference documents and custom knowledge bases
- **Operate anywhere** — Run on local machines, remote SSH servers, or tunnel devices via Workplaces

---

## Anatomy of an Agent

When you design an agent in Evonic, you define these components:

| Component | Description |
|-----------|-------------|
| **Model** | The LLM that powers the agent's reasoning — OpenAI-compatible, local, or cloud |
| **System Prompt** | The agent's personality, role, and behavioral guidelines |
| **Tools** | Executable capabilities (bash, runpy, web search, custom API tools) |
| **Knowledge Base** | Reference files the agent can read during conversations |
| **Artifacts** | Persistent file output system for saving work results across sessions |
| **Channels** | Messaging platforms the agent connects through (Telegram, WhatsApp, etc.) |
| **Skills** | Installable packages that bundle tool definitions with Python backends |
| **Workplace** | Execution environment — local directory, SSH server, or Evonet-connected device |

---

## Three Differentiating Concepts

Evonic's architecture is defined by three differentiating concepts — **Workplaces**, **Agent-to-Agent Communication**, and **HMADS (Heuristic Mal-activity Detection System)** — which are explained in detail on the [Design Philosophy](/design-philosophy/#three-differentiating-concepts) page.

---

## Architecture

```
User Message
    ↓
Channel (Telegram, WhatsApp, Web, etc.)
    ↓
Agent Runtime
    ├─ Load agent config (system prompt, model, tools, skills)
    ├─ Load/create session (per-user persistence)
    ├─ Build messages (system prompt + history + new message)
    ├─ Call LLM
    ├─ Execute tool calls (if any)
    ├─ HMADS check on each action
    ├─ Loop until final response
    └─ Save messages to session
    ↓
Response → Channel → User
```

---

## Key Concepts

### Agents

Each agent has a **workspace directory** (`agents/<agent_id>/workspace/`) for file operations. This is configurable per-agent and provides an isolated filesystem context for tools like `runpy`, `bash`, and `write_file`.

An agent is defined by a **slug ID** (e.g., `bookstore_bot`, `library_assistant`), a system prompt, an optional model override, a workplace assignment, and a set of assigned tools and skills. Manage agents at `/agents` in the web UI.

### Knowledge Base

Each agent has a filesystem directory (`agents/<agent_id>/kb/`) for storing `.md` reference files. The agent can read these files using the built-in `read` tool during conversations. This keeps knowledge files editable and version-controllable.

### Artifacts

Each agent has its own artifacts directory (`agents/<agent_id>/artifacts/`) for persisting work outputs across sessions. Agents use the `save_artifact` tool to store reports, images, or any generated files. Artifacts survive session deletion and are accessible through the web UI. See [Artifacts](/agents/artifacts) for details.

### Tools

Agents can use tools from the tool registry. In production mode, tools call real Python backend implementations (in `backend/tools/`). The built-in `read` tool is always available and scoped to the agent's KB directory.

### Agent State

Agents operate in one of two modes: **Plan** or **Execute**. The agent state is persisted across conversation turns and survives LLM context summarization. Agents always start in **Plan** mode on a new session. See [Agent State](/agents/agent-state) for details.

### Channels

Channels connect agents to external messaging platforms. Each channel type (Telegram, WhatsApp, etc.) implements a common interface. Multiple channels can be connected to the same agent. See [Channels](/agents/channels) for details.

### Sessions

Conversations are persisted per-user, per-agent, per-channel. The same user can have separate conversations with different agents. Session history is used as context for each LLM call.

### Slash Commands

Agents support slash commands for quick actions. These work in both the web chat and channel interfaces:

| Command | Description |
|---------|-------------|
| `/clear` | Clear the current conversation history |
| `/clear-memory` | Clear the agent's long-term memories |
| `/help` | Display available slash commands |
| `/summary` | Trigger conversation summarization |
| `/exec` | Switch from plan mode to execute mode |
| `/cwd` | Show the current workspace directory |
| `/cd` | Change the agent's workspace directory |

See [Slash Commands](/agents/slash-commands) for full details.

---

## Use Cases

Evonic agents excel in a wide range of scenarios. Here are some of the most common:

| Category | Use Case | Description |
|----------|----------|-------------|
| Customer Service | Support Agent | Handle tickets, FAQs, refunds, and escalations |
| Personal | Personal Companion | Daily tasks, reminders, research assistance |
| Multi-Agent | Agentic Swarm | Collaborative agents working together |
| DevOps | Infrastructure Agent | Server monitoring, deployment automation |
| Data | Research & Analyst Agent | Data extraction, summarization, reporting |
| HR | Recruitment Agent | Candidate screening, interview scheduling |
| Education | Tutor Agent | Personalized learning, Q&A, assessments |
| Healthcare | Triage Agent | Symptom assessment and appointment scheduling |
| E-Commerce | Shopping Assistant | Recommendations, order tracking, returns |
| Finance | Financial Advisory | Portfolio analysis, market summaries |
| Enterprise | Agentic ERP | Supply chain, inventory, procurement, finance |
| ML/AI | AI Workflow Orchestration | End-to-end ML pipeline automation |

For detailed walkthroughs of each use case, see the [Use Cases](/guides/use-cases) page.

---

## Quick Start

1. Navigate to `/agents` in the web UI
2. Click **+ New Agent** and enter an ID (e.g., `my_assistant`)
3. Configure the system prompt in the **General** tab
4. Select the **model** for the agent's reasoning
5. Upload knowledge files in the **Knowledge** tab
6. Assign **tools** and **skills** in the Tools tab
7. Test immediately using the **Chat** tab
8. Optionally connect a Telegram or WhatsApp bot in the **Channels** tab

---

## Next Steps

- [Creating and configuring agents](/agents/creating-agents)
- [Managing the knowledge base](/agents/knowledge-base)
- [Assigning tools](/agents/tools)
- [Managing artifacts](/agents/artifacts)
- [Setting up channels](/agents/channels)
- [Agent state system](/agents/agent-state)
- [Slash commands](/agents/slash-commands)
- [Workplaces: execution environments](/agents/workplaces)
- [Evonet: Tunnel Workplace Connector](/evonet)
- [Use Cases](/guides/use-cases): Real-world scenarios and examples
