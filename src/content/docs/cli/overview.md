---
title: CLI Commands
description: Complete reference for all Evonic CLI commands.
---

The `evonic` CLI is the command-line interface for managing the Evonic platform. It covers server management, agents, skills, skillsets, models, plugins, schedules, and system diagnostics.

## Command Structure

```bash
evonic <command> [options] [arguments]
```

## Available Commands

| Command | Description |
|---------|-------------|
| `start` / `stop` / `status` | Server management |
| `setup` | Interactive first-time setup wizard |
| `pass` | Set or change admin dashboard password |
| `update` | Check for and apply self-updates |
| `doctor` | Run system diagnostics and health checks |
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

# Run system diagnostics
evonic doctor
evonic doctor --quick

# List agents, skills, skillsets, models
evonic agent list
evonic skill list
evonic skillset list
evonic model list
```

## Next Steps

- [Server Management](/cli/server): Start, stop, status, restart, logs, updates
- [System Diagnostics](/cli/doctor): Full system health check (environment, config, connections, LLM providers)
- [Agent Management](/cli/agents): Create, update, enable, disable, remove agents
- [Skill Management](/cli/skills): Install, get details, uninstall skills
- [Skillset Management](/cli/skillsets): List templates, apply to agents
- [Model Management](/cli/models): Add, get, remove LLM models
- [Plugin Management](/cli/plugins): Install, uninstall, list plugins
- [Schedule Management](/cli/schedules): Manage scheduled tasks
