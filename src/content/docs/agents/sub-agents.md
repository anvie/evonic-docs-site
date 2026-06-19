---
title: Sub-Agents
description: Spawning, managing, and communicating with sub-agents for parallel task execution.
sidebar:
  order: 10
---

## Overview

**Sub-agents** are lightweight agent instances spawned dynamically by a parent agent. They inherit the parent agent's capabilities (tools, skills, model) and can work on tasks in parallel. When a sub-agent finishes or goes idle, it is automatically destroyed.

This is useful for:

- **Parallel task execution** — spawn multiple sub-agents to work on independent subtasks
- **Delegation** — hand off specialized work to a dedicated sub-agent
- **Background processing** — let a sub-agent handle long-running tasks while the parent continues

---

## Lifecycle

```
Parent spawns sub-agent
        │
        ▼
  ┌─────────────┐
  │  RUNNING    │──◄── receives instructions via send_agent_message
  └──────┬──────┘
         │
         ├── Task complete ──► auto-destroyed
         ├── Idle 10 min  ──► auto-destroyed
         └── Parent calls destroy ──► immediately destroyed
```

### Auto-Destroy (Idle Timeout)

Sub-agents are **automatically destroyed after 10 minutes of inactivity**. Idle means no message was sent to the sub-agent and no tool was executed by the sub-agent.

This keeps the system clean — you don't need to manually clean up sub-agents, though you can if you want.

---

## Core Tools

Three tools manage sub-agents:

| Tool | Purpose |
|------|---------|
| `spawn_sub_agent` | Create a new sub-agent |
| `destroy_sub_agent` | Terminate a sub-agent immediately |
| `list_sub_agents` | List all active sub-agents |

### `spawn_sub_agent`

Creates a new sub-agent and returns its agent ID.

```
spawn_sub_agent(name: "data_collector", description: "Collects API data")
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `name` | Yes | Display name for the sub-agent |
| `description` | No | Short description of its purpose |

**Returns:**

```json
{
  "agent_id": "data_collector",
  "status": "created"
}
```

The sub-agent inherits the parent's model and tool configuration. Its workspace is under `agents/<agent_id>/workspace/`.

### `destroy_sub_agent`

Terminates a running sub-agent immediately.

```
destroy_sub_agent(agent_id: "data_collector")
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `agent_id` | Yes | The sub-agent's ID to destroy |

### `list_sub_agents`

Lists all currently active sub-agents spawned by the calling agent.

```
list_sub_agents()
```

**Returns:**

```json
{
  "sub_agents": [
    {
      "agent_id": "data_collector",
      "name": "Data Collector",
      "status": "running",
      "created_at": "2026-05-11T10:00:00Z"
    }
  ]
}
```

---

## Communication

Sub-agents communicate with their parent via the **agent messaging system** (`send_agent_message`). The parent sends instructions, and the sub-agent replies when done.

```python
# Parent spawns and instructs a sub-agent
spawn_sub_agent(name: "researcher", description: "Researches topic X")
send_agent_message(
    target_agent_id: "researcher",
    message: "Please research topic X and summarize your findings"
)
```

The sub-agent processes the message, completes the research, and its final reply is **automatically forwarded** back to the parent's session.

### Important: Parent-Only Messaging

> **A sub-agent can only communicate with its direct parent.** Sub-agents cannot message other agents (including sibling sub-agents or the parent's parent). This is enforced by the system to prevent complex mesh communication patterns that are hard to debug.

### Message Flow

```
User ──► Parent Agent
              │
              ├── spawn_sub_agent("researcher")
              ├── send_agent_message(researcher, "research topic X")
              │
              ▼
         ┌──────────┐
         │researcher │── processes task
         └────┬─────┘
              │
              ▼  auto-forwarded reply
         Parent Agent ──► User
```

---

## Limitations

| Constraint | Value | Notes |
|------------|-------|-------|
| **Max sub-agents per parent** | 10 | Prevents resource exhaustion |
| **Nested sub-agents** | ❌ Not allowed | A sub-agent cannot spawn its own sub-agent |
| **Idle timeout** | 10 minutes | Auto-destroyed after inactivity |
| **Communication scope** | Parent only | Cannot message other agents |
| **Configuration** | Inherited from parent | Same model, tools, and skills |

These limits ensure the sub-agent system stays manageable and doesn't introduce runaway resource usage or complex debugging scenarios.

---

## Example Workflow

Here's a complete example of a parent agent using sub-agents to perform parallel data collection:

```python
# Step 1: Spawn two sub-agents
spawn_sub_agent(name: "api_collector", description: "Collects data from API A")
spawn_sub_agent(name: "db_collector", description: "Queries database B")

# Step 2: Send instructions to both
send_agent_message(
    target_agent_id: "api_collector",
    message: "Fetch all orders from API endpoint /orders and save the results"
)
send_agent_message(
    target_agent_id: "db_collector",
    message: "Query the customer database for active users and save the results"
)

# Step 3: Both sub-agents work in parallel
# Their replies are auto-forwarded when done

# Step 4: (Optional) Clean up early if needed
destroy_sub_agent(agent_id: "api_collector")
```

---



---

## v0.8.0 Updates

### `/sub` Slash Command

*Introduced in v0.8.0.*

You can now spawn sub-agents directly from chat using the `/sub` slash command, without needing to use `spawn_sub_agent` programmatically:

```
/sub <name> --description "<purpose>"
```

**Example:**
```
/sub researcher --description "Research topic X and summarize findings"
> Sub-agent 'researcher' spawned. It will report back when done.
```

### Direct Execution

Sub-agents now skip the planning phase and execute **directly**, reducing turn latency for delegated tasks. When a sub-agent receives a message, it immediately processes and responds without first generating a plan.

### Expanded Settings

Two new settings give fine-grained control over sub-agent behavior:

| Setting | Description |
|---------|-------------|
| `inter_agent_clear_context` | Whether the sub-agent's context is cleared between inter-agent messages (default: enabled) |
| `builtin_tools_enabled` | Whether built-in tools (read, write_file, etc.) are available to the sub-agent (per-agent toggle) |

These settings are configured in the agent's **Advanced** settings panel.

### Naming Enforcement

Sub-agent IDs are now protected by **naming-pattern enforcement**. The system validates that sub-agent names conform to the expected pattern and rejects invalid names with a clear error message.

---


## Best Practices

1. **Give descriptive names** — sub-agent IDs are auto-generated from the name you provide, so use clear names like `"data_collector"` or `"api_fetcher"`
2. **Keep tasks focused** — each sub-agent should handle one well-defined task
3. **Don't rely on sub-agents for critical state** — sub-agents are ephemeral and may be destroyed by idle timeout
4. **Use `list_sub_agents` to monitor** — check which sub-agents are still running before expecting results
5. **Stay within the 10-agent limit** — if you need more parallelism, design your workflow in batches
