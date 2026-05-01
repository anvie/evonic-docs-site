---
title: Skills
description: Install and manage skill packages that bundle tool definitions with Python backends.
sidebar:
  order: 7
---

## Overview

A **skill** is an installable package that bundles tool definitions (OpenAI function schemas) with their Python backend implementations. Skills extend the platform's tool capabilities without modifying core code.

Skills are managed via:
- **Web UI**: the `/skills` page for uploading, enabling/disabling, and deleting
- **CLI**: the `evonic skill` commands for command-line installation and management

Once installed and enabled, a skill's tools are automatically available for assignment to agents.

## Skill Package Structure

```
my-skill/
├── skill.json              # Manifest (required)
├── setup.py                # Lifecycle hooks (required)
├── my-tools-defs.json      # Tool definitions (required)
└── backend/
    └── tools/
        └── *.py            # One Python file per tool
```

### `skill.json`: Manifest

```json
{
  "id": "my-skill",
  "name": "My Skill",
  "version": "1.0.0",
  "description": "Description of what this skill does",
  "author": "Your Name",
  "tools_file": "my-tools-defs.json",
  "enabled": true
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (alphanumeric, dashes, underscores) |
| `name` | Yes | Display name |
| `version` | No | Semantic version |
| `description` | No | Short description |
| `author` | No | Author name |
| `tools_file` | Yes | Filename of the tool definitions JSON (relative to skill root) |
| `enabled` | No | Whether the skill is active (default: `true`) |

### `setup.py`: Lifecycle Hooks

```python
def install(context: dict) -> dict:
    """Called when the skill is installed or re-installed."""
    # Validate dependencies, perform first-time setup
    return {'success': True, 'message': 'Installed successfully.'}

def uninstall(context: dict) -> dict:
    """Called when the skill is uninstalled."""
    # Clean up runtime artifacts
    return {'success': True, 'message': 'Uninstalled successfully.'}
```

The `context` dict provides:

| Key | Description |
|-----|-------------|
| `skill_dir` | Absolute path to the installed skill directory |
| `app_dir` | Absolute path to the main application directory |
| `skill_id` | The skill's ID string |

Return `{'success': True}` on success or `{'success': False, 'errors': [...]}` on failure. Install errors are reported but do not block installation.

### Tool Definitions File

An array of OpenAI function tool definitions:

```json
[
  {
    "type": "function",
    "function": {
      "name": "my_tool",
      "description": "What this tool does",
      "parameters": {
        "type": "object",
        "properties": {
          "param1": {
            "type": "string",
            "description": "Parameter description"
          }
        },
        "required": ["param1"]
      }
    }
  }
]
```

### Backend Tool Files

Each tool defined in the JSON must have a matching Python file in `backend/tools/`. The filename must match the `function.name` field.

```python
# backend/tools/my_tool.py

def execute(agent: dict, args: dict) -> dict:
    param1 = args.get("param1", "")
    # ... your logic ...
    return {"result": "value"}
```

The `agent` and `args` parameters follow the same contract as [regular tool backends](/development/creating-tools#requirements). Skill tool files can import from sibling modules in the `backend/` directory (e.g., a shared `cli_helper.py`).

## Installing Skills

### Via the Web UI

1. Navigate to `/skills`
2. Click **Upload Skill**
3. Drop or select a `.zip` file containing the skill package
4. The skill is extracted, validated, and `setup.install()` is called

### Via CLI

```bash
# Install from a zip file
evonic skill add ./my-skill.zip

# Install from a local directory
evonic skill add ./my-skill/

# Install from GitHub
evonic skill add https://github.com/user/my-skill

# List installed skills
evonic skill list
```

### Zip File Structure

The zip can contain the skill files either at the root or inside a single subdirectory:

```
# Both work:
skill.zip/
├── skill.json
├── setup.py
└── ...

skill.zip/
└── my-skill/
    ├── skill.json
    ├── setup.py
    └── ...
```

## Managing Skills

### Global Skill Config

Skills can be globally enabled or disabled via `skills/config.json` at the project root. This config file controls which skills are available across the entire platform:

```json
{
  "skills": {
    "hello_world": { "enabled": true },
    "bookstore": { "enabled": true },
    "my-skill": { "enabled": false }
  }
}
```

When a skill is disabled in this config, it is hidden from the tool registry and cannot be assigned to agents, even if it is installed. The web UI `/skills` page also respects this global config.

### Enable/Disable

Toggle a skill's enabled state from the `/skills` page or via API:

```bash
curl -X PUT http://localhost:8080/api/skills/my-skill/toggle \
  -H 'Content-Type: application/json' \
  -d '{"enabled": false}'
