---
title: Agents
description: "Agent architecture: runtime, sessions, knowledge bases, tools, and channels."
sidebar:
  order: 2
---

Agents are the core building blocks of Evonic — independently configured LLM-powered assistants that can reason, plan, take actions, and communicate through channels.

The **Agent Runtime** orchestrates each message lifecycle: loading config, creating/resuming sessions, building context, calling the LLM, executing tool calls, and looping until a final response. Each agent has an isolated workspace directory, a knowledge base for reference docs, and access to tools via `/_self/` virtual paths. Agents operate in Plan or Execute mode with persisted state, and connect to external platforms (Telegram, WhatsApp, Discord, web chat) through channels.

For full documentation: [Agents: Core Platform](/agents/overview), [Creating Agents](/agents/creating-agents), [Knowledge Base](/agents/knowledge-base), [Tools](/agents/tools), [Channels](/agents/channels), [Agent State](/agents/agent-state), and [Slash Commands](/agents/slash-commands).
