---
title: CLI Commands
description: Complete reference for all Evonic CLI commands.
---

# CLI Commands

The `evonic` CLI is the command-line interface for managing the Evonic platform. It covers server management, agents, skills, skillsets, models, plugins, and schedules.

## Command Structure

```bash
evonic <category> <command> [options] [arguments]
```

## Available Categories

| Category | Description |
|----------|-------------|
| `start` / `stop` / `status` | Server management |
| `plugin` | Plugin management |
| `skill` | Skill (tool package) management |
| `skillset` | Skillset template management |
| `agent` | Agent management |
| `model` | LLM model management |

## Quick Reference

```bash
# Check CLI is available
evonic --help

# Start the server
evonic start

# List agents, skills, skillsets, models
evonic agent list
evonic skill list
evonic skillset list
evonic model list
```

## Next Steps

- [Server Management](/cli/server) — Start, stop, status, restart, logs
- [Agent Management](/cli/agents) — Create, update, enable, disable, remove agents
- [Skill Management](/cli/skills) — Install, get details, uninstall skills
- [Skillset Management](/cli/skillsets) — List templates, apply to agents
- [Model Management](/cli/models) — Add, get, remove LLM models
- [Plugin Management](/cli/plugins) — Install, uninstall, list plugins
