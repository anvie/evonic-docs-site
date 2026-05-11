---
title: Logging
description: Comprehensive guide to Evonic's logging system — configuration, log files, Web UI viewer, and how to use loggers in your code.
sidebar:
  order: 6
---

Evonic ships with a centralized logging system built on top of Python's standard `logging` module. It gives you rotating file handlers, per-module log routing, level filtering, and a built-in log viewer right in the web dashboard.

## How It Works

The logging system lives in `backend/logging_config.py`. It's initialized once at startup (from `app.py`, the supervisor, or the CLI) and provides a global logger that every module can use.

**Key features:**

- **Rotating file handlers** — log files are rotated automatically when they hit a size limit (default: 5 MB), with configurable backup count.
- **Dual output** — logs go to both the console (stdout) and a file by default.
- **Per-module routing** — dedicated log files for specific subsystems (agents, channels, evaluator) via `EVONIC_LOG_ROUTES`.
- **Level filtering** — filter by severity right in the web UI, or silence noisy modules via `EVONIC_LOG_QUIET`.
- **Auto‑configuration** — `get_logger()` calls `configure()` with defaults if nobody else has done it, so every module always gets a working logger.

## Configuration

All logging behaviour is controlled via environment variables in your `.env` file.

### Core Settings

| Variable | Default | Description |
|---|---|---|
| `EVONIC_LOG_LEVEL` | `INFO` | Global log level (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`) |
| `EVONIC_LOG_FILE` | `logs/evonic.log` | Path to the main log file. Set to empty to disable file output entirely |
| `EVONIC_LOG_MAX_BYTES` | `5242880` (5 MB) | Maximum size of a single log file before rotation kicks in |
| `EVONIC_LOG_BACKUPS` | `3` | Number of rotated backup files to keep |
| `EVONIC_LOG_QUIET` | *(empty)* | Comma-separated list of module names to silence (raises their level to `WARNING`) |
| `EVONIC_LOG_ROUTES` | *(see below)* | Semicolon-separated routing rules for dedicated log files |
| `EVONIC_LOG_CONSOLE_QUIET` | `apscheduler.*` | Comma-separated fnmatch patterns to suppress from console output. For example: `httpx,urllib3,openai` |

### Live Log Content

These are separate from `logging_config.py` and control what appears in the evaluation live log output:

| Variable | Default | Description |
|---|---|---|
| `LOG_FULL_THINKING` | `0` | Set to `1` to include the full LLM thinking/chain-of-thought content in live log output |
| `LOG_FULL_RESPONSE` | `0` | Set to `1` to include the full LLM response in live log output |

### Default Routes

```txt
EVONIC_LOG_ROUTES=logs/agents/agent.log:backend.agent_runtime.*
                  logs/channels.log:backend.channels.*;\
                  logs/eval/evaluator.log:evaluator.*
```

Each entry is `file_path:pattern1,pattern2` where patterns are [fnmatch](https://docs.python.org/3/library/fnmatch.html) globs matched against logger names. Log records matching the pattern are written to that dedicated file **in addition to** the main log.

### Example `.env` Snippet

```txt
# Set global level to DEBUG for detailed troubleshooting
EVONIC_LOG_LEVEL=DEBUG

# Keep more history
EVONIC_LOG_MAX_BYTES=10485760
EVONIC_LOG_BACKUPS=7

# Pipe agent runtime logs to their own file
EVONIC_LOG_ROUTES=logs/agents/agent.log:backend.agent_runtime.*
```

## Log File Locations

All log files live under the `logs/` directory in the project root.

| File | Source | Description |
|---|---|---|
| `logs/evonic.log` | Root logger | Main application log — everything ends up here |
| `logs/evonic.log.1` | Rotation | Rotated backup (oldest) |
| `logs/evonic.log.2` | Rotation | Rotated backup |
| `logs/evonic.log.3` | Rotation | Rotated backup (newest) |
| `logs/agents/agent.log` | Route: `backend.agent_runtime.*` | Agent runtime and state logs *(moved from `logs/agent.log` in v0.2.0)* |
| `logs/agents/supervisor.log` | Supervisor | Update supervisor logs |
| `logs/channels.log` | Route: `backend.channels.*` | All channel implementations (WhatsApp, Telegram, etc.) |
| `logs/eval/evaluator.log` | Route: `evaluator.*` | Evaluation engine logs *(moved from `logs/evaluator.log` in v0.2.6)* |
| `logs/eval/` | Evaluation runs | Per-evaluation-run log files |
| `logs/events.log` | Event stream | Structured event bus log (see [Events](/system/events)) |

### Log Format

Every log line follows this pattern:

```txt
[LEVEL] [module.path] message
```

For example:

```txt
[INFO] [backend.agent_runtime] Processing message #42 from user_alice
[WARNING] [evaluator.engine] No evaluator registered for domain 'math', falling back to keyword
[ERROR] [routes.agents] LLM request failed after 3 retries: Connection timeout
```

## Channel Log Routing

All channel implementations (WhatsApp, Telegram, and any future channel types) log
through their module loggers under the `backend.channels.*` namespace. Because the
default route `backend.channels.*` catches every channel module, you get a single
`logs/channels.log` file with all channel activity in one place.

### WhatsApp Channel Logging

The WhatsApp channel lives in `backend/channels/whatsapp.py` and uses a module-level
logger:

```python
_logger = logging.getLogger(__name__)  # → "backend.channels.whatsapp"
```

This means all WhatsApp log records match the `backend.channels.*` route pattern
and get written to `logs/channels.log` **in addition to** the main `logs/evonic.log`.

**Key log events in the WhatsApp lifecycle:**

| Event | Level | Example log line |
|---|---|---|
| Channel start | `INFO` | `[INFO] [backend.channels.whatsapp] WhatsApp channel wa-1 starting (bridge port 3001)` |
| Bridge process start | `INFO` | `[INFO] [backend.channels.whatsapp] WhatsApp bridge started for channel wa-1 on port 3001` |
| Bridge stdout | `DEBUG` | `[DEBUG] [backend.channels.whatsapp] [bridge] [whatsapp-bridge] Connected to WhatsApp` |
| Incoming message | `INFO` | `[INFO] [backend.channels.whatsapp] WhatsApp message received from 628123456789 (channel wa-1)` |
| Outgoing message | `INFO` | `[INFO] [backend.channels.whatsapp] WhatsApp message sent to 628123456789 (channel wa-1)` |
| Image processing error | `ERROR` | `[ERROR] [backend.channels.whatsapp] WhatsApp image conversion failed: ...` |
| Send failure | `ERROR` | `[ERROR] [backend.channels.whatsapp] WhatsApp send failed to 628123456789: ...` |
| Bridge crash | `WARNING` | `[WARNING] [backend.channels.whatsapp] WhatsApp bridge process exited unexpectedly for channel wa-1 (port 3001)` |
| Typing indicator failure | `WARNING` | `[WARNING] [backend.channels.whatsapp] WhatsApp typing indicator failed for 628123456789: ...` |
| Channel stop | `INFO` | `[INFO] [backend.channels.whatsapp] WhatsApp channel wa-1 stopped` |

**How to filter WhatsApp logs:**

```bash
# All WhatsApp activity in channels.log
grep "backend.channels.whatsapp" logs/channels.log

# Only ERROR-level WhatsApp messages
grep "ERROR.*backend.channels.whatsapp" logs/channels.log

# Messages from a specific user
grep "628123456789" logs/channels.log

# All incoming messages across every channel
grep "message received from" logs/channels.log
```

### Telegram Channel Logging

The Telegram channel (`backend/channels/telegram.py`) follows the exact same pattern:

- Logger: `backend.channels.telegram` → routes to `logs/channels.log`
- Common log events: connection status, incoming messages, errors, conflict detection

```txt
[INFO] [backend.channels.telegram] Telegram channel tg-1 connecting (agent: ag-1)...
[ERROR] [backend.channels.telegram] Error handling message from chat 123456: ...
```

### Custom Route Example: Separate WhatsApp & Telegram Logs

Want WhatsApp and Telegram in their own files? Override `EVONIC_LOG_ROUTES`:

```txt
EVONIC_LOG_ROUTES=logs/agents/agent.log:backend.agent_runtime.*
                  logs/whatsapp.log:backend.channels.whatsapp;\
                  logs/telegram.log:backend.channels.telegram;\
                  logs/eval/evaluator.log:evaluator.*
```

## Notification & Mention Routing

Beyond channel message logs, Evonic has a centralized notification system that
routes system-tagged messages to agents. Every notification is logged so you can
track who got notified, when, and why.

### `notify_agent()` Logging Pattern

The `notify_agent()` function in `backend/agent_runtime/notifier.py` is the single
entry point for all system notifications. It emits these key log records:

```txt
# Routing resolution
[INFO] [backend.agent_runtime.notifier] notify_agent: agent=ag-1 tag=SYSTEM NOTIFICATION trigger_llm=True external_user_id=__system__ channel_id=none session_id=auto dedup=True.

# Session resolution
[INFO] [backend.agent_runtime.notifier] notify_agent: resolved target_session_id='sess_abc123' for agent='ag-1'.

# Duplicate suppression
[INFO] [backend.agent_runtime.notifier] notify_agent: dedup — skipping duplicate [SYSTEM NOTIFICATION] notification for agent 'ag-1' in session 'sess_abc123'.

# LLM triggering
[INFO] [backend.agent_runtime.notifier] notify_agent: triggering LLM for agent='ag-1' via handle_message (session='sess_abc123', channel=none).

# Fallback warning (no active channel)
[WARNING] [backend.agent_runtime.notifier] notify_agent: no active channel session for agent 'ag-1' (channel_type=telegram), falling back to web session.

# Error
[ERROR] [backend.agent_runtime.notifier] notify_agent: failed to notify agent 'ag-1' (session='sess_abc123'): ...
```

### Super Agent Notifications

The `super_agent_notifier.py` module subscribes to critical platform events and
routes them as system notifications to the super agent. It uses the same
`notify_agent()` path above, so all these logs appear in `logs/agents/agent.log` under
`backend.agent_runtime.notifier`.

**Events that trigger super agent notifications:**
- **Tool execution errors** — when a tool call fails with an error
- **Channel errors** — when a channel disconnects or encounters a failure
- **System errors** — generic component-level errors

Each notification is rate-limited (60 seconds per category) to prevent flooding.

```txt
[INFO] [backend.agent_runtime.notifier] notify_agent: agent=sa-1 tag=SYSTEM NOTIFICATION trigger_llm=False ...
```

### Mention Detection

WhatsApp does not have a built-in mention detection in the Baileys bridge — all
incoming messages from approved users are forwarded to the agent. However, the
system uses the `[SYSTEM/...]` tag pattern in message text for structured mentions:

| Pattern | Source | Description |
|---|---|---|
| `[SYSTEM/Task]` | `super_agent_notifier` | Task assignments routed via `notify_agent()` |
| `[SYSTEM NOTIFICATION]` | `super_agent_notifier` | Critical platform alerts |
| `[SYSTEM]` | Agent messaging tool | Agent-to-agent messages |

When debugging mention delivery, look in `logs/channels.log` and `logs/agents/agent.log`:

```bash
# Find all system notifications going to agents
grep "notify_agent:" logs/agents/agent.log

# Find all incoming WhatsApp messages (any user)
grep "WhatsApp message received" logs/channels.log

# Check if a notification was deduplicated
grep "dedup" logs/agents/agent.log
```

## Using the Logger in Code

Using the logger in your own modules is dead simple:

```python
from backend.logging_config import get_logger

log = get_logger(__name__)

log.debug("Entering loop with %d items", len(items))
log.info("Processing user request")
log.warning("Rate limit approaching for user %s", user_id)
log.error("Failed to connect to LLM: %s", err)
log.critical("Database corruption detected — shutting down")
```

The logger name is inferred from `__name__`, so you get the full dotted module path in the log output automatically.

If logging hasn't been configured yet (e.g. during early imports), `get_logger()` calls `configure()` with defaults so you never hit "No handlers found" errors.

## Viewing Logs in the Web UI

The log viewer is built right into the Evonic dashboard.

**Where to find it:**

1. Open the **System** page at `/system`
2. Click the **Logs** tab

The log viewer gives you:

- **File selector** — pick from any log file in the `logs/` directory
- **Level filter pills** — quickly switch between ALL, INFO, WARN, ERROR, CRITICAL
- **Search** — type any keyword to filter log lines client-side
- **Live mode** — toggle auto-refresh to watch logs as they're written
- **Clear** — truncate the current log file with a reset marker

### API Endpoints

The Web UI talks to these REST endpoints — you can use them directly too:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/logs/files` | List all log files with size, modification time, and category |
| `GET` | `/api/logs/read?file=...&lines=500&direction=tail` | Read log file content (tail by default, up to 5000 lines) |
| `POST` | `/api/logs/clear` | Truncate a log file with a `---log-reset---` marker |
| `GET` | `/api/logs/search?file=...&query=...&level=ERROR` | Search within a log file by keyword and/or level |

### Search Example

```bash
# Find all ERROR lines in the main log
curl 'http://localhost:8080/api/logs/search?file=evonic.log&level=ERROR'

# Search for a specific term across all levels
curl 'http://localhost:8080/api/logs/search?file=agents/agent.logfile=agent.log&query=timeoutquery=timeout'
```

## Troubleshooting

**Q: I'm not seeing any log output.**
Check that `EVONIC_LOG_FILE` is not set to an empty string, and that the `logs/` directory exists and is writable.

**Q: A module is way too chatty.**
Add it to `EVONIC_LOG_QUIET` — this sets its effective level to `WARNING`, suppressing `DEBUG` and `INFO` messages.

```txt
EVONIC_LOG_QUIET=httpx,urllib3,openai
```

**Q: I need to debug a specific subsystem.**
Set `EVONIC_LOG_LEVEL=DEBUG` and optionally add a dedicated route in `EVONIC_LOG_ROUTES` to pipe those logs to their own file.

**Q: Log files are growing too fast.**
Lower `EVONIC_LOG_MAX_BYTES` or increase `EVONIC_LOG_BACKUPS`. You can also reduce the log level to `WARNING` to cut down volume.
