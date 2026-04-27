---
title: Agent Tools
description: Assigning and developing tools for production agents.
sidebar:
  order: 4
---

## Overview

Agents can use tools during conversations. The tool system is dual-mode:

- **Evaluation mode** — tools return mock responses from JSON definitions
- **Production mode** — tools call real Python backend implementations

The built-in `read` tool is always available. Additional tools are assigned per-agent. The platform also ships with several built-in tools: `calculator`, `bash`, `runpy`, `patch`, `write_file`, `read_file`, `clear_log_file`, and `use_skill`.

## Assigning Tools

### Via the Web UI

1. Go to the agent detail page → **Tools** tab
2. Check the tools you want this agent to use
3. Click **Save Tools**

### Via the API

```bash
curl -X PUT http://localhost:8080/api/agents/bookstore_bot/tools \
  -H 'Content-Type: application/json' \
  -d '{"tools": ["get_weather", "calculator", "search_restaurants"]}'
```

Retrieve assigned tools:

```bash
curl http://localhost:8080/api/agents/bookstore_bot/tools
```

## How Tools Work in Production

When an agent receives a message, the runtime enters a **tool loop** (max 10 iterations):

```
User message
  → LLM receives message + tool definitions
  → LLM responds with tool_calls
  → For each tool call:
      1. Built-in executor (e.g. "read" for KB files)
      2. Real executor → loads backend/tools/{function_name}.py
         → calls execute(args)
      3. Result sent back to LLM as tool response
  → LLM responds with tool_calls again, or final text
  → Loop until text response or max iterations reached
```

### Execution Priority

The runtime tries executors in this order:

1. **Built-in tools** — `read` (scoped to agent's `agents/{id}/kb/` directory)
2. **Real backend tools** — Python modules in `backend/tools/`
3. **Skill tools** — Python modules in `skills/*/backend/tools/` (from enabled skills)
4. If none match → `{"error": "No backend implementation for tool: ..."}`

### Important: Linking Defined Tools to Real Backends

Tools can come from two sources:

| Source | Definition | Backend | Use Case |
|--------|-----------|---------|----------|
| **Built-in** | `test_definitions/tools/{tool_id}.json` | `backend/tools/{function_name}.py` | Tools shipped with the platform |
| **Skills** | `skills/{id}/{tools_file}.json` | `skills/{id}/backend/tools/{function_name}.py` | Installable tool packages |

**The backend filename must match the `function.name` field** in the JSON definition.

For built-in tools: if your JSON definition has `"function": {"name": "get_weather", ...}`, create `backend/tools/get_weather.py`.

For skill tools: the backend is bundled inside the skill package. See [Skills](/skills/skills/) for details.

## Tool Registry

Tools are loaded from two locations:
- **`test_definitions/tools/`** — built-in tool JSON files
- **`skills/*/`** — tool definitions from installed and enabled skills

Each built-in tool file contains the OpenAI function schema and a mock response:

```json
{
  "id": "get_weather",
  "name": "Get Weather",
  "description": "Get current weather information for a location",
  "function": {
    "name": "get_weather",
    "description": "Get current weather information for a location",
    "parameters": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "description": "City name or location"
        }
      },
      "required": ["location"]
    }
  },
  "mock_response": {
    "location": "Jakarta",
    "weather": {"temp": 32, "condition": "Cerah berawan", "humidity": 75}
  },
  "mock_response_type": "json"
}
```

### Mock Response Types

| Type | Description |
|------|-------------|
| `json` | Static JSON object returned as-is during evaluation |
| `javascript` | JavaScript code string executed via Node.js subprocess. Receives `ARGS` as a JSON string of the tool arguments |

## Backend Tool Implementations

Real tool backends live in `backend/tools/<function_name>.py`. Each file exports an `execute` function:

```python
# backend/tools/calculator.py

def execute(agent: dict, args: dict) -> dict:
    expression = args.get("expression", "")
    # ... validation ...
    result = eval(expression, {"__builtins__": {}})
    return {"result": result, "expression": expression}
```

The `agent` parameter provides context about the calling agent and user:

| Key | Description |
|-----|-------------|
| `agent_id` | Agent identifier |
| `agent_name` | Agent display name |
| `agent_model` | Model override (if set) |
| `user_id` | External user who sent the message |
| `channel_id` | Channel source (`None` for web Chat) |
| `session_id` | Current chat session ID |

### Auto-Reload

Backend tool files are **automatically reloaded** when modified. The registry checks `os.path.getmtime()` before each execution — no server restart needed. This makes development fast: edit the `.py` file, save, and the next tool call uses the updated code.

### Fallback Behavior

If no Python backend exists for a tool, the real executor returns `{"error": "No backend implementation for tool: <name>"}`. For tools that only have mock responses (used in evaluation), you must create a corresponding Python file for production use.

## Built-in Tools

### `clear_log_file`

Clears the agent-specific `llm.log` and `sessrecap.log` files (located in `logs/{agent_id}/`) and adds a reset marker with the current date. Useful for resetting API call and session recap logs between sessions.

```json
{
  "name": "clear_log_file",
  "description": "Truncates the agent-specific llm.log and sessrecap.log files and adds a reset marker with the current date.",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

### `use_skill`

Lazy-loads a skill's SYSTEM.md knowledge into the agent context. Use this when you need to understand a skill's capabilities before using it.

```json
{
  "name": "use_skill",
  "description": "Lazy-load a skill's SYSTEM.md knowledge into the agent context. Use this when you need to understand a skill's capabilities before using it.",
  "parameters": {
    "type": "object",
    "properties": {
      "skill_id": {
        "type": "string",
        "description": "The ID of the skill to load (e.g., 'hello_world')."
      }
    },
    "required": ["skill_id"]
  }
}
```

## Tool Parameter View

When tools are called, their parameters are rendered with rich formatting in the chat UI:

- **Python syntax highlighting** for `runpy` parameters
- **Structured display** for complex nested arguments
- **Syntax-aware rendering** that adapts to the tool's parameter schema

This makes it easier to read and understand tool calls during conversations.

## Heuristic Code Safety

The `runpy` and `bash` tools are protected by a **3-layer heuristic safety system** that prevents dangerous operations:

1. **Pattern matching** — Blocks dangerous patterns like `rm -rf /`, `dd if=`, `mkfs`, etc.
2. **Path validation** — Ensures file operations stay within the agent's workspace directory
3. **Command whitelisting** — Restricts allowed commands and flags

See [Heuristic Safety](/guides/heuristic-safety) for full details.

## Creating New Tools

See the full guide: [Creating Tools](/development/creating-tools)

Quick summary:
1. Create a JSON definition in `test_definitions/tools/<name>.json`
2. Create a Python backend in `backend/tools/<name>.py`
3. Assign the tool to an agent via the **Tools** tab

Alternatively, package multiple related tools as a **skill** for easy distribution and installation. See [Skills](/skills/skills/).
