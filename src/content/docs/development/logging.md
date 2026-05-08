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

### Live Log Content

These are separate from `logging_config.py` and control what appears in the evaluation live log output:

| Variable | Default | Description |
|---|---|---|
| `LOG_FULL_THINKING` | `0` | Set to `1` to include the full LLM thinking/chain-of-thought content in live log output |
| `LOG_FULL_RESPONSE` | `0` | Set to `1` to include the full LLM response in live log output |

### Default Routes

```txt
EVONIC_LOG_ROUTES=logs/agent.log:backend.agent_runtime.*,backend.agent_state;\
                  logs/channels.log:backend.channels.*;\
                  logs/evaluator.log:evaluator.*
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
EVONIC_LOG_ROUTES=logs/agent.log:backend.agent_runtime.*
```

## Log File Locations

All log files live under the `logs/` directory in the project root.

| File | Source | Description |
|---|---|---|
| `logs/evonic.log` | Root logger | Main application log — everything ends up here |
| `logs/evonic.log.1` | Rotation | Rotated backup (oldest) |
| `logs/evonic.log.2` | Rotation | Rotated backup |
| `logs/evonic.log.3` | Rotation | Rotated backup (newest) |
| `logs/agent.log` | Route: `backend.agent_runtime.*` | Agent runtime and state logs |
| `logs/channels.log` | Route: `backend.channels.*` | Channel (Telegram, etc.) logs |
| `logs/evaluator.log` | Route: `evaluator.*` | Evaluation engine logs |
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

1. Open the **Settings** page at `/settings`
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
curl 'http://localhost:8080/api/logs/search?file=agent.log&query=timeout'
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
