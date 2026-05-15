---
title: Skill System
description: Understanding skill loading behavior — lazy vs eager, briefs, and visual badges.
sidebar:
  order: 5
---

## Overview

*Updated in v0.3.19.*

The skill system in Evonic lets you extend agent capabilities with installable packages that bundle tool definitions and Python backends. Starting in v0.3.19, skills have a richer loading system with **lazy** and **eager** loading modes, plus descriptive **briefs** that help you understand what each skill does at a glance.

## Skill Loading Behavior

Every skill has a **loading behavior** that determines when its tools become available:

| Mode | Badge | Behavior |
|------|-------|----------|
| **Eager** (default) | No badge | Tools are loaded and available as soon as the skill is assigned to an agent |
| **Lazy** | `Lazy` badge | Tools are only loaded when the agent explicitly calls `use_skill()` to activate them |

### Eager Loading (Default)

Eager-loaded skills have their tools available immediately. When you assign the skill to an agent, all its tools appear in the agent's tool registry right away.

**Best for:** Frequently used tools that the agent should always have access to.

### Lazy Loading

Lazy-loaded skills are registered but their tools are **not automatically loaded** into the agent's context. The agent must call the built-in `use_skill()` tool to activate them. This keeps the agent's context lean and reduces token usage.

Lazy skills display a **"Lazy" badge** on the skill card in the Web UI, making it easy to identify them.

**Best for:** Specialized or rarely used tools that don't need to be in context all the time.

### How Lazy Loading Works

1. A lazy skill is assigned to the agent (visible in the skill list)
2. The agent decides it needs the skill's tools
3. The agent calls `use_skill({id: "skill_name"})` to load the skill's tools into context
4. The tools become available for the agent to use
5. When done, the agent can call `unload_skill({id: "skill_name"})` to free up context

## Skill Briefs

Each skill can have a **brief** — a short description shown alongside the skill's name and ID. Briefs help you quickly understand what a skill does without opening its details.

In v0.3.19, briefs are displayed on:

- **Skill cards** in the Web UI (`/skills` page)
- **Skill assignment** interfaces when configuring an agent
- **Skill ID display** — the skill ID is now shown alongside its name in the card list

## Visual Indicators

### Skill ID

Starting in v0.3.19, each skill's **ID** (the unique identifier like `kanban`, `hello_world`) is displayed on its card in the skill list. This makes it easy to identify skills when using CLI commands that reference skill IDs.

### Lazy/Eager Badges

Skills with lazy loading display a **"Lazy"** badge on their card. Eager-loaded skills (the default) show no badge. This visual distinction helps you understand the loading behavior at a glance.

## Managing Load Behavior

The loading behavior is defined in the skill's manifest (`skill.json`). When creating a skill, you can set it to lazy or eager:

```json
{
  "id": "my-skill",
  "name": "My Skill",
  "version": "1.0.0",
  "lazy": true,
  "description": "Brief description shown in skill cards"
}
```

- `"lazy": true` — Skill uses lazy loading (shows "Lazy" badge)
- `"lazy": false` or omitted — Skill uses eager loading (default, no badge)

## Example: Eager vs Lazy in Action

| Skill | Load Mode | Badge | When Tools Are Available |
|-------|-----------|-------|-------------------------|
| Kanban | Eager | None | Immediately on assignment |
| File Converter | Lazy | `Lazy` | After agent calls `use_skill()` |

## Benefits

- **Reduced token usage** — Lazy skills don't bloat the agent's context until needed
- **Cleaner tool lists** — Agents only see tools from eager skills by default
- **Better discoverability** — Briefs and skill IDs make it easier to find the right skill
- **Clear visual feedback** — Badges tell you the loading behavior at a glance
