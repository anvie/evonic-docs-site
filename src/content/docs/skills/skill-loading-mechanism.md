---
title: Overview
description: "How Evonic manages lazy-loading and non-lazy skills, from skill.json to LLM context injection."
sidebar:
  order: 5
---

Every skill in Evonic has two loading modes controlled by a single field in `skill.json`: **`lazy_tools`**. This mode determines **when** tool definitions and system prompts enter the agent's context.

| Mode | `lazy_tools` | Tool definitions enter | System prompt enters |
|------|-------------|----------------------|--------------------------|
| **Non-lazy** | `false` | Immediately at agent start | Via `_build_static_prompt` |
| **Lazy** | `true` | Only after the agent calls `use_skill()` | Via `use_skill()` → mid-turn injection |

---

## Non-Lazy Skill (`lazy_tools: false`)

This is the classic mode — the skill feels like a regular built-in tool. Its tool definitions and system prompt are ready from the moment the agent starts conversing.

### Example: Scheduler Skill

```json
// skills/scheduler/skill.json
{
  "id": "scheduler",
  "lazy_tools": false,
  "tools_file": "tools.json"
}
```

### How the Flow Works

1. **Agent start** → `build_tools()` is called
2. `build_tools()` calls `tool_registry.get_all_tool_defs()`
3. `get_all_tool_defs()` calls `skills_manager.get_all_skill_tool_defs()`
   - This function **skips** skills with `lazy_tools: true`
   - It picks up tool definitions from skills with `lazy_tools: false`
4. Tool definitions are directly added to the `tools` array sent to the LLM

For the system prompt:

1. **Agent start** → `build_system_prompt()` → `_build_static_prompt()`
2. `_build_static_prompt()` calls `tool_registry.get_all_tool_defs()`
3. Tool definitions that have a `system_prompt` field get injected into the middle of the system prompt
4. Skill system prompts show up in the **## Available Knowledge Files** and **## Skills** sections

```python
# backend/agent_runtime/context.py — _build_static_prompt

# Inject system_prompt from assigned tool definitions
assigned_ids = set(db.get_agent_tools(eid))
if assigned_ids:
    for tool_def in tool_registry.get_all_tool_defs():
        tool_prompt = tool_def.get('system_prompt', '').strip()
        if tool_prompt:
            parts.append(tool_prompt)
```

### Pros & Cons

**Pros:**
- Tools are ready to use immediately, no waiting time
- Great for skills that are always needed (like scheduler, file tools)

**Cons:**
- Tool definitions pile up in the context from the start
- Makes the prompt longer even if the skill isn't actually used

---

## Lazy Skill (`lazy_tools: true`)

This mode keeps the skill **"asleep"** until the agent needs it. Tool definitions and system prompts are only loaded after the agent calls `use_skill({id: '...'})`.

### Example: Kanban Skill

```json
// skills/kanban/skill.json
{
  "id": "kanban",
  "lazy_tools": true,
  "tools_file": "tools.json"
}
```

### Complete use_skill() Flow

```
Agent calls use_skill({id: 'kanban'})
        │
        ▼
use_skill.py execute()
        │
        ├── Check enabled in DB
        ├── Check per-agent allowlist
        ├── Check super_only restriction
        ├── Read SYSTEM.md from disk
        │
        ├── If lazy_tools: true
        │     ├── Get tool definitions from skills_manager.get_skill_tool_defs()
        │     └── Return { system_md, inject_tools: [...] }
        │
        └── If lazy_tools: false (but skill is lazy)
              └── Return { system_md }
```

Back in `llm_loop.py` — the main loop:

