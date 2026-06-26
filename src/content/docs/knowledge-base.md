---
title: Knowledge Base
description: How Evonic's long-term memory works — the summarizer, LLM doc authoring, the evomem writer, and the wiki-link knowledge graph.
sidebar:
  order: 8
---

This page explains how an agent's **long-term memory** works under the hood: how
conversations turn into durable knowledge files in `kb/`, and how those files
become a navigable graph.

:::note
For the agent-facing feature — uploading KB files, the built-in `read` tool, and
`graph_query` — see [Agents: Knowledge Base](/agents/knowledge-base). This page
covers the *architecture* of automatic memory.
:::

## The mental model

Evonic's memory uses the **evomem** doc model (Obsidian-style):

- **Disk is the source of truth.** Each agent's knowledge lives as markdown files
  under `agents/<agent_id>/kb/`. Every `kb/**/*.md` file is one **doc**.
- **A doc** has YAML frontmatter (`title`, `type`, `description`, optional
  `tags`/`aliases`, `created`/`updated`) and a body of rich prose.
- **Relationships are inline.** Connections between subjects are written as
  Obsidian-style `[[Wiki Links]]` woven directly into the sentences — never a
  separate "Relations" list.
- **The graph is derived, not authored.** A background `sync` scans the markdown,
  parses the inline links, and rebuilds the graph database (`.evomem.db`). The
  graph is purely a projection of the files — it never invents new docs.

## Where files come from

There are two on-ramps into `kb/`, and they converge on the same writer and the
same graph sync.

```
                    ┌─────────────────── AUTOMATIC ───────────────────┐
                    │                                                  │
  conversation ──► summarizer ──► summary_updated ──► process_knowledge
                    (no kb write)     (event)              │
                                                           ▼
                                                      _author_docs   ◄── LLM decides
                                                           │              WHAT to write
                    ┌──────── MANUAL ────────┐             │
  agent tool call ──► write_file / remember ─┼─────────────┤
                                             │             ▼
                                             │      evomem_writer
                                             │   upsert_doc / append_to_doc  ◄── writes the file
                                             │             │
                                             └────────────►│
                                                           ▼
                                                       mark_dirty
                                                           │  (debounced ~2s)
                                                           ▼
                                                      evomem sync   ◄── builds the graph
                                                           │              from [[links]]
                                                           ▼
                                                       .evomem.db
```

### The automatic pipeline

1. **Summarizer** (`backend/agent_runtime/summarizer.py`). As a conversation
   grows, the summarizer condenses history into a running summary. It persists
   that summary to the database and logs — it writes **nothing** to `kb/`. When
   done, it emits a `summary_updated` event.
2. **Event handler** (`_on_summary_updated` in
   `backend/agent_runtime/__init__.py`) spawns a background thread that calls
   `process_knowledge()`.
3. **Knowledge authoring** (`process_knowledge` → `_author_docs` in
   `backend/agent_runtime/memory_manager.py`). One LLM call reads the summary and
   decides which durable docs to **create** or **update** — choosing each doc's
   `title`, `type`, body prose, and where to weave `[[wiki-links]]`. It returns
   structured JSON; no files are written by the model itself.
4. **File writing** (`backend/agent_runtime/evomem_writer.py`). For each authored
   doc, `upsert_doc()` writes a new `kb/<folder>/<slug>.md` file (atomically), or
   `append_to_doc()` appends only the new prose to an existing doc. Then
   `mark_dirty()` schedules a debounced graph sync.

### The manual on-ramp

An agent can also write `kb/` files directly:

- **`write_file`** into a `/_self/kb/*.md` path. KB writes are frontmatter-validated
  (must include `title`, `description`, `type`) and trigger `mark_dirty()`.
- **`remember`** pins a fact into the running summary and routes it through the
  same `_author_docs` authoring path.

Both converge on the same `mark_dirty()` → sync step, so the graph stays in sync
no matter which on-ramp created the file.

## LLM vs. deterministic

A deliberate separation of concerns keeps memory safe and reproducible:

| Step | Who | What it does |
| --- | --- | --- |
| `_author_docs` | **LLM** | Decides *what* to remember: titles, types, prose, inline links |
| `evomem_writer` | Deterministic | Slugifies, renders frontmatter, atomically writes the file |
| `sync` | Deterministic | Scans files, parses links, rebuilds the graph |

Only the **content decision** is model-driven. The writer and graph builder are
pure, predictable code — so file I/O is atomic and the graph is the same every
time for the same files, regardless of model behavior.

## The doc model in detail

### Doc types

Each doc carries a `type` from a fixed set (an entity like "Jakarta" is just a doc
of `type: place` — there is no separate `entities/` directory):

```
note · session · group · person · place · venue · event ·
organization · company · product · contact
```

`session` and `group` are reserved for a **collection's** `index.md`; a standalone
doc is coerced to `note` if it tries to claim them.

### Inline links

Relationships are part of the prose. Given a summary mentioning a trip, the author
produces something like:

```markdown
---
title: Jakarta
type: place
description: Capital of Indonesia; User's home city.
tags: [place]
---

Jakarta adalah ibu kota Indonesia. User tinggal di [[Pesanggrahan]] dan sering
makan di [[Ayam Bakar Taliwang Rinjani]].
```

Each `[[...]]` becomes a graph edge once `sync` runs.

### Collections

A **collection** is a single folder level under `kb/` (e.g. `kb/riset-xyz/`) with an
`index.md` of `type: session` or `type: group`. New docs authored during a session
are filed into the active collection (root by default).

## The graph

`sync` (`backend/agent_runtime/evomem_client.py`) runs the evomem engine over
`kb/**/*.md`:

1. Parse each doc's frontmatter (`title`, `type`, `tags`, `aliases`).
2. Extract inline `[[Doc Title]]` links from the body.
3. Resolve links by title/alias to other docs and create typed edges. The edge type
   is inferred from the surrounding sentence — e.g. `founded`, `works_at`,
   `located_in`, `lives_in`, `member_of`, `part_of`, `mentions`.
4. Store everything in `.evomem.db` for retrieval and graph traversal.

Because the graph is rebuilt from the files, deleting or editing a doc and
re-syncing updates the graph accordingly — there is no separate graph state to
keep in step by hand.

## Summary

- The **summarizer** never writes `kb/` files — it only triggers authoring.
- The **knowledge pipeline** (`_author_docs` → `evomem_writer`) is what
  auto-populates `kb/`; the agent's `write_file`/`remember` calls are a second
  on-ramp to the same place.
- The **graph builder** (`sync`) never invents files — it derives edges from the
  inline `[[links]]` already in your docs.
