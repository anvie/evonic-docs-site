---
title: Agent Management
description: CLI commands for managing Evonic agents.
---

Commands for creating, updating, enabling, disabling, and removing agents via the CLI.

## `evonic agent list`

List all agents with their status, tool count, and channel count.

```bash
evonic agent list
```

**Output:**

```
ID        Name         Status   Tools  Channels
-------------------------------------------------
siwa      Siwa Miwa    enabled     10         1
claimg    ClaimGuard   enabled      7         0
```

## `evonic agent get <agent_id>`

Show detailed information about a specific agent.

```bash
evonic agent get siwa
```

**Output:**

```
ID:          siwa
Name:        Siwa Miwa
Description: Super agent
Status:      enabled
Super:       yes
Model:       moonshotai/kimi-k2-thinking

System Prompt: Kamu adalah super agent Siwa Miwa...

Tools (10):
  - bash
  - calculator
  - patch
  ...

Channels (1):
  - Mirai
```

## `evonic agent add <agent_id>`

Create a new agent. Optionally apply a skillset template for pre-configured tools and prompt.

```bash
evonic agent add <agent_id> --name <name> [--description <desc>] [--model <model>] [--skillset <skillset_id>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | Yes | Display name for the agent |
| `--description` | No | Short description |
| `--model` | No | Model override |
| `--skillset` | No | Skillset template ID (pre-configures tools & prompt) |

**Example:**

```bash
# Basic agent
evonic agent add my_bot --name "My Bot"

# Agent from skillset template
evonic agent add dev_bot --name "Dev Bot" --skillset coder --description "Coding assistant"
```

**Output:**

```
Agent created: Dev Bot (dev_bot)
  Applied skillset: coder
```

## `evonic agent enable <agent_id>`

Enable a disabled agent.

```bash
evonic agent enable my_bot
```

**Output:**

```
Agent enabled: my_bot
```

## `evonic agent disable <agent_id>`

Disable an agent so it stops processing messages. Super agent cannot be disabled.

```bash
evonic agent disable my_bot
```

**Output:**

```
Agent disabled: my_bot
```

## `evonic agent remove <agent_id>`

Permanently remove an agent. Requires interactive confirmation.

```bash
evonic agent remove my_bot
```

**Output:**

```
Agent to remove:
  ID:        my_bot
  Name:      My Bot
  Status:    enabled
Are you sure? [y/N]: y
Agent removed: my_bot
```

## Next Steps

- [Skill Management](/cli/skills)
- [Skillset Management](/cli/skillsets)