```python
# backend/agent_runtime/llm_loop.py — in tool execution handler

# Lazy tool injection: use_skill returned tool defs to inject mid-turn
if fn_name == 'use_skill' and isinstance(tool_result, dict) and 'inject_tools' in tool_result:
    injected = tool_result.pop('inject_tools')
    loaded_sid = tool_result.get('id', '')
    injected_fns = []
    for td in injected:
        fn = td.get('function', {}).get('name', '')
        if fn and not any(t.get('function', {}).get('name') == fn for t in tools):
            tools.append({"type": "function", "function": td['function']})
            injected_fns.append(fn)
    if loaded_sid and injected_fns:
        _loaded_lazy_skills[loaded_sid] = injected_fns
        # Persist to session_skill_tools
        session_skill_tools.setdefault(session_id, {})[loaded_sid] = [...]

# Persistent skill context: capture system_md for re-injection each iteration
if fn_name == 'use_skill' and isinstance(tool_result, dict) and tool_result.get('system_md'):
    loaded_sid = tool_result.get('id', '')
    if loaded_sid:
        _skill_system_mds[loaded_sid] = tool_result['system_md']
        # Persist to session_skill_mds
        session_skill_mds.setdefault(session_id, {})[loaded_sid] = tool_result['system_md']
```

### What Happens After Injection?

**Tool definitions** are appended to the `tools` array sent to the LLM on the next loop iteration. The agent can immediately call that skill's tools.

**System prompts** for skills are stored in `_skill_system_mds` and re-injected every loop iteration:

```python
# llm_loop.py — on every loop iteration
for sk_id, sk_content in _skill_system_mds.items():
    marker = f'## Skill Context: {sk_id}'
    sk_msg = {"role": "system", "content": f"{marker}\n\n{sk_content}"}
    # Find or insert in messages array
```

This is important because in long conversations, system messages can get lost to summarization. By re-injecting every iteration, the skill context stays intact.

### Unload Skill

```python
# llm_loop.py — in tool execution handler

# Lazy tool removal
if fn_name == 'unload_skill' and isinstance(tool_result, dict) and tool_result.get('remove_tools'):
    unload_sid = tool_result.get('id', '')
    if unload_sid in _loaded_lazy_skills:
        fns_to_remove = set(_loaded_lazy_skills.pop(unload_sid))
        tools[:] = [t for t in tools if t.get('function', {}).get('name', '') not in fns_to_remove]
        session_skill_tools.get(session_id, {}).pop(unload_sid, None)

# Persistent skill context: clear system_md
if fn_name == 'unload_skill' and isinstance(tool_result, dict):
    unload_sid = tool_result.get('id', '')
    _skill_system_mds.pop(unload_sid, None)
    session_skill_mds.get(session_id, {}).pop(unload_sid, None)
```

What gets unloaded:
1. **Tool definitions** — removed from the `tools` array, skill tools can no longer be called
2. **System prompt** — removed from `_skill_system_mds`, no longer re-injected in subsequent iterations
3. **Persisted state** — removed from `session_skill_tools` and `session_skill_mds`

### Pros & Cons

**Pros:**
- Saves LLM context — tool definitions & system prompt only appear when needed
- Great for optional or rarely-used skills

**Cons:**
- Adds one round-trip: agent must call `use_skill()` first before using the tools
- Slightly more complex to debug

---

## Skill Awareness in System Prompt

Skills get an **awareness entry** in the system prompt via `_build_static_prompt`, regardless of their lazy status:

```python
# context.py — _build_static_prompt
if skills_with_system_md:
    parts.append("\n## Skills")
    parts.append("You have these skills that can be loaded using `use_skill` tool:")
    for skill_id, desc in skills_with_system_md:
        parts.append(f"- `{skill_id}` - {desc}")
```

The result in the system prompt looks like this:

```
## Skills
You have these skills that can be loaded using `use_skill` tool:
- `kanban` - Allows agents to interact with the Kanban board...
- `subagent` - Spawn ad-hoc sub-agents...
- `plugin_creator` - Create, validate, and manage plugin packages...
```

This applies to **all** skills (lazy & non-lazy). The difference:
- **Non-lazy skill**: tools are already there, ready to use
- **Lazy skill**: tools aren't loaded yet — the agent must call `use_skill()` first

---

## Implementation Details

### 1. `skills_manager.py` — Lazy Tools Gatekeeper

