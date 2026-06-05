---
title: Changelog
description: Release history and updates for Evonic.
---

# Changelog

## v0.6.77 — 2026

*10 changes, 3 new contributors*

### Enhancements (3)

- **Plugin hot reload** — plugin files are now watched for changes during development. Edit your handler, plugin.json, or routes, and the plugin reloads automatically without needing `evonic plugin reload`
- **Two-pass extraction in UI** — evaluator two-pass extraction settings and results are now exposed directly in the evaluation UI for better visibility
- **Health endpoint checks** — added DB connectivity, disk usage, and Docker health checks to the `/health` endpoint for monitoring

### Bug Fixes (7)

- **Sandbox mock runner security** — `exec()` in Python mock test runner now uses AST validation to sandbox execution
- **SVG avatar XSS prevention** — avatar uploads now reject SVG files to prevent stored XSS attacks
- **Setup wizard dead TONES lookup** — removed stale TONES lookup that broke Next button on Super Agent step
- **Unreplied-chat startup scan** — limited unreplied-chat initialization scan to human-facing sessions only
- **Shallow clone git operations** — reconfigure remote to track branches for clean git fetch/pull after shallow clone install
- **.env file permissions warning** — warn about `.env` file permissions when `SECRET_KEY` is auto-generated
- **Kanban task_id type mismatch** — normalize `task_id` to string to prevent type mismatch bugs

