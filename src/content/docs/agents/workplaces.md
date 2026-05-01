---
title: Workplaces — Execution Environments
description: Attach agents to local directories, remote SSH servers, or any device running Evonet — without manual SSH setup.
sidebar:
  order: 7
---

A **Workplace** is a first-class execution environment for an agent. It replaces the per-agent workspace directory with a richer abstraction that supports three types of execution targets:

| Type | Where code runs | How it connects |
|------|-----------------|-----------------|
| **Local** | Same machine as Evonic | Direct filesystem/process access |
| **Remote** | SSH server | Auto-connect via stored SSH credentials |
| **Cloud** | Any device running Evonet | Outbound WebSocket relay — no public IP needed |

Workplaces are managed at `/workplaces` in the web UI.

## Why Workplaces?

Without a Workplace, each agent gets an isolated local workspace directory. This is fine for simple tasks, but breaks down when you want agents to operate on a remote server, a Raspberry Pi, a teammate's machine, or any device that doesn't have SSH exposed to the internet.

Workplaces solve this:

- **Remote workplaces** auto-connect via SSH using stored credentials. No more `sshc` calls to set up a session manually.
- **Cloud workplaces** use [Evonet](/agents/evonet) — a lightweight Go binary — to create a persistent outbound tunnel. The device can be behind NAT, a home router, or a corporate firewall with no configuration needed.
- **Shared workplaces** allow multiple agents to operate in the same environment (useful for team workflows).

## Creating a Workplace

1. Navigate to `/workplaces` → **+ New Workplace**
2. Select the type (Local, Remote, or Cloud)
3. Fill in the type-specific config (see below)
4. Save — the Workplace appears in the list with a status indicator

## Workplace Types

### Local

A directory on the same machine where Evonic is running. Use this when you want to give an agent a specific filesystem path rather than the default `agents/<id>/workspace/`.

Config:
- **Workspace Path** — absolute path on the local machine (e.g., `/home/user/projects/myapp`)

### Remote

An SSH server. Evonic auto-connects when the Workplace is first accessed by an agent.

Config:
- **Host** / **Port**
- **Username**
- **Auth type** — password or SSH key
- **Key path** — path to private key on the Evonic server (if using key auth)
- **Workspace path** — directory on the remote server

Connection management:
- Use the **Connect** / **Disconnect** buttons on the Workplace detail page to test the connection.
- Evonic reconnects automatically when an agent uses the Workplace if the SSH session has dropped.

### Cloud

A device running the [Evonet](/agents/evonet) binary. Evonet makes an outbound WebSocket connection to Evonic, so the device needs no open ports, public IP, or firewall rules.

Cloud workplaces are **1:1 with an agent** — each Cloud Workplace can only be assigned to one agent at a time.

Config:
- **Workspace path** — working directory on the remote device (optional; defaults to the directory containing the Evonet binary)

#### Pairing a Cloud Workplace

**Step 1** — On the Workplace detail page, click **Generate Pairing Code**. A 6-character code (e.g., `X7KQ2M`) is shown with a 5-minute countdown.

**Step 2** — On the target device, install Evonet and run:

```bash
evonet pair --code X7KQ2M --server https://your-evonic-server.com
evonet run
```

**Step 3** — The Workplace status updates to **connected** in the UI. The agent can now execute commands on the device.

Once paired, Evonet reconnects automatically on restart using credentials saved in `~/.evonet/config.yaml`. Regenerate the pairing code only if you need to re-pair a new device.

## Assigning a Workplace to an Agent

1. Open the agent's detail page → **Settings** tab
2. Find the **Workplace** dropdown (above the Workspace Directory field)
3. Select a Workplace — the dropdown shows type badges and live status dots
4. Save — the agent will use the selected Workplace for all tool executions

When a Workplace is assigned:
- The agent's workspace becomes the Workplace's `workspace_path`
- Remote Workplaces auto-connect on first use
- Cloud Workplaces show a connection overlay in the chat UI if Evonet is offline

To remove a Workplace, set the dropdown back to **None (use workspace)**.

## Sharing Workplaces Between Agents

**Local** and **Remote** workplaces can be assigned to multiple agents simultaneously. Each agent operates in the same filesystem context, which is useful when agents collaborate on the same codebase.

**Cloud** workplaces are restricted to one agent at a time.

## Status Indicators

| Color | Meaning |
|-------|---------|
| Green dot | Connected |
| Yellow dot | Connecting / pairing in progress |
| Gray dot | Disconnected |
| Red dot | Error — hover or open detail page for message |

The status is updated in real-time via SSE events (`workplace_status_changed`, `connector_connected`, `connector_disconnected`).

## Connection Overlay

When an agent is using a Remote or Cloud Workplace and the connection is not yet established, a yellow banner appears above the chat input:

- **Remote**: "Connecting to [workplace]..." with a spinner — Evonic is opening the SSH connection
- **Cloud**: "Waiting for Evonet..." — the device hasn't connected yet
- **Error**: "Workplace disconnected" with a **Retry** button

The overlay clears automatically once the connection is established.

## Configuration Reference

Connector relay settings (in `.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `CONNECTOR_WS_PORT` | `8081` | Port for the Evonet WebSocket relay server |
| `CONNECTOR_WS_HOST` | `0.0.0.0` | Bind address for the relay server |
| `CONNECTOR_PING_INTERVAL` | `30` | WebSocket ping interval in seconds |
| `CONNECTOR_PING_TIMEOUT` | `10` | Ping timeout in seconds before declaring disconnect |
| `CONNECTOR_PAIRING_CODE_TTL` | `300` | Pairing code validity window in seconds |

## See Also

- [Evonet — Cloud Workplace Connector](/agents/evonet) — install and configure the Evonet binary
- [Creating Agents](/agents/creating-agents) — agent setup guide
- [Tools](/agents/tools) — tools that use the execution environment (bash, runpy, read_file, write_file)
