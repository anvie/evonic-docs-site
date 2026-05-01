---
title: System Diagnostics (doctor)
description: CLI command for comprehensive Evonic system health diagnostics.
---

The `evonic doctor` command runs a comprehensive health check across the entire Evonic system. It checks environment, configuration, connections, services, files, agents, skills, and LLM providers: all from the terminal.

## `evonic doctor`

Run system diagnostics and health checks.

```bash
evonic doctor [--quick]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--quick` | No | Skip slow checks (LLM provider connection tests) |

**Example:**

```bash
# Full diagnostics
evonic doctor

# Quick diagnostics (skip LLM provider tests)
evonic doctor --quick
```

## Check Categories

The doctor command runs seven categories of checks in sequence:

### 1. Environment Check

Validates the runtime environment:

| Check | Details |
|-------|---------|
| Python version | Must be 3.9+. Warns if older. |
| OS information | Displays OS, release, and architecture. |
| Environment variables | Checks presence of `PORT`, `HOST`, `SECRET_KEY`, `DEBUG`, `ADMIN_PASSWORD_HASH`, `SANDBOX_NETWORK`, `LOG_FULL_THINKING`, `LOG_FULL_RESPONSE`. Secret values are masked (`***`). |
| Dependencies | Verifies `flask`, `requests`, and `anthropic` are importable with their versions. |
| Database driver | Confirms `sqlite3` is available. |

### 2. Configuration Check

Validates configuration files:

| Check | Details |
|-------|---------|
| `.env` file | Checks existence, counts active (non-comment) variables. Warns if empty. |
| `.env` encoding | Verifies the file is valid UTF-8. |
| `config.py` | Imports and checks for required attributes: `BASE_DIR`, `DB_PATH`, `PORT`, `HOST`, `SECRET_KEY`. |

### 3. Connection Check

Tests connectivity to infrastructure:

| Check | Details |
|-------|---------|
| Database | Connects to SQLite database and runs `SELECT 1`. |
| Redis | If `REDIS_URL` is configured, pings the Redis server. Skipped if not configured. |
| Internet | HTTP GET to `https://httpbin.org/status/200` with 5-second timeout. |

### 4. Service Check

Checks the Evonic server itself (only if the server is running):

| Check | Details |
|-------|---------|
| Health endpoint | Sends HTTP GET to `http://localhost:{PORT}/api/health` and verifies HTTP 200. |
| Port binding | Attempts a TCP connection to `localhost:{PORT}`. |

If the server is not running, live service checks are skipped with an informational message.

### 5. File/Folder Check

Verifies existence and permissions of important directories:

Directories checked: `logs/`, `data/`, `plugins/`, `skills/`, `agents/`, `skillsets/`, `templates/`, `db/`, `run/`.

Each directory is checked for:
- **Existence**: warns if missing
- **Read/write access**: reports `rw`, `read-only`, or `no read access`

### 6. Agent & Skill Health Check

Validates agent and skill configurations from the database:

**Agents:**
- Counts total, enabled, and disabled agents
- For each agent: shows enabled/disabled status, assigned model, tool count, skill count
- Warns if an enabled agent has no model assigned

**Skills:**
- Lists all installed skills via `SkillsManager`
- Counts total, enabled, and disabled skills
- For each skill: shows enabled/disabled status and tool count
- Scans `skills/` directory for corrupted `skill.json` manifest files

### 7. LLM Provider Check

Tests connectivity to each configured LLM provider. **Skipped in `--quick` mode.**

For every LLM model with a `base_url`:
- Sends HTTP GET to `{base_url}/models`
- Uses the same test-connection logic as the web UI (`routes/models.py api_test_model`)
- Reports success (HTTP 200), authentication errors (HTTP 401/403), or connection failures

No models to test? An informational message is shown.

## Output Format

Output is color-coded for readability:

| Symbol | Color | Meaning |
|--------|-------|---------|
| ✓ | Green | Check passed |
| ✗ | Red | Check failed: needs attention |
| ⚠ | Yellow | Warning: non-critical issue |
| ℹ | Blue | Informational: no pass/fail judgment |

Each section is displayed with a cyan header banner:

```
══ 1. Environment Check ══
  ✓  Python 3.11.9
  ℹ  OS: Linux 6.8.0 (x86_64)
  ...
```

### Summary

At the end, a summary table shows:

```
  Total checks: 25
  ✓ Passed:  20
  ⚠ Warnings: 3
  ✗ Failed:  2
```

Followed by an overall verdict:

| Result | Message |
|--------|---------|
| No failures | *"All checks passed. System is healthy!"* (exit code 0) |
| Warnings, no failures | *"System is operational with minor warnings."* (exit code 0) |
| Failures present | *"System has issues that need attention."* (exit code 1) |

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All checks passed, or only warnings (no failures) |
| `1` | One or more checks failed |

Use exit codes in scripts to automate health monitoring:

```bash
#!/bin/bash
if evonic doctor --quick; then
    echo "System healthy"
else
    echo "System needs attention!"
    # trigger alert, notification, etc.
fi
```

## Implementation Notes

- **Pure CLI**: no plugin, no API endpoint, no web UI. Runs entirely in the terminal.
- **Reuses existing logic**: LLM connection tests use the same `api_test_model` pattern from `routes/models.py` (HTTP GET to `{base_url}/models`).
- **No external dependencies** beyond what Evonic already requires.
- Located in `cli/commands.py` as `doctor_command()`, dispatched from `cli/__main__.py`.

## See Also

- [Server Management](/cli/server): start, stop, and monitor the server
- [Agent Management](/cli/agents): manage agents from the CLI
- [Model Management](/cli/models): configure LLM providers
