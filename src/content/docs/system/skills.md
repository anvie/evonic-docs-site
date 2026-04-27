---
title: Skills
description: Skill packages — tool definitions bundled with Python backends.
sidebar:
  order: 3
---

# Skills

Skills are installable packages that bundle tool definitions (OpenAI function schemas) with their Python backend implementations. They extend the platform's tool capabilities without modifying core code.

## How Skills Fit In

```
Skill Package
    ├── skill.json          # Manifest
    ├── setup.py            # Lifecycle hooks
    ├── tool-definitions.json
    └── backend/tools/
            ├── tool_a.py
            └── tool_b.py
                ↓
Tool Registry (agent sees these tools)
                ↓
Agent Runtime (executes tools during conversation)
```

## Installing Skills

Skills are managed via:

- **Web UI** — the `/skills` page for uploading, enabling/disabling, and deleting
- **CLI** — the `evonic skill` commands for command-line management

Once installed and enabled, a skill's tools are automatically available for assignment to agents.

## Learn More

- [Skills — Full Reference](/skills/skills) — complete documentation with package structure, installation, and management
- [Skillsets](/skills/skillsets) — group skills for agent configuration
