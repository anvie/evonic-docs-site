---
title: Architecture
description: System design overview and key modules.
sidebar:
  order: 1
---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│  Frontend (Vanilla HTML/CSS/JS + Jinja2)            │
│  templates/ + static/                                │
├─────────────────────────────────────────────────────┤
│  Flask HTTP Layer                                    │
│  app.py + routes/agents.py + routes/skills.py        │
├──────────────────────────┬──────────────────────────┤
│  Evaluation Engine       │  Agent Runtime            │
│  evaluator/engine.py     │  backend/agent_runtime.py  │
├──────────────────────────┬──────────────────────────┤
│  Evaluator Strategies    │  Tool Registry            │
│  evaluator/strategies    │  backend/tools/registry.py │
├──────────────────────────┬──────────────────────────┤
│  LLM Client (OpenAI-compatible)                     │
│  evaluator/llm_client.py                             │
├─────────────────────────────────────────────────────┤
│  SQLite Persistence                                  │
│  models/db.py                                        │
└─────────────────────────────────────────────────────┘
```

## Key Modules

### `app.py` (~700 lines)

Main Flask application. Registers routes for:
- Evaluation control (`/api/start`, `/api/stop`, `/api/status`)
- Result viewing (`/api/run/`, `/api/test_matrix`)
- Test management (`/api/settings/`)
- History (`/history`, `/api/v1/history/`)

### `evaluator/engine.py` (~900 lines)

Singleton `EvaluationEngine` that orchestrates the evaluation pipeline:
- Spawns a background thread for each evaluation run
- Iterates domains and levels, loading tests from JSON
- Routes to domain-specific evaluators (Strategy Pattern)
- Manages a log queue for real-time frontend updates
- Handles tool calling loops for multi-turn tests

### `evaluator/llm_client.py` (~400 lines)

OpenAI-compatible HTTP client:
- Sends chat completion requests with optional tool definitions
- Auto-strips thinking tags (`<think>...</think>` and Gemma 4 format)
- Model introspection via `/props` and `/v1/models` endpoints
- Token counting and request timing

### `evaluator/strategies/` (~400 lines total)

Five evaluator strategies inheriting from `BaseEvaluator`:
- `KeywordEvaluator` — keyword/regex matching
- `TwoPassEvaluator` — two-pass answer extraction
- `SQLExecutorEvaluator` — SQL execution and validation
- `ToolCallEvaluator` — tool call validation
- Custom evaluators via `evaluator/custom_evaluator.py`

### `models/db.py` (~1500 lines)

SQLite persistence layer with 15+ tables. Provides CRUD methods for all entities: evaluation runs, test results, domains, tests, evaluators, tools, agents, channels, sessions, and messages.

### `routes/agents.py` (~290 lines)

Flask Blueprint for the agent platform. Handles agent CRUD, knowledge base file management, tool assignment, channel configuration, and the chat API.

### `backend/agent_runtime.py` (~160 lines)

Production serving engine for agents:
- Builds system prompts with KB file listings
- Manages per-user sessions
- Runs multi-turn tool loops with real backend executors
- Persists all messages for conversation continuity

### `backend/tools/registry.py` (~220 lines)

Tool discovery and execution:
- Loads tool definitions from JSON files and installed skills
- Provides mock executors (for eval) and real executors (for production)
- Searches both `backend/tools/` and `skills/*/backend/tools/` for Python backends
- Auto-reloads Python backend files on modification
- Manages built-in tools (like `read`) with agent context scoping

### `backend/skills_manager.py` (~200 lines)

Skill package lifecycle:
- Discovers installed skills from `skills/*/skill.json`
- Installs skills from zip files or directories
- Runs `setup.install()` / `setup.uninstall()` lifecycle hooks
- Manages skill enable/disable state
- Provides tool definition loading for the registry

### `backend/channels/` (~200 lines total)

Channel abstraction layer:
- `base.py` — `BaseChannel` abstract class
- `telegram.py` — Telegram bot implementation using python-telegram-bot; all async bot calls are routed via `run_coroutine_threadsafe` onto the bot's dedicated event loop
- `registry.py` — `ChannelManager` for lifecycle management

### `backend/event_stream.py`

Lightweight pub/sub event bus. Every significant moment in a message turn
emits a named event that any subscriber can react to without coupling into
the core pipeline:

```
message_received → processing_started → llm_thinking? →
llm_response_chunk → tool_executed* → final_answer →
turn_complete → message_sent
```

Events are logged to `logs/events.log` with UTC timestamps.
See the [Events reference](/system/events) for the full reference.

### `backend/plugin_manager.py`

Plugin lifecycle management:
- Discovers and loads plugins from `plugins/*/handler.py`
- Registers event subscriptions via `plugin.json`
- Manages plugin state (enabled/disabled)
- Provides `PluginSDK` to handler functions

### `backend/event_logger.py`

Structured event logger:
- Wraps `event_stream` to emit typed events
- Formats events for the `logs/events.log` file
- Provides utilities for event filtering and aggregation
