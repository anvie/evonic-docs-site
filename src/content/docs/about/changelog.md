---
title: Changelog
description: Release history and updates for Evonic.
---

# Changelog

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
