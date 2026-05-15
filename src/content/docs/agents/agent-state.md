---
title: Agent State
description: Plan/execute mode system, session state, and plan file persistence.
sidebar:
  order: 7
---

## Overview

Agents operate in one of two modes: **Plan** or **Execute**. This state is persisted across conversation turns and survives LLM context summarization.

The agent state system ensures that agents maintain a consistent operational mode throughout a session, enabling structured reasoning before action execution.

## Modes

### Plan Mode

In Plan mode, the agent generates plans and reasoning before executing actions. This is the **default mode** when a new session starts.

**Characteristics:**
- The agent produces structured plans before taking actions
- Reasoning is explicit and documented
- Actions are validated against the plan
- Useful for complex multi-step tasks

### Execute Mode

In Execute mode, the agent executes actions directly without generating intermediate plans.

**Characteristics:**
- The agent responds and acts immediately
- No intermediate planning step
- Faster for simple, direct tasks
- Useful for conversational interactions

## State Persistence

The agent state is stored in the database and persists across:
- Individual conversation turns
- LLM context summarization
- Browser page refreshes

This means the agent remembers its mode even after the conversation context has been compressed.

## Session State

*Updated in v0.3.19 — mode, plan file, and task tracking have been migrated from Agent State to a dedicated **Session State**.*

Beginning in v0.3.19, each active chat session maintains its own **Session State** that tracks:

| Component | Description |
|-----------|-------------|
| **Mode** | Whether the agent is in Plan or Execute mode for this session |
| **Plan File** | The current plan (if any) stored in the agent's workspace |
| **Tasks** | The current task list being tracked |
| **Namespace** | Active workflow namespaces (e.g., kanban task state) |

### Session State Panel

The Session State is displayed in the chat UI's right panel with:

- **Mode badge** — Shows "Plan" or "Execute" at a glance so you always know what mode the agent is in
- **Task list** — Rendered as formatted markdown for easy reading
- **Plan file display** — Shows the current plan content if one exists
- **Namespace states** — Active workflow states (like kanban task tracking) are visible

### What Changed

Previously, mode, plan file, and task tracking were part of the **Agent State** (scoped to the agent itself). Starting in v0.3.19, they are now scoped to the **session**, meaning:

- Different conversations with the same agent can have different modes
- Plan files are session-specific
- Task tracking is per-session

This change replaced the old "Session Recap" panel with the more informative **Session State** panel.

## Plan File

When an agent is in Plan mode, it can create a **plan file** that persists across conversation turns. The plan file is stored in the agent's workspace directory and survives summarization.

**Location:** `agents/<agent_id>/workspace/plan.md`

The plan file contains:
- Current task objectives
- Step-by-step plan
- Progress tracking
- Notes and observations

## How It Works

1. When a new session starts, the agent begins in **Plan** mode
2. The agent can transition to **Execute** mode when appropriate
3. The session state is saved to the database after each turn
4. On session resume, the agent restores its previous mode
5. The plan file (if exists) is loaded into context

## Task Complexity Classifier

*Introduced in v0.2.6.*

The agent runtime includes an automatic **task complexity classifier** that determines whether a full planning phase is necessary before execution. For trivial or simple tasks, the classifier skips the planning step entirely, speeding up response time.

### How It Works

When a user sends a message, the classifier evaluates it before the agent enters Plan mode:

1. **Analyze** the message for complexity signals (length, technical terms, multi-step indicators, tool requirements)
2. **Classify** as `trivial`, `simple`, or `complex`
3. **Decide** whether planning is needed

| Classification | Planning | Example |
|----------------|----------|---------|
| **Trivial** | Skipped | "What time is it?", "Hello" |
| **Simple** | Skipped | "Tell me a joke", "Search for evonic on GitHub" |
| **Complex** | Full plan generated | "Research competitor pricing, summarize findings, and generate a report" |

### Benefits

- **Faster response times** — trivial tasks skip the planning overhead
- **Reduced token usage** — no unnecessary plan generation
- **Smarter behavior** — the agent doesn't over-plan simple requests

### Configuration

The classifier is enabled by default. You can disable it per-agent in the **General** tab by toggling the **Task Complexity Classifier** setting (`task_complexity_classifier: 0`).

## Configuration

The agent mode can be influenced by:
- The system prompt (instructions about planning behavior)
- The task complexity classifier (automatic mode selection)
- User preference (explicit mode requests via `/plan` and `/execute`)

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents/<id>/state` | Get current agent state |
| `PUT` | `/api/agents/<id>/state` | Update agent state |
