---
title: CLI Overview
description: Universal CLI for managing Evonic skills and plugins.
---

# CLI Overview

The `evonic` CLI is the universal command-line interface for managing Evonic skills and plugins. It provides a fast, scriptable way to install, configure, and manage your agent ecosystem without needing the web UI.

## Installation

The CLI is included with the Evonic AI Platform. No separate installation is required.

```bash
# Check if CLI is available
evonic --help

# Or use full path
./evonic --help
```

## Quick Start

```bash
# List all installed skills
evonic skill list

# Install a skill from a zip file
evonic skill install ./my_skill.zip

# Install a skill from a directory
evonic skill install ./my_skill/

# List all installed plugins
evonic plugin list

# Get details about a specific skill
evonic skill info claimguard
```

## Command Structure

The CLI follows a simple hierarchical structure:

```bash
evonic <category> <command> [options] [arguments]
```

### Categories

| Category | Description |
|----------|-------------|
| `skill` | Manage skills (tool packages) |
| `plugin` | Manage plugins (event-driven extensions) |

### Common Options

| Option | Description |
|--------|-------------|
| `-h, --help` | Show help for a command |
| `-f, --force` | Force operation (overwrite existing) |

## Skills vs Plugins

Understanding the difference between skills and plugins is key to using the CLI effectively.

### Skills

Skills are **self-contained tool packages** that extend agent capabilities. Each skill includes:

- `skill.json` — Metadata (name, version, description, tools)
- `setup.py` — Python package configuration
- `backend/tools/` — Tool implementations (Python files)

Skills are **always available** to agents once installed. They provide tools that agents can invoke during conversations.

**Examples:**
- `krasan` — Hotel booking tools (7 tools)
- `claimguard` — Medical/clinical expert with ICD-10 coding (2 tools)
- `hello_world` — Simple demo skill (1 tool)

### Plugins

Plugins are **event-driven extensions** that respond to platform events. Each plugin includes:

- `plugin.json` — Metadata (name, version, description, events)
- `backend/` — Plugin implementation
- Configuration variables for customization

Plugins are **optional** and can be enabled/disabled. They run automatically when triggered by events.

**Examples:**
- `session-recap` — Extracts actionable items from session summaries and sends notifications

## Real-World Examples

### Installing Skills

```bash
# Install from zip
evonic skill install ./hotel_booking.zip

# Install from directory
evonic skill install ./my_custom_skill/

# Force overwrite existing skill
evonic skill install ./updated_skill.zip --force
```

### Managing Plugins

```bash
# Install plugin
evonic plugin install ./notification_plugin.zip

# View plugin logs
evonic plugin logs session-recap

# Reload plugin after changes
evonic plugin reload session-recap
```

### Configuration

```bash
# Show skill configuration
evonic skill config claimguard

# Set configuration value
evonic skill config claimguard --set API_KEY my-secret-key

# Show plugin configuration
evonic plugin config session-recap

# Set plugin configuration
evonic plugin config session-recap --set WEBHOOK_URL https://hooks.example.com/notify
```

## Next Steps

- [Skill Management](/cli/skills) — Complete guide to managing skills
- [Plugin Management](/cli/plugins) — Complete guide to managing plugins
- [Configuration](/cli/configuration) — Advanced configuration patterns
