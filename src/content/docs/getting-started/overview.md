---
title: Overview
description: Welcome to Evonic — a local-first agentic AI platform for open models.
---

# Getting Started with Evonic

Welcome to Evonic — a powerful, local-first platform for building and deploying AI agents. Whether you're running a personal assistant, a multi-agent workflow, or a production deployment, Evonic gives you the tools to design, orchestrate, and manage agents at scale.

![Evonic mascot](/img/mascot.png)

---

## What is Evonic?

Evonic is an **agentic AI platform** built for open models. It lets you create AI agents powered by any OpenAI-compatible LLM — local, cloud, or anything in between. Agents can use tools, access knowledge bases, communicate across channels, and collaborate with each other.

### Key Features

- **Agent platform** — design and deploy AI agents with custom models, tools, and knowledge bases
- **Multi-channel** — connect agents to Telegram, WhatsApp (multi-agent, shared channels, concurrent numbers), Discord, and the web
- **Tool system** — extend agent capabilities with tools, skills, plugins, and MCP servers
- **CMP & ATG** — Context Memory Protocol and Atomic Task Graph for structured reasoning and reliable task execution
- **Evaluation** — test and benchmark agent performance with expanded cross-session metrics and automated regression
- **Isolated sandbox** — safe execution in Docker or high-performance Bubblewrap (`bwrap`) environments
- **Evonet** — mesh network for multi-device agent deployment
- **OpenAI Codex integration** — native support for Codex-optimized workflows with Chain-of-Thought thinking bubbles
- **Modern Panel UI** — redesigned dashboard with modular panels, background process manager, and drag-and-drop file uploads

---

## Quick Start

1. [Install Evonic](/getting-started/installation) — one-command install or manual setup
2. [Configure](/getting-started/configuration) — set up your environment and model endpoints
3. [Create a Super Agent](/getting-started/quickstart) — set up the platform administrator
4. [Build your first agent](/getting-started/quickstart#create-your-first-agent) — test it right away

---

## What's New in v1.0.0

Evonic v1.0.0 is a **stable release** that brings major architectural upgrades and a polished user experience. Here are the highlights:

### Core Architecture

- **CMP (Context Memory Protocol)** — standardized agent memory management across all LLM providers, with three-tier memory: working, episodic, and semantic.
- **ATG (Atomic Task Graph)** — complex goals are now decomposed into a DAG of atomic tasks with dependency tracking and parallel execution.
- **Bubblewrap Sandbox** — the new `bwrap` workplace type offers near-instant, hardware-isolated sandboxes with zero daemon overhead.
- **Plugin Lifecycle System** — formalized `init → activate → active → deactivate` lifecycle for reliable plugin management.

### Agent Capabilities

- **OpenAI Codex Integration** — native support with Chain-of-Thought "thinking bubbles" that surface the agent's internal reasoning.
- **WhatsApp Multi-Agent** — shared channels, concurrent numbers, and multi-agent coordination within a single chat thread.
- **MCP Client Integration** — connect to any Model Context Protocol server for instant access to a vast ecosystem of standardized tools.
- **Expanded Evaluator** — cross-session metrics, automated regression testing, and dynamic prompt verification.

### UI & Experience

- **Panel UI** — modular, resizable panels for multi-context workflows.
- **Background Process Manager** — monitor and manage `/detach` jobs in real time.
- **Agent Detail Redesign** — tabbed interface with live state viewer.
- **Drag-and-Drop Uploads** — files dropped into chat are instantly available in the agent's workplace.

### New Tools & Commands

- `send_channel_message`, `list_sessions`, and **Transcribe Audio** tools
- `/dump` — export session state as JSONL
- `/clear` — now auto-archives sessions to prevent data loss
- `/unfocus` — break out of stuck focus loops instantly

See the full [Changelog](/about/changelog) for all details.

---

## Next Steps

- [Installation](/getting-started/installation) — full install guide
- [Configuration](/getting-started/configuration) — environment setup
- [Quick Start](/getting-started/quickstart) — create your first agent
- [Setup Wizard](/getting-started/setup-wizard) — guided first-time setup
