---
title: Changelog
description: Release history and updates for Evonic.
---

# Changelog

## v1.0.0 — 2026-07-17

*Stable Release*

### Core Architecture (4)

- **CMP (Context Memory Protocol)** — a standardized protocol for managing agent memory state, enabling consistent context injection and structured recall across diverse LLM providers.
- **ATG (Atomic Task Graph)** — a new way to represent complex goals as a DAG of atomic tasks, allowing agents to reason about dependencies, parallelize execution, and track granular progress.
- **Bubblewrap Sandbox** — integrated `bwrap` (Bubblewrap) as a first-class workplace type, providing high-performance, hardware-isolated sandboxes with precise filesystem and network controls.
- **Plugin Lifecycle System** — a formalized system for plugin initialization, runtime management, and graceful shutdown, ensuring stability and resource cleanup.

### Agent Capabilities (5)

- **OpenAI Codex Integration** — native support for Codex-optimized workflows, including "Chain-of-Thought" thinking bubbles that surface the agent's internal reasoning process before the final output.
- **WhatsApp Multi-Agent Support** — expanded WhatsApp integration to support shared channels, concurrent number handling, and multi-agent coordination within a single chat thread.
- **MCP Client Integration** — full support for the Model Context Protocol (MCP), allowing Evonic agents to connect to external MCP servers and utilize a vast ecosystem of standardized tools and resources.
- **Enhanced Evaluator** — expanded the evaluation system to support complex cross-session metrics and automated regression testing for agent prompts.
- **Drag-and-Drop File Upload** — streamlined file handling with direct drag-and-drop support in the chat UI, instantly making files available in the agent's workplace.

### UI & Experience (4)

- **New Panel UI** — a redesigned dashboard featuring a modular panel system for easier access to logs, state, and configuration.
- **Background Process Manager** — a dedicated UI for monitoring and managing `/detach` jobs, providing real-time status and one-click termination.
- **Agent Detail Redesign** — a complete overhaul of the Agent Detail page, organizing tools, knowledge, and configuration into a more intuitive, tabbed interface.
- **Improved Navigation** — global search and quick-jump shortcuts for faster navigation across the agent ecosystem.

### Tools & Commands (6)

- **New Tools** — added `send_channel_message` for targeted external communication, `list_sessions` for session discovery, and **Transcribe Audio** for native voice-to-text processing.
- **`/dump` Command** — export the current session state as a JSONL file for audit, debugging, or migration.
- **`/clear` (with Archive)** — clearing history now automatically archives the session to a secure database, preventing data loss.
- **`/unfocus` Command** — instantly break an agent out of a failed or stuck focus loop to resume general interaction.
- **Improved Slash Command Discovery** — contextual help and auto-completion for all available slash commands.
- **Session Recovery** — ability to restore archived sessions directly back into the active chat.

## v1.1.0 — 2026-07-31

*Reliability & Delivery — 194 commits*

### Platform Reliability (4)

- **Persistent Docker Sandbox** — sandbox containers now survive across sessions and server restarts, eliminating redundant image rebuilds and preserving package installations between conversations.
- **WhatsApp Safe Delivery** — global safe-delivery configuration with an outbound dispatcher, throttled queue preservation, and zombie-connection auto-recovery for the WhatsApp bridge, ensuring messages are delivered even under unstable network conditions.
- **Global Default Model Fallback** — a new `default_model_fallback_id` setting lets you define a platform-wide fallback model that all agents inherit. The `/model` slash command now shows whether the active model came from a fallback chain.
- **Timezone Validation** — the `EVONIC_TIMEZONE` setting is now properly persisted through `run_setup`, ensuring timezone configuration survives server restarts.

### Agent & Developer Experience (4)

