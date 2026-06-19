---
title: Server Management
description: CLI commands for managing the Evonic platform server.
---

Commands for starting, stopping, checking status, and viewing logs of the Evonic Flask server.

## `evonic start`

Start the Flask server.

```bash
evonic start [--port PORT] [--host HOST] [--debug] [-f]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--port` | No | Port number (default: from config or 8080) |
| `--host` | No | Host to bind (default: `0.0.0.0`) |
| `--debug` | No | Enable debug mode |
| `-f, --foreground` | No | Run server in foreground (blocking mode) |

**Example:**

```bash
# Start on default port
evonic start

# Start on custom port
evonic start --port 9000

# Start in foreground with debug mode
evonic start -f --debug
```

**Output:**

```
Server started (PID: 12345)
Host: 0.0.0.0
Port: 8080
URL: http://localhost:8080
```

## `evonic stop`

Stop the running server.

```bash
evonic stop
```

**Example:**

```bash
evonic stop
```

**Output:**

```
Sending SIGTERM to server (PID: 12345)...
Server stopped (PID: 12345)
```

## `evonic status`

Check if the server is running.

```bash
evonic status
```

**Example:**

```bash
evonic status
```

**Output (running):**

```
Server is running (PID: 12345)
Port: 8080
URL: http://localhost:8080
```

**Output (not running):**

```
Server is not running (no PID file)
```

## `evonic update`

Check for and apply updates from the Git remote. See the [Update System guide](/agents/self-update) for a detailed explanation.

```bash
evonic update [--check] [--tag TAG] [--rollback] [nightly]
```

| Flag | Description |
|------|-------------|
| `--check` | Fetch tags and report what is available: no update is applied |
| `--tag TAG` | Update to a specific tag (e.g. `--tag v0.9.0`) |
| `--rollback` | Roll back to the previous state via git reflog |
| `nightly` | Track `origin/main` instead of release tags |

No setup required — the update runs directly using git operations on the repository.

**Examples:**

```bash
# Check what version is available
evonic update --check

# Update to the latest release
evonic update

# Update to a specific tag
evonic update --tag v1.3.0

# Roll back to the previous release
evonic update --rollback

# Track the nightly/main channel
evonic update nightly
```

**See also:** [Update System guide](/agents/self-update)

---

## Next Steps

- [Agent Management](/cli/agents)
- [Skill Management](/cli/skills)