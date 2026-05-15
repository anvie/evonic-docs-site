---
title: Changelog
description: Release history and updates for Evonic.
---

# Changelog

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