For the complete list of commits, see the [GitHub release](https://github.com/anvie/evonic/releases/tag/v0.6.77).

## v0.5.0 — 2026

*255 commits, 110 changes*

### New Features (11)

- **Agent Artifacts** — persistent file output system with `save_artifact` tool, artifact modal viewer, `read_attachment` tool with cross-agent isolation, and attachment cleanup on session delete
- **RTK Token Compressor** — 8-stage modular compression pipeline with TOML schema, Python and Rust builtin filters, agent-specific and project-level filter overrides via KB, and token savings tracking API
- **Thinking Budget Cap** — per-model round-based budget enforcement for small model efficiency
- **Quality Monitor with Auto-Correction** — automatic correction and output parser for improved response quality
- **Long-running command guardrail** — detects build/compile commands and suggests tmux/screen alternatives
- **`/exec` slash command** — switch agent mode from plan to execute directly via chat
- **`forget_memory` tool** — long-term memory deletion for soft-deleting stale or irrelevant memories
- **`assign_skills` / `unassign_skill` super-agent tools** — assign and remove skills from agents programmatically
- **Evonic Backup System** — CLI-based backup, restore, and verification with `evonic backup` command
- **File upload in web chat UI** — upload files directly from the chat interface
- **Per-agent model fallback** — configurable fallback chain with 1 retry, persistence across sessions, and UI badge indicator

### Plugin Features (2)

- **Model-router plugin** — per-model base system prompts, model list endpoint, and token widget UI overhaul
- **Plugin widget mechanism** — auto-load `*_widget.html` in plugin detail page for custom UI

### Enhancements (53 — highlights)

- **`portal_copy` tool** — binary file transfer between workspaces and portals
- **Write-vs-Edit guard** — `write_file` now refuses to overwrite existing files, guiding agents to use `str_replace` or `patch` for surgical edits
- **Improved `patch` tool** — tiered fuzzy matching with exact, indent-tolerant, and unescape-tolerant fallback tiers
- **Dynamic edit tool suggestion** — writes overwrite guard dynamically suggests the best edit tool based on assigned tools
- **Search bars on /plugins and /skills pages** — client-side filtering for quick navigation (#362, #365)
- **Compact plugin and skill cards** — redesigned to match /agents card pattern with compact layout (#361, #364)
- **Token list SVG icons** — replaced text Edit/Delete buttons with SVG icons in API token list (#333)
- **Prompt-only skill badges** — show skills without tools as badges with divider line between Tasks and Skills
- **State API with loaded skills** — `/api/state` now exposes `loaded_skills` with skill badges rendered in sessions page (#359)
- **SSE bridge state-change trigger** — add `use_skill`/`unload_skill` to SSE state-change trigger list (#358)
- **Remove `Regular` category badge** — removed from non-system plugin cards
- **Evonet GUI improvements** — Clear button in toolbar (#343), version number in window title, FyneApp.toml for macOS metadata
- **Intent-based Skill Injection** — dynamic tool guidance by injecting relevant skill context based on agent intent
- **Process tracker** — immediate `/stop` interrupt for running tool executions via PID-based process tracking
- **Scheduler `session_prompt` action type** — trigger full LLM sessions from scheduled jobs with tool access
- **Scheduler detail modal** — display `static_message` content in scheduler detail view
- **Channel user identity injection** — inject channel user identity into agent context for personalized responses
- **Dynamic enabled-agent roster injection** — inject live list of enabled agents into super agent system prompt
- **Sanitize Docker/container language** — remove container terminology from tool descriptions for non-sandbox agents
- **Telegram username allowlist** — enhance Telegram user allowlist to include username-based filtering
- **Accurate tiktoken token counts** — compiled context now shows memories and summary with precise token counts
- **Translate remaining Indonesian to English** — all CLI commands and help text now in English (#342)

### Bug Fix Highlights (44 fixes — highlights)

- **False-positive continuation nudge** — fixed on report-style responses, completion/summary responses, and permission-seeking responses
- **Continuation nudge negation fix** — `PLANNING_RE` nudge negation broke out of loop instead of falling through
- **Safety pipeline import graceful fallback** — all tool files now wrap `safety_pipeline` import in try/except with warning log and graceful degradation
- **`_skip_safety` flag hardening** — requires strict boolean `True` to skip safety checks
- **Kanban `tool_guard` self-heal** — clears stale pending status for done/reassigned tasks
- **Dark mode UI fixes** — hover text on Advanced Settings (#352), hover styling for session items (#360), fix for user-directory plugin modals and table
- **EvoNET build fix** — fixed evonet build and `portal_copy` for absolute paths
- **`/clear` chat input fix** — clear chat input after `/clear` command submission (#392)
- **Task text sanitization** — prevent inconsistent status indicator rendering from sanitized task text
- **Loaded skill badge persistence** — clear in-memory session skill data in slash command handler (#373)
- **Fix misleading `Execution stopped by user`** — for sudo/signal deaths that were not user-initiated
- **`/help` command visibility** — fix `/help` showing `/cd` and `/cwd` commands to non-super agents
- **Fix eval page real-time logs** — escape HTML in Real-Time Logs (#335)
- **Fix session state task list display** — not shown in chat UI right panel (#226)
- **Fix portal Add button** — 6 JavaScript/HTML ID mismatches causing silent failure
- **Fix trailing newline in patch.py** — when no lines remain after patch application
- **Fix restart ready message** — proper web chat thinking bubble for slash commands
- **Show webhook secret as plain text** — instead of masked for copy-paste (#212)
- **Re-route SSE adapter after turn_split** — maintain real-time updates in monolith mode
- **Update progress persistence** — survive crashes during update with progress tracking and pre-flight checks

For the complete list of commits, see the [GitHub release](https://github.com/anvie/evonic/releases/tag/v0.5.0).

## v0.5.24 \u2014 2026

*11 enhancements, 11 bug fixes*

### Enhancements (11)

- **Injection Guard toggle (#397)** \u2014 per-agent toggle for tool-level prompt injection detection in write_file, str_replace, patch, read_file, bash, runpy, and send_agent_message. Three response modes: block, warn, log. Configurable severity threshold. See [Injection Guard](/security/injection-guard).
- **Recall tool result contents in thinking bubble (#398)** \u2014 recall tool outputs now appear in the agent's thinking bubble for visibility
- **Auto-scroll + dark green log view (#394)** \u2014 improved Evonet and log viewing experience
- **Evonet tunnel workplace awareness** \u2014 workplace context injected into agent system prompt for Evonet-connected devices
- **`/_self/artifacts/` virtual path (#419)** \u2014 agents can now access their artifacts directory via the `/_self/artifacts/` virtual path from any execution environment
- **Plan badge clickable modal (#418)** \u2014 click the plan badge in chat to view plan details
- **Safety/Injection Guard toggles moved to Advanced Settings (#399)** \u2014 consolidated safety toggles into Advanced Settings section
- **Toast notifications + robust error parser (#395)** \u2014 improved error feedback with toast notifications
- **Model test connection visual feedback (#395)** \u2014 loading state and result feedback for model connection testing
- **Download URL/button merged** \u2014 streamlined download interface, removed curl sample hint

### Bug Fixes (11)

- UnboundLocalError on lazy skill unload
- Approval modal 409 stuck
- `.env.example` read access denied
- Summarizer JSON template crash
- SSE thinking spinner stuck
- Stale symlink false update banner
- [DONE] response content recovery
- Plan files per-agent sandbox path
- False positive `git add .gitignore`
- `str_replace` unicode escape mismatch
- Update race guard + timeout

For the complete list of commits, see the [GitHub release](https://github.com/anvie/evonic/releases/tag/v0.5.24).

## v0.3.49 — 2026

*7 commits*

### Enhancements (2)

- **Git pull --ff-only at start of update** — ensures the update process fetches the latest changes before applying updates.
- **Remove Node.js tooling** — cleaned up `package.json`, `node_modules`, and reorganized `tailwind-input.css` for a leaner project structure.

### Bug Fixes (4)

- **Sandbox toggle propagation** — fixed the sandbox enabled setting not propagating to local workplace backends (#240)
- **Dual avatar display** — removed `inline-flex` from the avatar initials fallback span to prevent duplicate avatars (#242)
- **Legacy config migration** — migrated old `~/.evonic/.env` files to the shared config directory during update (#238)
- **Local workplace file I/O** — added missing file operation methods to `LocalWorkplaceBackend` for reliable file tool usage in local workplace mode (#237)

For the complete list of commits, see the [GitHub release](https://github.com/anvie/evonic/releases/tag/v0.3.49).

## v0.3.43 — 2026

*24 commits*

### Enhancements (9)

- **Auto-refresh on workspace save** — the Web UI auto-refreshes after saving a valid workspace directory path in agent settings (#232)
- **Pre-compiled CSS** — migrated from Tailwind Play CDN to a pre-compiled CSS build for faster page loads and offline reliability (#235)
- **CSS reset cleanup** — removed redundant CSS reset in `style.css` as part of the CSS migration (#235 follow-up)
- **Session list dividers** — added visual dividers between session list items in the chat room sidebar for better readability (#236)
- **Divider border styling** — `!important` flag added to divider borders for consistent rendering (#236)
- **Lazy badge repositioned** — the "lazy" badge now appears to the right of the skill name in skill cards for better alignment (#230)
- **CLI refactoring** — deduplicated `EVONIC_BANNER` by importing it from `cli.commands` across all CLI modules
- **ASCII art update** — refreshed the Evonic banner ASCII art
- **Docs update** — AgentAPI README updated with session behavior clarification

### Plugin Features (1)

- **AgentAPI stateless sessions** — Agent API requests are now stateless by default. Use the `X-Session-Id` header to opt into stateful sessions with conversation history (AgentAPI plugin)

### Bug Fixes (9)

- **Orphaned tool messages** — dropped orphaned and duplicate tool messages from reconstructed conversation context
- **JSONL rebuild guard** — prevented JSONL history rebuild when prefetch cache is in use
- **Semantic message counting** — fixed JSONL tail scan to count semantic messages, not raw entries
- **Lazy skill authorization** — `assigned_tool_ids` is now properly updated on skill load, unload, and restore
- **AgentAPI message handling** — system messages sent via AgentAPI are now correctly treated as user messages
- **Synthetic tool responses** — injected synthetic tool responses for interrupted tool calls in conversation history
- **Tool authorization guard** — `real_executor` now blocks unassigned tools with an authorization guard
- **Prompt date format** — fixed `current_datetime` in `DEFAULT_SUMMARIZE_PROMPT` to use single braces (#277)
- **Stale shell helpers** — removed stale `evonic` shell helper references from the codebase (#229)

For the complete list of commits, see the [GitHub release](https://github.com/anvie/evonic/releases/tag/v0.3.43).

## v0.3.19 — 2026

*113 commits*

### New Features (2)

- **Portal feature** — virtual path mapping for agent file I/O, enabling external filesystem access through agent tools under the `/_portal/` prefix
- **recall_sessions built-in tool** — query session summaries from the database with keyword search

### Plugin Features (2)

- **Webhook input filter** — per-event-type JSON filter configuration for webhook payloads (GitHub Webhook plugin)
- **AgentAPI token management UI** — create, edit, delete, and inspect API tokens for agent access (AgentAPI plugin)

### Enhancements (13)

- **Session State** — mode/plan_file/tasks migrated from Agent State to dedicated Session State with mode badge and task/plan file display
- **Skill briefs and lazy/eager guard** — skill descriptions with load behavior control and visual badges
- **Lazy badge on skill cards** — visually indicate which skills use lazy tool loading
- **Stale sandbox cleaner** — robust cleanup of orphaned containers with `clear-sandbox` CLI command
- **Sandbox awareness injection** — inject sandbox environment notice into agent system prompt
- **Show skill ID in skills page** — display skill identifier alongside name
- **Render task text as markdown** — in Session State panel for rich formatting
- **Update navbar logo** — use `mascot.png` for improved branding
- **Structured logging** — agent messaging tool inclusion in agent log routes
- **Add LICENSE (AGPL-3.0) and COMMERCIAL.md** — clear licensing with commercial terms
- **Simplify sandbox naming** — use `evonic-<session-id>` pattern
- **Plugin export/import (.evop)** — package and distribute plugins as portable archive files
- **Push notification system** — proactive push notifications to users via scheduler with period/channel configuration

### Bug Fix Highlights (28)

- **Security audit fixes** — resolved C-1, C-2, M-4, M-6, M-7, H-5 findings from production readiness audit
- **.env file protection** — extended to all file operation tools (`patch`, `str_replace`) with path normalization
- **Path traversal prevention** — skill installation now blocks directory escape attempts
- **Command injection prevention** — update manager sanitizes version strings
- **Date/time injection** — current date/time injected into summarization prompt to prevent LLM date hallucination
- **Session continuity** — unsummarized assistant context preserved in conversation tail
- **Infinite loop fix** — missing nudge counter increment in empty PLANNING_RE resolved
- **Mobile persistence** — web chat state survives page navigations on mobile
- **Dark mode fixes** — agent state UI text and evaluation conversation blocks now render properly in dark theme
- **Sub-agent replies** — forwarded to correct parent agent session
- **Slash command interception** — fixed for `send_as_user` and scheduler routing

For the complete list of commits, see the [GitHub repository](https://github.com/anvie/evonic).
