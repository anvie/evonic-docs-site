---
title: Skill Loading Mechanism
description: "Bagaimana Evonic mengelola lazy-loading dan non-lazy skill, dari skill.json hingga inject ke LLM context."
sidebar:
  order: 5
---

## Overview

Setiap skill di Evonic punya dua mode loading yang dikontrol lewat satu field di `skill.json`: **`lazy_tools`**. Mode ini menentukan **kapan** tool definitions dan system prompt skill masuk ke context agent.

| Mode | `lazy_tools` | Tool definitions masuk | System prompt skill masuk |
|------|-------------|----------------------|--------------------------|
| **Non-lazy** | `false` | Langsung saat agent start | Lewat `_build_static_prompt` |
| **Lazy** | `true` | Hanya setelah agent panggil `use_skill()` | Lewat `use_skill()` → inject mid-turn |

---

## Non-Lazy Skill (`lazy_tools: false`)

Cara ini adalah mode klasik: skill-nya berasa kayak built-in tool biasa. Tool definitions dan system prompt-nya udah siap sejak agent pertama kali ngobrol.

### Contoh: Scheduler Skill

```json
// skills/scheduler/skill.json
{
  "id": "scheduler",
  "lazy_tools": false,
  "tools_file": "tools.json"
}
```

### Flow-nya gimana?

1. **Agent start** → `build_tools()` dipanggil
2. `build_tools()` manggil `tool_registry.get_all_tool_defs()`
3. `get_all_tool_defs()` manggil `skills_manager.get_all_skill_tool_defs()`
   - Fungsi ini **skip** skill yang `lazy_tools: true`
   - Ambil tool definitions dari skill yang `lazy_tools: false`
4. Tool definitions langsung masuk ke array `tools` yang dikirim ke LLM

Buat system prompt-nya:

1. **Agent start** → `build_system_prompt()` → `_build_static_prompt()`
2. `_build_static_prompt()` manggil `tool_registry.get_all_tool_defs()`
3. Tool definitions yang punya field `system_prompt` bakal di-inject ke bagian tengah system prompt
4. System prompt skill muncul di bagian **## Available Knowledge Files** dan info **## Skills**

```python
# backend/agent_runtime/context.py — _build_static_prompt

# Inject system_prompt dari assigned tool definitions
assigned_ids = set(db.get_agent_tools(eid))
if assigned_ids:
    for tool_def in tool_registry.get_all_tool_defs():
        tool_prompt = tool_def.get('system_prompt', '').strip()
        if tool_prompt:
            parts.append(tool_prompt)
```

### Kelebihan & Kekurangan

**Kelebihan:**
- Tool langsung bisa dipake, tanpa waiting time
- Cocok buat skill yang pasti selalu dipake (kayak scheduler, file tools)

**Kekurangan:**
- Tool definitions numpuk di context dari awal
- Bikin prompt lebih panjang walaupun skill belum tentu dipake

---

## Lazy Skill (`lazy_tools: true`)

Mode ini bikin skill-nya **"tidur"** sampai agent butuh. Tool definitions dan system prompt cuma di-load setelah agent manggil `use_skill({id: '...'})`.

### Contoh: Kanban Skill

```json
// skills/kanban/skill.json
{
  "id": "kanban",
  "lazy_tools": true,
  "tools_file": "tools.json"
}
```

### Flow Lengkap use_skill()

```
Agent manggil use_skill({id: 'kanban'})
        │
        ▼
use_skill.py execute()
        │
        ├── Cek enabled di DB
        ├── Cek allowlist per-agent
        ├── Cek super_only restriction
        ├── Baca SYSTEM.md dari disk
        │
        ├── Kalau lazy_tools: true
        │     ├── Ambil tool definitions dari skills_manager.get_skill_tool_defs()
        │     └── Return { system_md, inject_tools: [...] }
        │
        └── Kalau lazy_tools: false (tapi skill ini lazy)
              └── Return { system_md }
```

Kembali ke `llm_loop.py` — di loop utama:

```python
# backend/agent_runtime/llm_loop.py — di tool execution handler

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
        # Persist ke session_skill_tools
        session_skill_tools.setdefault(session_id, {})[loaded_sid] = [...]

# Persistent skill context: capture system_md for re-injection each iteration
if fn_name == 'use_skill' and isinstance(tool_result, dict) and tool_result.get('system_md'):
    loaded_sid = tool_result.get('id', '')
    if loaded_sid:
        _skill_system_mds[loaded_sid] = tool_result['system_md']
        # Persist ke session_skill_mds
        session_skill_mds.setdefault(session_id, {})[loaded_sid] = tool_result['system_md']
```

### Apa yang terjadi setelah inject?

**Tool definitions** langsung nempel ke array `tools` yang dikirim ke LLM di iterasi loop selanjutnya. Agent bisa langsung manggil tool-tool skill tersebut.

**System prompt** skill juga disimpan di `_skill_system_mds` dan di-reinject tiap iterasi loop:

```python
# llm_loop.py — di setiap iterasi loop
for sk_id, sk_content in _skill_system_mds.items():
    marker = f'## Skill Context: {sk_id}'
    sk_msg = {"role": "system", "content": f"{marker}\n\n{sk_content}"}
    # Cari atau sisipkan di messages array
```

