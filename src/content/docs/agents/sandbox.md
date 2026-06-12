---
title: Sandbox
description: Isolated execution environment for agent tools — Docker sandbox management, cleanup, and naming.
sidebar:
  order: 12
---

## Overview

Evonic executes the `runpy` and `bash` tools inside isolated **Docker containers** for safety and security. These sandbox containers provide filesystem isolation, resource limits, and network restrictions, ensuring agent code runs safely without affecting the host system.

*Updated in v0.3.19 with improved sandbox naming, a cleanup CLI command, and automatic stale container reaping.*

## How Sandbox Works

When an agent uses `runpy` or `bash`, the tool's `DockerBackend`:

1. Creates a Docker container from the `evonic-sandbox:latest` image
2. Mounts the agent's workspace at `/workspace` inside the container
3. Executes the command inside the isolated environment
4. Returns the result
5. The container stays alive for reuse within the same session

## Container Naming

*Updated in v0.3.19.*

Sandbox containers are named using a simple and predictable pattern:

```
evonic-<session-id>
```

For example, if a session has ID `a1b2c3d4-e5f6-7890-abcd-ef1234567890`, the container will be named:

```
evonic-a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

This naming convention makes it easy to identify which container belongs to which session, and to clean up orphaned containers manually if needed.

### Container Labels

Each container is labeled for identification:

| Label | Value |
|-------|-------|
| `evonic.managed=1` | Marks this as an Evonic-managed container |
| `evonic.pid=<pid>` | The host PID that created the container |
| `evonic.created_at=<timestamp>` | When the container was created |

## Stale Container Cleanup

*Introduced in v0.3.19.*

Evonic automatically detects and cleans up **stale** or **orphaned** sandbox containers. This handles situations where:

- The Evonic server crashes unexpectedly
- A session expires without proper cleanup
- Containers are left behind from a previous server instance

### Automatic Startup Sweep

When the `DockerBackend` initializes, it performs a **startup sweep**:

1. Lists all running containers with the `evonic.managed=1` label
2. Compares them against the active session pool
3. Destroys any containers that don't belong to the current pool

This ensures no orphaned containers accumulate between server restarts.

### Container Reaping (Idle Timeout)

A background **reaper** thread monitors containers and destroys any that have been idle beyond the configured timeout:

```
SANDBOX_IDLE_TIMEOUT=1800  # 30 minutes (default)
```

### Container Reconciliation

A periodic reconciliation process also detects containers that have been externally removed (e.g., via `docker rm` from outside) and removes them from the internal pool to keep state consistent.

## Clear Sandbox CLI Command

*Introduced in v0.3.19.*

A dedicated CLI command lets you forcefully destroy all running Evonic sandbox containers:

```bash
evonic clear-sandbox
```

This command:

1. Lists all containers with the `evonic.managed=1` label
2. Displays the names of found containers
3. Force-removes each one (`docker rm -f`)
4. Reports how many were destroyed and if any failed

### Example

```bash
$ evonic clear-sandbox
Found 3 sandbox container(s):
  evonic-abc123
  evonic-def456
  evonic-ghi789

  ✓ Destroyed evonic-abc123
  ✓ Destroyed evonic-def456
  ✓ Destroyed evonic-ghi789

Done: 3 destroyed, 0 failed.
```

Use this command when you need to force-clean all sandbox containers, for example during development or troubleshooting.

## Sandbox Awareness

*Introduced in v0.3.19.*

When an agent is running inside a sandboxed environment, a **sandbox awareness notice** is injected into the agent's system prompt. This helps the agent understand its execution context and adjust its behavior accordingly.

The notice informs the agent that:

- It is running inside an isolated Docker container
- File operations are scoped to the mounted workspace
- Network access may be restricted
- Resource limits (CPU, memory) are in effect

This prevents the agent from attempting actions that would fail due to sandbox restrictions.

## Run-As-User Isolation

*Introduced in v0.7.0.*

Each agent can be configured to run its `bash` and `runpy` tools under a **specific Linux user** on the host system. This adds an extra layer of OS-level isolation beyond the Docker sandbox.

### How It Works

When `run_as_user` is configured for an agent, the sandbox backend:

1. Executes commands via `sudo -E -u <username>` (preserving environment variables across `sudo` boundaries)
2. The command runs under the specified user's identity and permissions
3. Filesystem access is restricted to what that user can access
4. Environment variables survive the `sudo` elevation

### Configuration

Set the run-as-user in the agent's **General** tab or via the API:

| Method | Configuration |
|--------|---------------|
| **Web UI** | Enter the Linux username in the **Run As User** field in the agent's General tab |
| **API** | Set `"run_as_user": "username"` in the agent configuration payload |

### Use Cases

- **Multi-tenant deployments**: Each agent runs under a dedicated user, preventing file access across agent boundaries
- **Compliance**: Meet audit requirements by tying agent actions to specific OS accounts
- **Limited permissions**: Create restricted Linux users with only the permissions an agent needs

## Configuration

### Env Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SANDBOX_IMAGE` | `evonic-sandbox:latest` | Docker image name for sandbox containers |
| `SANDBOX_MEMORY_LIMIT` | `512m` | Per-container memory limit |
| `SANDBOX_CPU_LIMIT` | `1` | Per-container CPU limit |
| `SANDBOX_NETWORK` | `none` | Network mode (`none` or `bridge`) |
| `SANDBOX_MAX_CONTAINERS` | `10` | Maximum concurrent containers |
| `SANDBOX_IDLE_TIMEOUT` | `1800` | Seconds before idle containers are destroyed |

### Disabling the Sandbox

If Docker is unavailable or you want to bypass the sandbox for development:

```env
# Per-agent: disable sandbox
sandbox_enabled=0
```

When sandbox is disabled, tools fall back to local subprocess execution (less isolated).