```python
# backend/skills_manager.py
def get_all_skill_tool_defs(self) -> List[Dict[str, Any]]:
    """Load tool definitions from ALL enabled skills.
    Skills with lazy_tools=true are excluded here — their tool defs are
    only injected into the LLM context after the agent calls use_skill()."""
    all_defs = []
    for skill in self.list_skills():
        if skill.get('lazy_tools', False):
            continue  # ← Skip lazy skills!
        # ... collect tool definitions from non-lazy skills ...
    return all_defs
```

### 2. `use_skill.py` — Skill Loader

```python
# backend/tools/use_skill.py
result = {
    "status": "success",
    "id": skill_id,
    "system_md": content,
}

# For lazy_tools skills, include tool definitions for runtime injection
if manifest.get('lazy_tools', False):
    tool_defs = skills_manager.get_skill_tool_defs(skill_id)
    if tool_defs:
        result['inject_tools'] = tool_defs
        result['message'] += f" Tool definitions have been injected ({len(tool_defs)} tool(s) now available)."
```

### 3. `unload_skill.py` — Skill Unloader

```python
# backend/tools/unload_skill.py
return {
    "status": "success",
    "id": skill_id,
    "remove_tools": True,
    "message": f"Skill '{skill_id}' has been unloaded. Its tools are no longer available in this context."
}
```

### 4. `registry.py` — Factory for Built-in Tools

`use_skill` and `unload_skill` themselves are built-in tools created factory-style:

```python
# backend/tools/registry.py — ToolRegistry.__init__
self._builtins['builtin:use_skill'] = _builtin_use_skill_factory
self._builtins['builtin:unload_skill'] = _builtin_unload_skill_factory
```

These factory functions are always available to every agent, so `use_skill` & `unload_skill` can be called anytime.

### 5. `llm_loop.py` — Session Persistence

Skill state is persisted per session so it doesn't get lost between turns:

```python
def run_tool_loop(agent, agent_context, messages, tools, session_id, ...,
                  session_skill_mds: dict,     # Persisted skill SYSTEM.md content per session
                  session_skill_tools: dict,   # Persisted skill tool definitions per session
                  ...):
    # Restore from persisted state
    _skill_system_mds = dict(session_skill_mds.get(session_id, {}))
    _loaded_lazy_skills = {...}
    
    # Re-inject persisted skill tools into this turn
    for _sk_tds in session_skill_tools.get(session_id, {}).values():
        for td in _sk_tds:
            fn = td.get('function', {}).get('name', '')
            if fn and fn not in _existing_fns:
                tools.append(td)
```

This is crucial: if an agent calls `use_skill` in turn 1, the skill stays available in turns 2, 3, and beyond — until `unload_skill` is called.

---

## Visual Summary

```
                    ┌───────────────────────────────────────┐
                    │           Agent Start                    │
                    └──────────────────┬──────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │   build_tools()          │
                    │   build_system_prompt()  │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │  SkillsManager           │
                    │  .get_all_skill_tool_defs│
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │  lazy_tools: false?      │
                    │     → Inject tools       │────── Inject directly into tools[]
                    │  lazy_tools: true?       │
                    │     → Skip               │────── Wait for use_skill()
                    └───────────────────────────────────┘

                    ┌───────────────────────────────────────┐
                    │           Agent calls use_skill()       │
                    └──────────────────┬──────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │  use_skill.py execute()  │
                    │  → Read SYSTEM.md        │
                    │  → Get tool defs         │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │  llm_loop.py             │
                    │  → inject_tools into tools[]│
                    │  → _skill_system_mds     │
                    │  → session_skill_tools   │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │  Each iteration:          │
                    │  → Re-inject system_md    │
                    │  → Tools are ready to use │
                    └───────────────────────────────────┘
```

---

## Key Takeaways

1. **`lazy_tools`** in `skill.json` determines when skill tools enter the LLM context
2. **Non-lazy** (`false`): tools are available immediately from agent start — ideal for core skills
3. **Lazy** (`true`): tools are only available after `use_skill()` is called — saves context
4. **Skill system prompts** are re-injected every loop iteration so they don't get lost to summarization
5. **State persists per session**: once loaded, a skill stays active across turns until it's unloaded
6. **Built-in tools** (`use_skill`, `unload_skill`) are created via the factory pattern in `registry.py` and are always available