Ini penting karena di percakapan panjang, system message bisa kena summarization. Dengan reinject tiap iterasi, skill context tetap terjaga.

### Unload Skill

```python
# llm_loop.py — di tool execution handler

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

Yang di-unload:
1. **Tool definitions** — dihapus dari array `tools`, skill tools gak bisa dipanggil lagi
2. **System prompt** — dihapus dari `_skill_system_mds`, gak di-reinject di iterasi berikutnya
3. **Persisted state** — dihapus dari `session_skill_tools` dan `session_skill_mds`

### Kelebihan & Kekurangan

**Kelebihan:**
- Context LLM lebih hemat — tool definitions & system prompt cuma nongol pas butuh
- Cocok buat skill yang jarang dipake sekaligus berat tool-nya banyak (kayak Kanban, Subagent)

**Kekurangan:**
- Agent harus tau skill mana yang available (didaftarkan di system prompt bagian ## Skills)
- Butuh 1-2 extra turn untuk load skill sebelum bisa pake tool-nya

---

## System Prompt: Bagian ## Skills

Biar agent tau skill apa aja yang available, Evonic otomatis nge-list skill yang punya SYSTEM.md di bagian ## Skills dari system prompt:

```python
# context.py — _build_static_prompt
if skills_with_system_md:
    parts.append("\n## Skills")
    parts.append("You have these skills that can be loaded using `use_skill` tool:")
    for skill_id, desc in skills_with_system_md:
        parts.append(f"- `{skill_id}` - {desc}")
```

Hasilnya di system prompt kira-kira gini:

```
## Skills
You have these skills that can be loaded using `use_skill` tool:
- `kanban` - Allows agents to interact with the Kanban board...
- `subagent` - Spawn ad-hoc sub-agents...
- `plugin_creator` - Create, validate, and manage plugin packages...
```

Ini berlaku untuk **semua** skill (lazy & non-lazy). Bedanya:
- **Non-lazy skill**: tools-nya udah ada, tinggal pake aja
- **Lazy skill**: tools-nya belum ada, agent harus `use_skill()` dulu

---

## Detail Implementasi

### 1. `skills_manager.py` — Gatekeeper Lazy Tools

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
        # ... ambil tool definitions dari skill non-lazy ...
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

### 4. `registry.py` — Factory untuk Built-in Tools

`use_skill` dan `unload_skill` sendiri adalah built-in tools yang dibuat factory-style:

```python
# backend/tools/registry.py — ToolRegistry.__init__
self._builtins['builtin:use_skill'] = _builtin_use_skill_factory
self._builtins['builtin:unload_skill'] = _builtin_unload_skill_factory
```

Factory functions ini selalu available untuk semua agent, jadi `use_skill` & `unload_skill` bisa dipanggil kapan aja.

### 5. `llm_loop.py` — Session Persistence

Skill state di-persist per session supaya gak ilang antar turn:

```python
def run_tool_loop(agent, agent_context, messages, tools, session_id, ...,
                  session_skill_mds: dict,     # Persisted skill SYSTEM.md content per session
                  session_skill_tools: dict,   # Persisted skill tool definitions per session
                  ...):
    # Restore dari persisted state
    _skill_system_mds = dict(session_skill_mds.get(session_id, {}))
    _loaded_lazy_skills = {...}
    
    # Re-inject persisted skill tools ke turn ini
    for _sk_tds in session_skill_tools.get(session_id, {}).values():
        for td in _sk_tds:
            fn = td.get('function', {}).get('name', '')
            if fn and fn not in _existing_fns:
                tools.append(td)
```

Ini penting: kalau agent `use_skill` di turn 1, skill-nya tetep ada di turn 2, 3, dan seterusnya sampai di-`unload_skill`.

---

## Ringkasan Visual

```
                    ┌─────────────────────────────────────────┐
                    │           Agent Start                    │
                    └────────────┬────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   build_tools()          │
                    │   build_system_prompt()  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  SkillsManager           │
                    │  .get_all_skill_tool_defs│
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  lazy_tools: false?      │
                    │     → Inject tools       │──── Langsung masuk tools[]
                    │  lazy_tools: true?       │
                    │     → Skip               │──── Tunggu use_skill()
                    └──────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │           Agent panggil use_skill()       │
                    └────────────┬────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  use_skill.py execute()  │
                    │  → Baca SYSTEM.md        │
                    │  → Ambil tool defs       │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  llm_loop.py             │
                    │  → inject_tools ke tools[]│
                    │  → _skill_system_mds     │
                    │  → session_skill_tools   │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Tiap iterasi:           │
                    │  → Reinject system_md    │
                    │  → Tool udah siap pake   │
                    └──────────────────────────┘
```

---

## Key Takeaways

1. **`lazy_tools`** di `skill.json` nentuin kapan skill tools masuk ke LLM context
2. **Non-lazy** (`false`): tools langsung ada dari agent start — cocok buat skill inti
3. **Lazy** (`true`): tools cuma ada setelah `use_skill()` dipanggil — hemat context
4. **System prompt skill** di-reinject tiap iterasi loop biar gak ilang kena summarization
5. **State persist** per session: sekali load, skill bertahan antar turn sampai di-unload
6. **Built-in tools** (`use_skill`, `unload_skill`) dibuat via factory pattern di `registry.py` dan selalu tersedia
