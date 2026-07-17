---
title: Bubblewrap Sandbox
description: High-performance, hardware-isolated workplace environments.
---

# Bubblewrap Sandbox

The **Bubblewrap Sandbox** is the default, high-performance isolation layer for Evonic workplaces in v1.0.0. Built on `bwrap` (Bubblewrap), it provides a lightweight yet secure environment that ensures agent operations remain contained without the overhead of full virtual machines.

## What is Bubblewrap?

Bubblewrap is a low-level unprivileged sandboxing tool that uses Linux namespaces to create isolated environments. Unlike traditional Docker containers, `bwrap` does not require a daemon, making it faster to spin up and more secure by reducing the attack surface.

## The `bwrap` Workplace Type

In Evonic, you can now specify `bwrap` as your workplace type during agent configuration.

### Key Characteristics
- **Filesystem Masking**: Only specific directories (like the agent's home and the shared workspace) are visible inside the sandbox.
- **Network Control**: You can precisely define which network ports the agent can access, preventing unauthorized outbound calls.
- **Hardware Isolation**: `bwrap` ensures that the agent cannot see or modify the host system's hardware state.
- **Zero-Daemon Overhead**: Sandboxes are created as child processes of the agent runtime, meaning they vanish instantly when the agent session ends.

## Comparison: Docker vs. Bubblewrap

| Feature | Docker Sandbox | Bubblewrap (`bwrap`) |
|----------|----------------|--------------------------|
| **Boot Time** | Medium (seconds) | Near-Instant (milliseconds) |
| **Overhead** | High (Daemon required) | Extremely Low (Namespace-based) |
| **Isolation** | Strong (CGroups/Namespaces) | Strong (Namespaces/Mounts) |
| **Privileges** | Requires Docker Socket | Unprivileged (usually) |
| **Persistence** | Volume-based | Bind-mount based |

## Managing bwrap Workplaces

### Enabling bwrap
To switch an agent to a Bubblewrap workspace, update the agent's configuration:

```json
{
  "workplace": {
    "type": "bwrap",
    "mounts": [
      "/home/evonic/shared",
      "/tmp/agent-scratchpad"
    ]
  }
}
```

### Security Best Practices
- **Limit Mounts**: Only mount the absolute minimum directories required for the task.
- **Read-Only Roots**: Whenever possible, mount system libraries as read-only to prevent the agent from modifying the sandbox environment.
- **Network Sandboxing**: Use the `network: false` flag for agents that only perform local data processing and don't need API access.

## Troubleshooting
If an agent reports "Permission Denied" inside a `bwrap` workplace, it is usually because a required directory was not included in the `mounts` list. Check the agent logs to see which path is being blocked and update the configuration accordingly.
