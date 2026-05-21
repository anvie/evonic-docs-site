---
title: Portal
description: Virtual path mapping for agent file I/O — access external directories through agent tools.
sidebar:
  order: 10
---

## Overview

*Introduced in v0.3.19.*

A **Portal** is a virtual path mapping that lets agents access files outside their workspace directory. Instead of being limited to the agent's own `workspace/` folder, a portal maps a local or remote directory to a virtual path visible to agents under the `/_portal/` prefix.

Portals are intercepted at the file I/O tool level (`read_file`, `write_file`, `patch`, `str_replace`) and routed to the appropriate backend. This means agents can read and write files on external systems using the same tools they already know.

## Why Portals?

Without portals, agents can only access files within their assigned workplace directory. Portals break this boundary in a controlled way:

- **Mount external directories** — Give an agent access to a shared folder, a project directory, or a config folder
- **Access remote filesystems** — Use SSH portals to reach files on remote servers
- **Connect tunnel devices** — Use Evonet portals to access files on devices in your Evonet mesh

## How It Works

When an agent uses a file I/O tool with a path starting with `/_portal/<portal_id>/`, the system:

1. Looks up the portal by its ID
2. Resolves the path through the portal's backend (local, SSH, or Evonet)
3. Executes the file operation on the target filesystem
4. Returns the result to the agent

### Example

```text
Agent writes to:  /_portal/shared_docs/report.md
Portal resolves:  /data/team/docs/report.md  (on the target system)
```

The agent never needs to know the actual filesystem path — it just uses the `/_portal/` prefix.

## Portal Backend Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Local** | Maps a local directory on the Evonic server | Shared folders, config directories |
| **SSH** | Maps a directory on a remote server via SSH | Remote servers, cloud VMs |
| **Evonet** | Maps a directory on an Evonet-connected device | Mesh network devices |

### Local Portal

A local portal maps a directory on the same machine where Evonic runs. No extra configuration needed — just point it to a path.

```json
{
  "id": "shared_assets",
  "backend_type": "local",
  "backend_config": {
    "path": "/data/shared/assets"
  }
}
```

### SSH Portal

An SSH portal connects to a remote server and maps a directory from it. You can either configure SSH credentials directly or reuse an existing SSH workplace.

**Using a workplace:**

```json
{
  "id": "remote_server",
  "backend_type": "ssh",
  "backend_config": {
    "workplace_id": "my_remote_workplace"
  }
}
```

**Standalone config:**

```json
{
  "id": "dev_server",
  "backend_type": "ssh",
  "backend_config": {
    "host": "192.168.1.100",
    "username": "deploy",
    "auth_type": "key",
    "key_path": "/home/evonic/.ssh/id_rsa"
  }
}
```

### Evonet Portal

An Evonet portal connects to a device in your Evonet mesh network. The device must be connected and running Evonet.

```json
{
  "id": "edge_device",
  "backend_type": "evonet",
  "backend_config": {
    "workplace_id": "raspberry_pi_1"
  }
}
```

> **Note:** Evonet portals require the target tunnel workplace to be in a `connected` state.

## Managing Portals

Portals are created, updated, and deleted through the Web UI or API:

- **Web UI**: Navigate to **Portals** section to manage portal configurations
- **API**: REST endpoints for programmatic management

### Creating a Portal

1. Go to **Portals** in the web UI
2. Click **+ New Portal**
3. Enter the portal ID (a short slug like `shared_docs`)
4. Select the backend type: Local, SSH, or Evonet
5. Configure the backend settings
6. Click **Save**

### Deleting a Portal

When you delete a portal, its active backend connection is destroyed:

- SSH connections are closed
- Evonet workplace backends are disconnected
- Local portals simply remove the mapping

## How Agents Use Portals

Agents access portals through their normal file I/O tools. Here's what happens step by step:

1. The agent calls `read_file("/_portal/shared_docs/report.md")`
2. The tool handler detects the `/_portal/` prefix
3. The PortalManager looks up the `shared_docs` portal
4. The portal's backend (local, SSH, or Evonet) resolves the path and reads the file
5. The content is returned to the agent

The same flow works for `write_file`, `patch`, and `str_replace`.

## Security Considerations

- **Portals are scoped to their backend** — an agent can only access what the portal's backend allows
- **SSH credentials** are stored in the portal config and managed securely
- **Evonet portals** require the target device to be actively connected
- **No agent override** — agents cannot access portals they haven't been assigned to
