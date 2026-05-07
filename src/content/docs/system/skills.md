---
title: Skills
description: "Skill packages: tool definitions bundled with Python backends."
sidebar:
  order: 3
---

Skills are installable packages that bundle tool definitions (OpenAI function schemas) with their Python backend implementations. Each skill package contains a manifest (`skill.json`), lifecycle hooks (`setup.py`), tool definitions (`tool-definitions.json`), and Python backends (`backend/tools/`). Once installed and enabled, a skill's tools are automatically available for assignment to agents.

Skills are managed via the Web UI (`/skills` page) or the `evonic skill` CLI commands.

For complete documentation: [Skills: Full Reference](/skills/skills) and [Skillsets](/skills/skillsets).
