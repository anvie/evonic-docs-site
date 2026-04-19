---
title: Agent State
description: Plan/execute mode system and plan file persistence.
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
3. The state is saved to the database after each turn
4. On session resume, the agent restores its previous mode
5. The plan file (if exists) is loaded into context

## Configuration

The agent mode can be influenced by:
- The system prompt (instructions about planning behavior)
- The task complexity (complex tasks benefit from Plan mode)
- User preference (explicit mode requests)

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents/<id>/state` | Get current agent state |
| `PUT` | `/api/agents/<id>/state` | Update agent state |