- **Guided Slash Commands** — slash commands now expose parameter metadata (`parameters`, `accepts_args`, `to_dict`) with live frontend hints and autocomplete for `/clear`, `/model`, and other commands. No more guessing what arguments a command accepts.
- **Slash Command Controls** — per-agent `hidden_slash_commands` and `disabled_slash_commands` settings in the Settings tab give you fine-grained control over which commands each agent can see and use (#728).
- **Agent JSON Export/Import** — full agent portability: export any agent as a validated JSON file and import it into another Evonic instance. All configuration, tools, skills, and prompts are preserved.
- **Super Agent Skill Assignment** — super agents now use selective skill assignment (#739) with a dedicated doctor migration, replacing blanket authorization bypass with precise, auditable control.

### Vision & Model Improvements (3)

- **Vision Pipeline Fallbacks** — a secondary vision fallback model (configurable via environment variables and the Web UI) and a restored third vision model fallback ensure image processing never stalls. Non-JPEG/PNG images are auto-converted and large images are compressed before processing.
- **`describe_image` Rate-Limit Resilience** — the built-in image description tool now falls back on both rate limits and transient errors, keeping vision-enabled agents functional under load.
- **Evaluation Model Setting** — a dedicated, configurable evaluation model for the evaluator pipeline (#732) lets you choose the best model for scoring accuracy independently from the agent's chat model.

### Plugin Features (3)

- **Workflow Guard Plugin** — reusable failure thresholds, hard locks, and an escalation outbox provide production-grade failure handling for multi-step workflows.
- **Panel Plugin `confirm_dialog`** — action buttons in the Panel UI can now trigger confirmation dialogs, preventing accidental destructive actions.
- **Photo Validation API** — a stateless photo validation endpoint with a model index, reason codes, and secret-free token verification for programmatic image verification.

## v1.1.2 — 2026-08-02

*Agent State Lifecycle & Kanban Workflow — 25 commits*

### Agent Core (2)

- **AgentState Task Lifecycle (#742–746)** — the agent runtime now enforces proper task lifecycle transitions in the tool loop. Execution paths are synchronized across concurrent operations, live task feedback streams through the UI, the Vault Janitor receives scheduling controls for cleanup operations, and stale task state self-heals on session wake — so agents no longer pick up abandoned tasks from previous sessions.
- **Explore Tool Regression Fix** — eager skill tools (such as Explore) are now protected from mid-turn tool pruning in the LLM loop, restoring reliable availability of the Explore tool.

### Kanban (1)

- **Kanban Attachments** — image and comment attachments are now supported on kanban tasks. The task image picker has been modernized, the AI task enhancer outputs in English, and task creator controls have been restored (#734, #739, #740, #741).

### UI & Reliability (2)

- **Viewer Copy Buttons** — code-block copy buttons are now available in article, document, and artifact viewers (#735).
- **Settings & Reliability** — vision model dropdowns are now grouped under a dedicated Vision Models section with a mobile overflow fix (#737). The agent sidebar no longer drops busy events during page-load races (#738). Corrupted quotes in the evaluate settings template have been repaired.

## v0.8.0 — 2026


*192 commits, 82 changes*

### New Features (7)

- **Evomem Knowledge Graph Memory** — a comprehensive long-term memory engine with primary and fallback storage backends, knowledge-graph integration, and semantic recall. Agents now remember facts across conversations and can traverse relationships between entities, making them genuinely stateful over time.
- **KB System v2** — three new tools deepen the knowledge base experience: a graph traversal tool lets agents follow wiki-link connections between KB documents, enhanced listing surfaces staleness and graph-awareness metadata, and a canonical `_kb_index.md` index keeps the knowledge graph navigable. Agents also receive coaching prompts to maintain KB graph links automatically.
- **Sub-Agent System** — the `/sub` slash command lets you spawn sub-agents directly from chat for parallel work. Sub-agents execute without planning delays, deliver responses through inter-agent forwarding, and are protected by naming-pattern enforcement. Two new settings — `inter_agent_clear_context` and `builtin_tools_enabled` — give fine-grained control over agent behavior.
- **`/detach` Slash Command** — move long-running background processes (builds, downloads, compilations) out of the agent loop so you can keep chatting while work continues. Progress is tracked persistently and the agent notifies you when the job completes.
- **`/investigate` Slash Command** — inspect any agent's context from chat with `/investigate <agent-id> <context>`, surfacing session state, tool configuration, and runtime diagnostics without leaving the conversation.
- **Syntax Highlighting & Rich Terminal in Chat** — code blocks now render with syntax highlighting via highlight.js. Bash execution output appears in a dark terminal-styled block. Copy buttons appear on code blocks and blockquotes. A live artifacts strip appears between thinking and final response.
- **Kanban Task Workflow** — tasks now carry a `created_by` owner column with owner-based delete permission. `task_id` is returned at the top level of creation responses. Agents auto-post their final answer as a kanban comment when a task completes.

### Plugin Features (3)

- **Token Monitor** — per-agent and per-model-source token usage tracking with a cost dashboard, giving visibility into LLM spending across all agents (token-monitor plugin).
- **Evonet Multi-Server Manager** — a dropdown UI and server manager GUI for the Evonet connector, letting you switch between multiple remote devices without reconfiguration (evonet plugin).
- **Evonet Exactly-Once Execution** — tool execution across WebSocket reconnects is now idempotent, preventing duplicate command runs when the tunnel re-establishes (evonet plugin).

### Enhancements (32)

- **Flat Repository Architecture** — the legacy supervisor daemon, release-mode detection, and multi-directory app-root resolution have been removed. The codebase now follows a flat single-repo structure, simplifying deployment paths and eliminating an entire class of path-resolution bugs.
- **Security Hardening Suite** — API rate limiting protects all endpoints with tiered limits and atomic enforcement. Security audit logging records authentication and authorization events for forensic traceability. User blocking prevents abusive accounts from accessing the platform. Login rate-limiter state persists across restarts via SQLite.
- **PromptPurify ML Always-On** — the L5e injection guard classifier now runs unconditionally, catching prompt injection patterns that regex-based guards miss, with a false-positive fix for benign security terminology.
- **PEM Private Key Detection** — the platform detects when private keys appear in tool output or file operations and routes through a user approval flow, preventing accidental key exposure to LLM providers.
- **Workspace Boundary Enforcement** — the Read, Grep, and Glob tools now enforce workspace directory boundaries, preventing agents from reading files outside their sandbox.
- **Session Archive** — `/clear` data is now archived to a dedicated `session_archive.db` instead of being permanently deleted. Recover cleared conversations when needed.
- **`agent_info` Tool** — agents can inspect any other agent's full configuration (tools, skills, channels, KB, artifacts, models) from within a conversation, enabling self-diagnostic workflows.
- **`fetch_artifact` Tool** — the reverse of `save_artifact`: agents can fetch files from the host artifacts directory back into the sandbox for inspection or processing.
- **Collapsible Inter-Agent Messages** — `[AGENT/...]` messages in chat now collapse into a compact header, reducing visual noise in multi-agent conversations.
- **Injected System Variables** — `{{key}}` placeholders in system prompts are expanded from message metadata, enabling dynamic prompt injection per conversation turn.
- **CRUD Rate Limit Raised** — the CRUD endpoint rate limit increased from 30 to 120 requests per minute, reducing friction during bulk operations.
- **Blocked User Admin UI** — an admin interface for viewing and managing blocked users, integrating with the user-blocking enforcement system.
- **Public History Warning** — a warning dialog informs users before they enable public session history, preventing accidental exposure of private conversations.
- **Performance: Chat Messages Index** — a composite database index on `(session_id, created_at DESC)` accelerates message pagination queries.
- **Doctor Improvements** — five new diagnostic sections: evomem safety check, promptpurify model check, list_artifacts consistency, asset build check, and LLM provider check (now optional). Doctor also suggests `--fix` commands after running.
- **Tailwind CSS v4 Build Pipeline** — a `build_tailwind.sh` script builds the UI stylesheets from the Tailwind v4 source, replacing ad-hoc CSS management.
- **Process Tracker Hardening** — enhanced process group and container cleanup for both local and Docker backends, reducing orphaned process leaks.
- **Avatar Compression** — avatars are now stored with compression variants, reducing bandwidth and improving load times on slow connections.
- **Active Session Indicator** — a green gradient on the sidebar highlights which agent session is currently active, so you always know where the conversation is happening.
- **Kanban Skeleton Loading** — the Kanban board shows animated skeleton placeholders while tasks load, giving immediate visual feedback instead of a blank screen.
- **Lightbox Filename Overlay** — image filenames appear in the lightbox overlay for quick identification when browsing multiple images.
- **Knowledge Tab Searchbar** — a search bar on the agent detail Knowledge tab lets you filter KB documents by name without scrolling through the full list.
- **`/cd` and `/cwd` for Remote Workplaces** — the directory navigation slash commands now work with agents on remote or tunnel-connected workplaces.
- **Attachment Info Injection** — file path metadata is injected into agent context when files are uploaded via the web chat UI.
- **Resume Evaluation** — the evaluation system now accepts domain-level input for more accurate session resumption.
- **Image Serving Concurrency** — images and avatars are served concurrently with caching, improving page load performance.
- **Sub-Agent Direct Execution** — sub-agents skip the planning phase and execute directly, reducing turn latency for delegated tasks.
- **Summarizer Filters** — `bash_exec` and `slash_command` messages are filtered from recap and summary context, keeping recaps focused on conversation content.
- **Fallback Model Reset** — the active fallback model flag resets on inter-agent clear, preventing stale model assignments.
- **Built-In Tools Toggle** — each agent can now independently enable or disable built-in tools via an advanced setting, rather than a global flag.
- **Bash Command Param** — the bash tool now supports a `command` parameter for direct command execution alongside the existing `script` parameter.

### Bug Fixes (43)

- **More Robust Image Attachment Handler** — the image feed is decoupled from the LLM pipeline. A dedicated `describe_image` tool gives agents control over when and how images are processed, fixing inconsistent image handling across different models and providers.
- **SSE Connection Storm** — stale connection counts now reset on startup, and the connection cap was raised, stopping the `too_many_sse_connections` error storm that flooded logs.
- **SSE Exponential Reconnect** — the SSE client uses exponential backoff for reconnects, preventing connection-limit exhaustion during network interruptions.
- **SSE Chat Sequence Gaps** — a contiguous `_chat_seq` counter in the unified chat producer eliminates phantom gap-fill requests that caused duplicate message rendering.
- **Intermediate Response Chunks** — `response_chunk` events no longer prematurely end the live turn, fixing truncated agent responses mid-generation.
- **Sidebar Layout** — the sidebar now uses absolute positioning anchored to the app shell, filling the full viewport height without empty space, and works correctly on mobile.
- **Download Button Position** — the chat image download button moved from top-right to top-left, no longer overlapping with image content.
- **Phantom Turn Resumption** — the `system` message type is now included in unreplied-type checks, preventing phantom turn resumption after specific events.
- **Injection Guard False Positive** — a P0 false positive on benign security terminology (e.g., "bypass" in normal context) has been eliminated.
- **Qwen Parser Validation** — extracted tool-call identifiers from Qwen models are now validated, preventing corrupted parameter injection.
- **Gemma4 Parser Fallback** — the LLM loop checks for Gemma4 parser availability before falling back to Qwen, fixing parse failures on Gemma models.
- **Orphaned Tool Calls** — the tool-call repair logic now properly restores orphaned calls, preventing HTTP 400 "insufficient tool messages" errors.
- **Loop Detection Forwarding** — force-stop termination from loop detection now properly forwards to the delegating agent.
- **Calculator Routing** — the calculator tool routes to the real math backend instead of a broken Python mock.
- **CRUD Rate Limit Race** — `check_rate_limit` is now atomic, eliminating UNIQUE constraint violations under concurrent requests.
- **Chat Reads Exclusion** — cheap chat read/poll requests are excluded from the 10/min chat rate-limit tier, preventing rate-limiting of normal browsing.
- **CSRF Cookie SameSite** — the CSRF cookie `SameSite` attribute changed from `Strict` to `Lax`, fixing cross-origin navigation issues while maintaining protection.
- **CRLF Sanitization** — carriage-return characters in URL parameters are sanitized, preventing HTTP header injection.
- **Health Endpoint Redaction** — Docker version and disk usage details are redacted from `/api/health`, closing an information disclosure vector.
- **Approval Flow** — `approval_resolved` events now emit before re-executing approved tools, preventing race conditions in the approval workflow.
- **Kanban Avatars** — agent avatars now display correctly on the Kanban board, with initial-based fallbacks for agents without custom avatars.
- **Kanban Sub-Agent Tasks** — parents can update sub-agent tasks, sub-agents can update parent-assigned tasks, and unassigned task status updates are properly guarded.
- **Sub-Agent Session Index** — the session index now records the sub-agent's own ID instead of the parent's, fixing session lookup for sub-agent conversations.
- **Sub-Agent Artifacts** — artifact tools and routes for sub-agents correctly use the parent agent's ID, ensuring artifacts are accessible.
- **`/sub` Command Visibility** — super agents can now see and use the `/sub` command, and it's listed in `/help`.
- **Evonet Ping/Pong** — ping and pong control frames are no longer dispatched as RPC requests, preventing spurious errors in evonet logs.
- **Evonet Shell Environment** — `exec_bash` and `exec_python` on remote devices now honor the user's shell environment variables.
- **Doctor evobrain→evomem Rename** — the doctor command check uses the correct `evomem` binary name after the codebase-wide rename.
- **Doctor list_artifacts Check** — a new doctor section detects when the `list_artifacts` tool is missing from agents that have `save_artifact`.
- **Scheduler Timezone** — deterministic timezone handling prevents UTC-conversion errors that caused schedules to fire at wrong times.
- **Double Slash Command Response** — race conditions between SSE and POST delivery no longer produce duplicate slash command responses.
- **Lightbox Single Image** — prev/next navigation buttons are properly hidden when the lightbox contains only one image.
- **Lightbox Navigation** — prev/next now works correctly across image artifacts, not just chat-embedded images.
- **Mobile Image Overflow** — `max-width:100%` on chat image skeletons prevents horizontal overflow on mobile screens.
- **CTRL+G Quick Search** — agent search is now case-insensitive, searches by both ID and name, and the modal position is lowered for better reachability.
- **Sidebar Height Fixes** — multiple iterations corrected the sidebar height from `100vh` through `calc(100vh - 100px)` to the final `calc(100vh - 56px)` with absolute positioning.
- **File Upload Context** — file paths are now injected into agent context when files are uploaded via the web chat UI.
- **Skills Tab Toasts** — persistent "Saved!" labels in the Skills tab are replaced with proper toast notifications.
- **Tool ID Encoding** — the `toolId` parameter is now properly encoded in the `editTool` API call, and alerts are replaced with toast notifications.
- **Evomem Recall Fields** — recall field normalization and capture title sanitization prevent YAML frontmatter parse errors in memory entries.
- **Secret Key Detection Tests** — pre-existing test failures in the secret key leak detection suite have been fixed, and tests are converted to proper pytest format.

For the complete list of commits, see the [GitHub release](https://github.com/anvie/evonic/releases/tag/v0.8.0).

## v0.7.0 — 2026

*158 commits, 82 changes*

### New Features (10)

- **Image Lightbox** — full-featured image viewer with prev/next navigation, thumbnail sizing, and download button for chat images and artifacts. Browse visual content inline without leaving the conversation.
- **Anthropic API Format Translation** — the LLM client now translates between OpenAI and Anthropic API formats, configurable per-model via an API format dropdown in the model modal. Connect Claude and other Anthropic-compatible models natively without a proxy.
- **Per-Agent Run-As-User Isolation** — configure a Linux user per agent for bash and runpy execution, with environment variables preserved across sudo boundaries. Each agent runs sandboxed under its own OS account.
- **Ctrl+G Agent Quick Search** — keyboard-driven overlay for instant agent search and navigation. Type a partial name and jump directly to any agent without touching the mouse.
- **Scheduler Auto-Extend Trigger** — new trigger type that automatically extends running schedules, enabling perpetual scheduling patterns without manual renewal.
- **List Artifacts Tool** — new tool lets agents browse their artifact directory. Automatically granted to any agent that has the `save_artifact` tool.
- **Agent Sidebar Unread Indicators** — a blue dot and selection ring on sidebar avatars show which agents have pending responses, so you never miss a completed task while browsing elsewhere.
- **`/shutdown` Slash Command** — super agents can cleanly shut down the entire Evonic server from within a conversation, no terminal access needed.
- **Workplace CLI Subcommand** — manage workplaces from the command line with `evonic workplace`: list, inspect, and configure workplaces without the web UI.
- **Scheduler Log Tab** — the scheduler detail view now includes activity execution details, captured output, and timing for each scheduled run, making it possible to troubleshoot failures directly from the UI.

### Plugin Features (2)

- **Exa-Search** — AI-powered web search capability for agents, enabling real-time information retrieval from the internet with structured JSON output and semantic content extraction (exa-search skill).
- **Obscura** — lightweight headless browser for web scraping, JS rendering, CDP server (Puppeteer/Playwright), and MCP server. A lighter alternative to PinchTab with no dependencies and a single binary (obscura skill).

### Enhancements (34)

- **Realtime SSE Consolidation** — five separate realtime event streams merged into one unified SSE endpoint, reducing browser connection overhead and eliminating race conditions between event sources.
- **PROMPTPurify L5e Injection Guard** — a compact ML classifier runs as a second-pass injection guard, catching prompt injection patterns that regex-based guards miss.
- **CSRF Protection** — double-submit cookie pattern protects all state-changing endpoints against cross-site request forgery attacks.
- **Auto-Assign Non-Lazy Skill Tools** — when a non-lazy skill is assigned to an agent, its tools are now automatically registered without manual assignment.
- **Evonic Doctor Consistency Checks** — two new diagnostic checks detect orphaned tool assignments with `--fix` support for auto-correction.
- **Stale Session Injection Detection** — the runtime detects stale agent sessions and injects a staleness-aware prefix to keep the agent grounded. Configurable per-agent.
- **Save Artifact Source Path Routing** — artifacts can now be saved directly from file paths through sandbox and tunnel backends, eliminating the base64 bottleneck for large files.
- **Evonet.md Default KB** — new super agent setups ship with `evonet.md` as a default knowledge base.
- **In-Place Agent Switching** — navigating between agents now swaps content without a full page reload, reducing wait time when bouncing between agents.
- **Unified Chat State/Summary** — `/chat/state` and `/chat/summary` merged into a single API call, halving network overhead on every chat turn.
- **Configurable Sidebar Agent Limit** — maximum visible agents in the sidebar is now configurable from System Settings.
- **Server-Side Search/Filter** — agent search and filtering moved to the backend, fixing search that only matched the currently visible page.
- **Avatar Initials** — agents now display colored name-initial circles instead of generic placeholder icons.
- **Chat Image Download Button** — every image in chat messages now has a download button overlay for one-click saving.
- **Build Operations Rule Injection** — agents with bash or runpy tools automatically receive instructions to run compilations inside tmux or screen sessions.
- **Artifacts Pagination** — the artifacts tab now paginates large collections with server-side search and filtering.
- **KB File Modal Auto-Grow** — the KB file editor textarea now auto-grows to fit content, eliminating nested scrollbars.
- **cat_file_bytes Streaming Transfer** — file transfers across all backends use streaming, supporting larger files without temporary disk copies.
- **Smart Quote Normalization** — curly/smart double quotes normalized before markdown parsing, preventing broken formatting from copy-pasted text.
- **Scheduler Full Output Capture** — `session_prompt` output now fully captured and visible in the scheduler detail view for troubleshooting.
- **Summarization Diagnostic Logs** — skip reasons logged when summarization is bypassed.
- **Stale Boundary Event Stripping** — stale boundary events stripped from `/chat/events` to prevent ghost thinking bubbles after `/clear`.
- **Memory NULL-Dimension Backfill** — existing memories without dimension vectors backfilled so conflict detection catches all duplicates.
- **Relative Avatar Path Storage** — `avatar_path` stored as relative for backup/restore portability across deployments.
- **Telegram Auto-Populate Display Name** — agent display name automatically populated from Telegram profile data on first connection.
- **`sudo -E` Environment Preservation** — environment variables survive sudo elevation when running commands with `run_as_user`.
- **Toast on Agent Enable/Disable** — enabling or disabling agents now shows a toast confirmation.
- **Python `-c` Instead of Heredoc** — bash execution uses `python -c` to keep stdin available for interactive `input()` calls.
- **Download Button Repositioned** — chat image download button moved to top-right overlay.
- **Allow Soft-Switch to/from Super Agent** — sessions no longer reject mode/agent change when switching to or from the super agent.
- **Workplace Detail Tab Alignment** — workplace detail page tabs now match agent_detail styling.
- **Slow-Request Logging** — requests exceeding 500ms logged with full path and timing for bottleneck identification.
- **Verbose Logging by Default in CLI** — CLI mode now matches GUI log output verbosity.

### Performance (11)

- **Agent Detail Page Speedup** — eliminated database write contention and redundant queries on agent detail page loads.
- **SQLite Performance Tuning** — WAL mode, synchronous, and cache size PRAGMAs tuned for the platform's read-heavy workload.
- **Buffer Events.Log Writes** — event log writes buffered to reduce filesystem directory churn.
- **Cache `app_settings`** — SettingsMixin caches app_settings to avoid hitting the database on every page load.
- **Strip Empty Tool Descriptions** — OpenAI tool definitions omit empty description strings, reducing token overhead.
- **DB Connection Lifecycle** — connections closed after requests to prevent WAL checkpoint stalls and file descriptor exhaustion.
- **Compiled Regex + Tool JSON Cache** — regex patterns compiled at module level and tool JSON cached with mtime invalidation.
- **Lazy Image Loading with Skeleton Shimmer** — chat images load on-demand with skeleton shimmer animation placeholders.
- **O(log N) Event Boundary Lookup** — bisect-based boundary search in `get_events_in_range` for faster event retrieval.
- **LLM Client Settings Cache** — context_length, prompt_buffer, and max_retries cached with 30s TTL.
- **Skill Manifest & Tool-Def Parsing Cache** — skill manifest JSON and tool-def parsing cached to avoid repeated filesystem reads.

### Bug Fixes (36)

- **Sidebar prevents empty chat space** — max-height and `align-self: flex-start` on the sidebar container stops it from pushing empty space into the chat room.
- **PID start conflict** — single-instance prevention uses `flock` for atomic PID file access, fixing race conditions between parallel starts.
- **10 CI test failures resolved** — MagicMock leak across tests, API delete endpoint handling, PID file cleanup, and `_tlocal`→`_tls` typo all fixed.
- **Default KB not copied on web agent creation** — new agents created via the web UI now properly receive default knowledge base files.
- **mkToggle race on agent pages** — rapid-toggle race condition on agents, plugins, and skills page toggles fixed.
- **Native `confirm()` replaced** — eager skill activation uses Evonic showConfirm() instead of browser's native confirm().
- **Browser autofill on search inputs** — autocomplete disabled on all search fields to prevent browser autofill.
- **Continuation nudge disabled** — auto-continuation prompt injection deactivated.
- **`/summary` accurate when summary unchanged** — slash command returns the correct message instead of a misleading error.
- **Missing `clear_all_memories`** — `/clear-memory` slash command now properly removes all memories.
- **Contiguous per-session chat sequence** — sequence numbers contiguous per session, preventing SSE from seeing phantom gaps.
- **`/summary` AttributeError fix** — resolved `AttributeError` crash in agent runtime.
- **Artifacts tools managed by feature toggle** — artifact-related tools controlled by the plugin feature toggle system.
- **Persistent 'Saved!' label replaced** — Tools tab uses disappearing toast notifications instead of a static label.
- **Path traversal escape in portal resolution** — path resolution hardened against directory traversal attacks.
- **`save_artifact` error message improvements** — five fixes for unclear error messages.
- **`read_file` directory error** — returns an actionable message when targeting a directory.
- **Auto reply-back removed** — inter-agent auto-reply removed to prevent infinite ping-pong loops between agents.
- **`str_replace`/`patch` smart-quote robustness** — curly/smart double quotes no longer break `str_replace` and `patch`.
- **Flash-of-border on non-remote agent badge** — chat header badge no longer shows a brief border flash.
- **Lightbox window scope** — Lightbox exported to window scope so artifacts tab and non-chat views can invoke it.
- **SSE/polling leak on navigation** — SSE and polling connections properly closed on page navigation.
- **Injection guard false positive** — base64-encoded file paths in CLI output no longer trigger the injection guard.
- **web_test bubble popup navigation** — notification bubble from web tests navigates to agent detail instead of sessions page.
- **Badge visibility for local agents** — workplace type badge resets className instead of using `classList.add`.
- **Stale runpy reference removed** — outdated descriptions referencing removed functionality cleaned from runpy tool docs.
- **Enter-key on session reply input** — mobile/desktop Enter-key distinction now applies to session page reply input.
- **Kanban assignee blocked on done tasks** — completed and archived Kanban tasks can no longer have their assignee changed.
- **Auto-extraction from plan markdown removed** — task auto-extraction from plan markdown removed, fixing unintended task creation.
- **Early guard for missing `file_path` in `read_file`** — prevents `AttributeError` when `read_file` is called without `file_path`.
- **Verbose lock debug removal** — `[LOCK] _llm_lock` debug logs silenced to reduce log noise.
- **Remove exa-py dependency** — unused exa-py removed from requirements.txt after exa-search skill migration.
- **Remove redundant artifacts injection** — duplicate artifacts SYSTEM.md injection removed from agents.py.
- **Replace Tailwind arbitrary classes** — arbitrary-value Tailwind classes replaced with inline CSS for predictable styling.
- **Sidebar `position:fixed`** — sidebar positioning changed to `position:fixed`, preventing flex container height issues.
- **Bypass `is_skill_enabled` in auto-assign** — `_exec_assign_skills` now bypasses the `is_skill_enabled()` gate, fixing an edge case where tools would silently fail to assign.

For the complete list of commits, see the [GitHub release](https://github.com/anvie/evonic/releases/tag/v0.7.0).



## v0.6.78 — 2026

*184 commits, 93 changes*

### New Features (13)

- **Agent Sidebar** — sidebar panel showing agent list, status, and quick access for easier agent management and switching
- **Message Wrapper Protocol** — agents automatically scan incoming messages for user preferences, facts, and instructions before responding, saving them to memory without explicit commands
- **Bubble UI Popup** — chat interface with popup bubble mode for quick interactions without full-page navigation
- **File & Image Upload** — direct file and image upload in chat with multimodal support for richer conversations
- **Audio & Video Multimodal Input** — voice and video input support in chat for richer, more natural interaction
- **Semantic Memory Conflict Detection** — intelligent detection and resolution of conflicting memories for more accurate recall across sessions
- **Auto-Inject Agent Env Vars** — environment variables automatically injected into bash/runpy tools for seamless configuration access
- **Health Endpoint** — `/health` endpoint for monitoring service availability
- **Plugin Hot Reload** — instant plugin reloads on file change without service restart, speeding up plugin development
- **Outbound File Sending** — agents can now send files to users as output artifacts, enabling richer agent-generated deliverables
- **Pre-Commit Safety Checks** — automated pre-commit validation for path safety, sensitive data scanning, and file size limits
- **Clickable Plan Badge** — plan badge in chat UI is now clickable, linking directly to the plan file for quick access
- **Skeleton Loading** — skeleton placeholder UI for smoother perceived loading during page transitions

### Plugin Features (1)

- **pinchtab_eval** — evaluate PinchTab browser automation environments with structured testing capabilities

### Enhancements (41)

- **Sticky fallback model** — fallback model now remains active until manually reset via `reset_active_model()` for more predictable behavior
- Skill management revamp with lazy/eager loading architecture
- Agent state framework with `state()` tool and namespace support for structured workflows
- `list_skillsets` + `apply_skillset` tools — browse and apply pre-configured agent templates
- `manage_skill` tool — list, enable, or disable skills at runtime
- `unassign_skill` tool — selectively remove skills from agents
- `resolve_agent_approval` tool — programmatic approval resolution for inter-agent workflows
- `llm_respond` event — standardized inter-agent text responses
- `/cwd` and `/cd` slash commands for workspace navigation from chat
- `/restart` command restricted to super agent only for safety
- `emit_event` action type for scheduler — trigger plugin events on schedule
- Session scheduler: jobs survive restart via persistence layer
- Evaluation settings UI revamp with dedicated toggle page
- Thinking bubble auto-expand on new content
- Performance: 6x caches for stats, session state, triggers, and model resolution
- Query optimizations across multiple backend paths
- UI improvements: dark mode refinements, sidebar polish, icon consistency
- Drop Python 3.9; require 3.10+
- Async agent toolbox built on top of events/triggers
- Plugin override: `default_plan_prompt` configurable per plugin
- Plugin registry event: `core.chat.chat_history_rendered`
- Truncation filters now individually configurable per tool
- `icd10_search` tool upgraded with BM25 ranking and Indonesian medical terms
- `icd10_search2` RAG search with BGE-M3 vector embeddings
- Agent detail page: hide password fields, show agent type badges, prompt length indicator
- Token stats: total vs loaded breakdown for transparency
- Runpy sandbox `http` module supports `download()` helper for binary assets
- Agent template pre-configured with eval skill for quick evaluator setup
- `find()` glob returns absolute paths matching the sandbox workspace
- Compact skill item cards on `/skills` page matching `/agents` card pattern
- API router docstring endpoint: `/api/docstring/{agent_id}`
- Sanitize commit messages before Git operations — auto-redact sensitive info
- Persistent cache for model resolution to reduce repeated DB lookups
- JWT secret auto-generated on first launch for zero-config setup
- Task text rendered as markdown in session state display
- Agent skills shown in agent list sidebar for at-a-glance awareness
- User agents always shown first in sidebar regardless of sort
- Gemma4 parser: `strip_gemma4_thinking` unified with standard parser
- Warmup: prevent thinking from being called during model warmup phase
- `user_updated` event emitted on owner name change for plugin reactivity

### Bug Fixes (38)

- **Gemma4 Bold Markdown Spacing** — fixed broken word spacing in bold text
- Kanban: gracefully handle invalid JSON in task body instead of crashing
- Scheduler: fixed next-fire-time precision and duplicate firing on restart
- Scheduler: `interval` triggers now survive process restart correctly
- Dark mode: unreadable checkbox contrast and icon visibility fixed
- XSS prevention: sanitize raw HTML in message rendering
- `@` mention auto-scroll flaky behavior on long agent lists fixed
- Memory deduplication: `remember()` no longer double-saves on retry
- Workspace root path resolution in `resolvePath()` — absolute paths handled correctly
- Agent state tool now works inside inter-agent sessions
- `send_agent_message`: agent ID allowed in `action_config` for schedule targeting
- `create_schedule`: `agent_id` defaults to caller when omitted
- `assign_tools`: tool not found returns clear error
- `assign_skills`: validates agent exists before assigning
- `sessrecap.log` truncated after plan execution — no unbounded log growth
- Gemma4 parser: double-thinking-tag extraction and hanging on large inputs fixed
- Docker-kill end_time regression in sandbox cleanup
- Thinking tag wrapper incorrectly applied to eval-only sessions
- `recall_sessions` returning duplicate summaries for inter-agent conversations
- `last_agent_id` session tracking for inter-agent switching
- Cache key collision when default model updated mid-session
- Silent agent crash on missing model config — now shows clear error
- `/agents` page crash on missing agent configs
- `bump_version.sh` not committing `VERSION` file changes
- `close` tool removed — handled internally by sandbox lifecycle
- `llm_respond` event payload for standard OpenAI-format responses
- Async event bridge error swallowing — errors now properly surfaced
- Token count regression after `truncate()` refactor
- Sandbox `get()` on localhost URLs timing out
- `read_file` tool blocking on large files from agent session
- `str_replace` returning wrong error message on ambiguous matches
- `write_file` not creating parent directories when `create_dirs=true`
- Stale `.plan` files left in repo after plan execution
- Gitignore bypass via `write_file` to `.evonic/` paths
- `read` KB tool not listing `.md` files in subdirectories
- Scheduler `max_runs` not enforced on `date` triggers
- Plugin variables not accessible in event handler callbacks

For the complete list of commits, see the [GitHub release](https://github.com/anvie/evonic/releases/tag/v0.6.78).

## v0.6.91 — 2026

*5 new features, 4 enhancements, 14 bug fixes*

### New Features (5)

- **Auto Reply-Back for Cross-Agent Conversations** — agents now automatically reply when receiving messages from other agents, enabling seamless inter-agent dialogue without manual prompting or requiring the sender to poll for responses
- **`/clear-memory` Slash Command** — new command to clear an agent's long-term memories, with full support for hyphenated command names in the slash command parser
- **`clear_all_memories` Method** — new `chat_delegation` mixin method for programmatic memory cleanup across agents, enabling automated memory management in multi-agent workflows
- **Slash Command Response Styling** — slash command responses now appear in a distinct blue style, visually separating system command output from AI-generated content in the chat
- **Missing Slash Path Hint** — when a `/_self` path is missing its leading slash, agents now provide a helpful correction hint instead of a cryptic error

### Enhancements (4)

- **Session ID in Admin List** — session IDs now visible in the sessions admin page for easier reference and debugging
- **Chat Fullscreen Persistence** — fullscreen chat state persists via `localStorage` across page reloads for a seamless user experience
- **Agent Sidebar Limit** — agent sidebar now shows a maximum of 10 entries for cleaner navigation and reduced clutter
- **Attachment Metadata** — `file_path` added to `attachment_info` metadata for richer file context in tool results

### Bug Fixes (14)

- Clear session no longer archives the session, keeping it alive for `has_session` checks
- Bold markdown regex fixed for start-of-string matching in both `llm_client.py` and `gemma4_parser.py`
- Missing-slash hints added to all four file-related tools (`write_file`, `str_replace`, `read_file`, `patch`)
- `VERSION` removed from `.gitignore` so the bump script properly commits version changes
- OGG voice messages now converted to WAV for multimodal LLM compatibility (#500)
- Missing `import os` added in `tunnel_workplace.py`
- Bubble popup now navigates to the correct session instead of always going to the agent chat room (#499)
- Sessions now auto-archive on `/clear` to prevent stale summaries in `recall_sessions`
- Mobile chat glitch resolved — SSE race condition and jQuery animation regression fixed
- Web badge display corrected in session list item UI

For the complete list of commits, see the [GitHub release](https://github.com/anvie/evonic/releases/tag/v0.6.91).

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