```

### Get Skill Details

View detailed information about a specific skill:

```bash
evonic skill get my-skill
```

**Output:**

```
ID:        my-skill
Name:      My Skill
Version:   1.0.0
Status:    enabled
Description: Description of what this skill does

Tools (3):
  - my_tool
    What this tool does

Variables (0):
```

### Uninstalling

Uninstalling a skill removes it from the platform:

1. Deletes the skill directory from `skills/`
2. Removes the skill from the tool registry

```bash
evonic skill rm my-skill
```

Or via the web UI: click **Delete** on the skill card and confirm.

Disabled skills' tools are hidden from the registry and cannot be assigned to agents.

## Configurable Skills

Some skills support additional configuration through **skill settings**. These settings allow you to customize a skill's behavior without modifying its code.

Settings are configured via the UI setting block when assigning or configuring a skill for an agent. The exact settings available depend on the skill's implementation.

### Example: Kanban Skill Settings

The Kanban skill provides a setting `create_task_super_only`:

| Setting | Type | Description |
|---|---|---|
| `create_task_super_only` | Boolean | When `true`, only the super agent can create new tasks on the Kanban board. Other agents can still edit or delete tasks they have permission for, but cannot create new ones. |

To configure this:

1. Open the skill settings in the UI
2. Toggle `create_task_super_only` to your preference
3. Save: the setting takes effect immediately

### Adding Settings to a Custom Skill

To make a custom skill configurable:

1. Define settings in `skill.json` under a `settings` field:

```json
{
  "id": "my-skill",
  "name": "My Skill",
  "settings": [
    {
      "name": "allow_override",
      "type": "boolean",
      "default": false,
      "description": "Allow users to override the default behavior"
    }
  ]
}
```

2. Access settings in your backend via the `agent` context:

```python
def execute(agent: dict, args: dict) -> dict:
    allow_override = agent.get("skill_settings", {}).get("allow_override", False)
    if allow_override:
        # custom logic
    return {"result": "ok"}
```

## How Skills Integrate

### Tool Discovery

The `ToolRegistry` discovers tools from two sources:
1. **Built-in tools**: JSON files in `test_definitions/tools/`
2. **Skill tools**: definitions from `skills/*/` (enabled skills only)

Both sources are combined via `tool_registry.get_all_tool_defs()`.

### Tool Execution

When an agent calls a skill tool, the registry resolves the Python backend:

```
LLM returns tool_call(name="book_search", args={...})
  → Registry checks backend/tools/book_search.py (not found)
  → Registry searches skills/*/backend/tools/book_search.py
  → Found in skills/bookstore/backend/tools/book_search.py
  → Calls execute(agent_context, args)
  → Returns result to LLM
```

Skill backends are auto-reloaded on file change, just like built-in tool backends.

### Agent Assignment

Skill tools appear alongside built-in tools in the agent tool assignment UI. Assign them the same way: via the agent's **Tools** tab or the API.

## Example: Bookstore Booking Skill

The bundled `bookstore` skill demonstrates the pattern. It wraps the `bookstore-cli` CLI tool with 12 function tools:

```
skills/bookstore/
├── skill.json
├── setup.py                    # Validates bookstore-cli is in PATH
├── bookstore-tools-defs.json   # 12 tool definitions
└── backend/
    ├── cli_helper.py           # Shared subprocess wrapper
    └── tools/
        ├── book_search.py
        ├── inventory_check.py
        ├── order_place.py
        ├── member_lookup.py
        └── ... (12 files total)
```

Each tool backend delegates to `cli_helper.run_bookstore_cli()` which calls the CLI with `--json` output and parses the result:

```python
# backend/tools/room_list.py
from cli_helper import run_bookstore_cli

def execute(agent: dict, args: dict) -> dict:
    return run_bookstore_cli("book", "search")
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/skills` | List all installed skills |
| `GET` | `/api/skills/<id>` | Get skill details and tool list |
| `POST` | `/api/skills/upload` | Upload and install a skill zip |
| `PUT` | `/api/skills/<id>/toggle` | Enable or disable a skill |
| `DELETE` | `/api/skills/<id>` | Uninstall and delete a skill |
