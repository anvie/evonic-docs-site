---
title: Overview
description: "How Evonic manages lazy-loading and non-lazy skills."
sidebar:
  order: 5
---

Every skill in Evonic has a loading mode controlled by one field in `skill.json`: **`lazy_tools`**. This setting decides **when** the skill's tools and system prompt become available to an agent.

| Mode | `lazy_tools` | Tools available | System prompt added |
|------|-------------|-----------------|---------------------|
| **Non-lazy** | `false` | Immediately at agent start | During system prompt building |
| **Lazy** | `true` | Only after `use_skill()` is called | Via `use_skill()` |

---

## Non-Lazy Skill (`lazy_tools: false`)

In this mode, the skill's tools and system prompt are ready the moment the agent starts. It works just like a built-in tool.

**Example — Scheduler skill:**

```json
{
  "id": "scheduler",
  "lazy_tools": false,
  "tools_file": "tools.json"
}
```

**How it works:**

1. When an agent starts, Evonic collects tool definitions from all non-lazy skills.
2. Lazy skills are skipped during this collection.
3. Non-lazy tool definitions go straight into the `tools` array sent to the LLM.
4. System prompts from non-lazy skills are included in the agent's system prompt.

**Best for:** Skills the agent always needs, like file tools or scheduling.

---

## Lazy Skill (`lazy_tools: true`)

The skill stays "asleep" until the agent needs it. Tools and system prompts are only loaded when the agent calls `use_skill({id: '...'})`.

**Example — Kanban skill:**

```json
{
  "id": "kanban",
  "lazy_tools": true,
  "tools_file": "tools.json"
}
```

**How it works:**

1. Agent calls `use_skill({id: 'kanban'})`.
2. The tool checks the skill is enabled, allowed, and reads the `SYSTEM.md` file.
3. If `lazy_tools` is `true`, it also loads the skill's tool definitions.
4. Tools are injected into the LLM context mid-turn — the agent can use them right away.
5. The skill's system prompt is stored and re-injected every loop iteration so it doesn't get lost in long conversations.

**To remove a lazy skill**, call `unload_skill({id: '...'})`. This removes its tools and system prompt from the context.

**Best for:** Optional or rarely-used skills that don't need to take up LLM context space all the time.

---

## Browsing Available Skills

Agents can see what skills are available through a section in the system prompt. The `## Skills` section lists all skills (both lazy and non-lazy) with short descriptions:

```
## Skills
You have these skills that can be loaded using `use_skill` tool:
- `kanban` - Allows agents to interact with the Kanban board...
- `subagent` - Spawn ad-hoc sub-agents...
```

The difference:
- **Non-lazy skill** — tools are ready immediately.
- **Lazy skill** — tools need `use_skill()` to load.

---

## How `use_skill` and `unload_skill` Work

`use_skill` and `unload_skill` are built-in tools available to every agent. They don't need to be loaded from a skill — they're always there.

- **`use_skill`** — loads the skill's `SYSTEM.md` content and, for lazy skills, injects tool definitions.
- **`unload_skill`** — removes the skill's tools and system prompt from the agent's context.

Skill state (what's loaded) is tracked per-session. If an agent loads a skill in one turn, it stays loaded in the next turn — until `unload_skill` is called.
