---
title: Creating Tools
description: How to create tool definitions and real Python backend implementations.
sidebar:
  order: 3
---

## Overview

A tool has two parts:
1. **JSON definition** — OpenAI function schema + mock response (in `test_definitions/tools/`)
2. **Python backend** — real implementation for production (in `backend/tools/`)

The JSON definition is used for both evaluation (mock) and production (function schema). The Python backend is only called in production (agent runtime).

:::tip[Packaging multiple tools?]
If you're creating a set of related tools, consider packaging them as a **skill** for easy distribution. See [Skills](/skills/skills/).
:::

## Step 1: JSON Definition

Create `test_definitions/tools/<tool_name>.json`:

```json
{
  "id": "check_inventory",
  "name": "Check Inventory",
  "description": "Check product inventory levels",
  "function": {
    "name": "check_inventory",
    "description": "Check product inventory levels",
    "parameters": {
      "type": "object",
      "properties": {
        "product_id": {
          "type": "string",
          "description": "The product ID to check"
        }
      },
      "required": ["product_id"]
    }
  },
  "mock_response": {
    "product_id": "SKU-001",
    "quantity": 42,
    "warehouse": "Jakarta",
    "status": "in_stock"
  },
  "mock_response_type": "json"
}
```

The `function` field follows the [OpenAI function calling schema](https://platform.openai.com/docs/guides/function-calling). The `mock_response` is returned during evaluation tests.

### JavaScript Mock Responses

For dynamic mock behavior, use `"mock_response_type": "javascript"`:

```json
{
  "id": "calculator",
  "function": { ... },
  "mock_response": "const args = JSON.parse(ARGS);\nconst result = eval(args.expression);\nJSON.stringify({result: result});",
  "mock_response_type": "javascript"
}
```

The JavaScript code is executed via Node.js subprocess. The variable `ARGS` contains the tool arguments as a JSON string.

## Step 2: Python Backend

Create `backend/tools/<function_name>.py` — the filename **must match** the `function.name` field in the JSON definition:

```python
# backend/tools/check_inventory.py

import requests

def execute(agent: dict, args: dict) -> dict:
    """Check product inventory. Called in production mode."""
    product_id = args.get("product_id", "")

    if not product_id:
        return {"error": "product_id is required"}

    # Call your real API
    try:
        resp = requests.get(
            f"https://api.example.com/inventory/{product_id}",
            timeout=10
        )
        data = resp.json()
        return {
            "product_id": product_id,
            "quantity": data.get("quantity", 0),
            "warehouse": data.get("warehouse", "unknown"),
            "status": "in_stock" if data.get("quantity", 0) > 0 else "out_of_stock"
        }
    except Exception as e:
        return {"error": f"Inventory API error: {str(e)}"}
```

### Requirements

- The file **must** export an `execute(agent: dict, args: dict) -> dict` function
- `agent` is a context dict with the following keys:

| Key | Type | Description |
|-----|------|-------------|
| `agent_id` | `str` | Agent identifier |
| `agent_name` | `str` | Agent display name |
| `agent_model` | `str\|None` | Model override (if set) |
| `user_id` | `str` | External user who sent the message |
| `channel_id` | `str\|None` | Channel source (`None` for web Chat) |
| `session_id` | `str` | Current chat session ID |

- `args` contains the parsed arguments from the LLM's tool call
- Return a dict — this is serialized to JSON and sent back to the LLM
- Handle errors gracefully — return `{"error": "..."}` instead of raising exceptions

### Backend Examples

#### Calling an External REST API

```python
# backend/tools/get_weather.py

import requests
import os

API_KEY = os.environ.get("WEATHER_API_KEY", "")

def execute(agent: dict, args: dict) -> dict:
    location = args.get("location", "")
    if not location:
        return {"error": "location is required"}

    try:
        resp = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": location, "appid": API_KEY, "units": "metric"},
            timeout=10
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "location": location,
            "temperature": data["main"]["temp"],
            "condition": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"]
        }
    except requests.RequestException as e:
        return {"error": f"Weather API error: {str(e)}"}
```

#### Querying a Database

```python
# backend/tools/search_products.py

import sqlite3
import os

DB_PATH = os.environ.get("PRODUCTS_DB", "products.db")

def execute(agent: dict, args: dict) -> dict:
    query = args.get("query", "")
    if not query:
        return {"error": "query is required"}

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.execute(
            "SELECT id, name, price FROM products WHERE name LIKE ? LIMIT 10",
            (f"%{query}%",)
        )
        results = [{"id": r[0], "name": r[1], "price": r[2]} for r in cursor]
        conn.close()
        return {"results": results, "count": len(results)}
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}
```

#### Calling an Internal Microservice

```python
# backend/tools/create_booking.py

import requests
import os

BOOKING_SERVICE_URL = os.environ.get("BOOKING_SERVICE_URL", "http://localhost:3000")

def execute(agent: dict, args: dict) -> dict:
    guest_name = args.get("guest_name", "")
    room_type = args.get("room_type", "")
    check_in = args.get("check_in", "")
    check_out = args.get("check_out", "")

    if not all([guest_name, room_type, check_in, check_out]):
        return {"error": "guest_name, room_type, check_in, and check_out are required"}

    try:
        resp = requests.post(
            f"{BOOKING_SERVICE_URL}/api/bookings",
            json={
                "guest_name": guest_name,
                "room_type": room_type,
                "check_in": check_in,
                "check_out": check_out
            },
            timeout=15
        )
        resp.raise_for_status()
        booking = resp.json()
        return {
            "booking_id": booking["id"],
            "status": booking.get("status", "confirmed"),
            "message": f"Booking created for {guest_name}"
        }
    except requests.RequestException as e:
        return {"error": f"Booking service error: {str(e)}"}
```

#### Using Agent Context

The `agent` dict lets you personalize behavior based on who's calling:

```python
# backend/tools/get_order_status.py

def execute(agent: dict, args: dict) -> dict:
    order_id = args.get("order_id", "")
    user_id = agent.get("user_id")
    channel = agent.get("channel_id")

    # Log which user/channel requested this
    print(f"Order lookup by user={user_id} via channel={channel}")

    # Could scope queries by agent or user
    # e.g., only return orders belonging to this user
    return {"order_id": order_id, "status": "shipped", "user_id": user_id}
```

## Auto-Reload

Backend tool files are **automatically reloaded** when modified. The registry (`backend/tools/registry.py`) checks `os.path.getmtime()` before each execution. Edit the `.py` file, save it, and the next tool call uses the updated code — no server restart needed.

The module cache stores:
- The loaded module
- The file's last modification time
- The file path

When `mtime` changes, the module is re-imported automatically.

## Tool Execution Flow

### Production (Agent Runtime)

```
agent_runtime._run_tool_loop()
  → LLM returns tool_calls
  → For each tool call:
      1. Try built-in executor (handles "read" tool for KB files)
      2. If not built-in → real executor:
         - registry._load_tool_module(function_name)
         - Searches: backend/tools/{name}.py → skills/*/backend/tools/{name}.py
         - Calls module.execute(agent_context, args)
      3. If no .py file exists → {"error": "No backend implementation..."}
  → Result added to messages as tool response
  → Loop continues (max 10 iterations)
```

### Evaluation (Mock Mode)

```
evaluator/engine.py → _run_tool_calling_loop()
  → LLM returns tool_calls
  → Mock executor returns mock_response from JSON definition
  → No Python backend needed
```

## Adding to an Agent

After creating both the JSON definition and Python backend:

1. The tool appears in **Settings → Tools** and in agent tool assignment
2. Assign it to an agent via the **Tools** tab on the agent detail page
3. Or via API:
   ```bash
   curl -X PUT http://localhost:8080/api/agents/{agent_id}/tools \
     -H 'Content-Type: application/json' \
     -d '{"tools": ["check_inventory", "get_weather", "create_booking"]}'
   ```
4. The agent will see the tool's function schema in its LLM requests and execute the Python backend when called

## Checklist

| Step | File | Required? |
|------|------|-----------|
| JSON definition | `test_definitions/tools/{id}.json` | Yes — provides function schema |
| Mock response | `mock_response` field in JSON | For evaluation only |
| Python backend | `backend/tools/{function_name}.py` | For production only |
| Assign to agent | UI or API | Yes — tool must be assigned |

## Alternative: Package as a Skill

For distributing a set of related tools, create a skill package instead. Skills bundle the tool definitions and Python backends into a single installable unit:

```
my-skill/
├── skill.json              # Manifest
├── setup.py                # install() / uninstall() hooks
├── tools-defs.json         # Tool definitions array
└── backend/tools/*.py      # Backend implementations
```

See the full [Skills guide](/skills/skills/) for details on creating, installing, and managing skill packages.

## Patch Tool Safety

The `patch` tool has been hardened to reject `indent_fuzzy` matches. This prevents silent tab/space corruption when the patch context has inconsistent indentation. If a patch would normally match via fuzzy indentation, the tool now returns an error instead of applying a potentially corrupted patch.

This is important because:
- Tabs and spaces are not interchangeable in most file formats
- A fuzzy match could silently change your indentation style
- The error message will tell you to fix the indentation in your patch

## Heuristic Code Safety

The `runpy` and `bash` tools are protected by a **3-layer heuristic safety system**:

1. **Pattern matching** — Blocks dangerous patterns like `rm -rf /`, `dd if=`, `mkfs`, etc.
2. **Path validation** — Ensures file operations stay within the agent's workspace directory
3. **Command whitelisting** — Restricts allowed commands and flags

The safety system is implemented in `backend/tools/lib/heuristic_safety.py` and is applied before any command is executed. If a command is blocked, the tool returns an error explaining which rule was violated.

See [Heuristic Safety](/guides/heuristic-safety) for full details on the safety rules and configuration.

## Tool Parameter View

When tools are called, their parameters are rendered with rich formatting in the chat UI:

- **Python syntax highlighting** for `runpy` parameters
- **Structured display** for complex nested arguments
- **Syntax-aware rendering** that adapts to the tool's parameter schema

This makes it easier to read and understand tool calls during conversations.
