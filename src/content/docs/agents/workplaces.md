---
title: "Workplaces: Execution Environments"
description: Attach agents to local directories, remote SSH servers, or any device running Evonet, without manual SSH setup.
sidebar:
  order: 7
---

A **Workplace** is a first-class execution environment for an agent. It replaces the per-agent workspace directory with a richer abstraction that supports three types of execution targets:

| Type | Where code runs | How it connects |
|------|-----------------|-----------------|
| **Local** | Same machine as Evonic | Direct filesystem/process access |
| **Remote** | SSH server | Auto-connect via stored SSH credentials |
| **Tunnel** | Any device running Evonet | Outbound WebSocket relay, no public IP needed |

Workplaces are managed at `/workplaces` in the web UI.

## Why Workplaces?

Without a Workplace, each agent gets an isolated local workspace directory. This is fine for simple tasks, but breaks down when you want agents to operate on a remote server, a Raspberry Pi, a teammate's machine, or any device that doesn't have SSH exposed to the internet.

Workplaces solve this:

- **Remote workplaces** auto-connect via SSH using stored credentials, so the agent never has to set up an SSH session by hand.
- **Tunnel workplaces** use [Evonet](/evonet), a lightweight Go binary, to create a persistent outbound tunnel. The device can be behind NAT, a home router, or a corporate firewall with no configuration needed.
- **Shared workplaces** allow multiple agents to operate in the same environment (useful for team workflows).

## Creating a Workplace

1. Navigate to `/workplaces` → **+ New Workplace**
2. Select the type (Local, Remote, or Tunnel)
3. Fill in the type-specific config (see below)
4. Save, and the Workplace appears in the list with a status indicator

## Workplace Types

### Local

A directory on the same machine where Evonic is running. Use this when you want to give an agent a specific filesystem path rather than the default `agents/<id>/workspace/`.

Config:
- **Workspace Path**: absolute path on the local machine (e.g., `/home/user/projects/myapp`)

### Remote

An SSH server. Evonic auto-connects when the Workplace is first accessed by an agent.

Config:
- **Host** / **Port**
- **Username**
- **Auth type**: password or SSH key
- **Key path**: path to private key on the Evonic server (if using key auth)
- **Workspace path**: directory on the remote server

Connection management:
- Use the **Connect** / **Disconnect** buttons on the Workplace detail page to test the connection.
- Evonic reconnects automatically when an agent uses the Workplace if the SSH session has dropped.

### Tunnel

A device running the [Evonet](/evonet) binary. Evonet makes an outbound WebSocket connection to Evonic, so the device needs no open ports, public IP, or firewall rules.

Tunnel workplaces are **1:1 with an agent**; each Tunnel Workplace can only be assigned to one agent at a time.

Config:
- **Workspace path**: working directory on the remote device (optional; defaults to the directory containing the Evonet binary)

#### Pairing a Tunnel Workplace

**Step 1**: On the Workplace detail page, click **Generate Pairing Code**. A 6-character code (e.g., `X7KQ2M`) is shown with a 5-minute countdown.

**Step 2**: On the target device, install Evonet and run:

```bash
evonet pair --code X7KQ2M --server https://your-evonic-server.com
evonet run
```

**Step 3**: The Workplace status updates to **connected** in the UI. The agent can now execute commands on the device.

Once paired, Evonet reconnects automatically on restart using credentials saved in `~/.evonet/config.yaml`. Regenerate the pairing code only if you need to re-pair a new device.

## Assigning a Workplace to an Agent

1. Open the agent's detail page → **Settings** tab
2. Find the **Workplace** dropdown (above the Workspace Directory field)
3. Select a Workplace; the dropdown shows type badges and live status dots
4. Save, and the agent will use the selected Workplace for all tool executions

When a Workplace is assigned:
- The agent's workspace becomes the Workplace's `workspace_path`
- Remote Workplaces auto-connect on first use
- Tunnel Workplaces show a connection overlay in the chat UI if Evonet is offline

To remove a Workplace, set the dropdown back to **None (use workspace)**.

## Switching Workplaces Mid-Chat

*Introduced in v1.5.6.*

You don't need to open the agent's settings to change where it works. The chat header has a **workplace switcher** that changes the active Workplace in one click:

1. Click the workplace switcher in the chat header.
2. Pick a Workplace from the list — the picker is **searchable**, so it stays usable even with a long list of Workplaces.
3. The chat shows a **"Workplace switched"** divider where the context changes, and the header chip updates to the new Workplace.

The switch is agent-wide: every session of the agent follows the new Workplace.

### Letting the Agent Switch Itself

When a task moves from one machine to another (for example, from a local repo to a remote server), you can let the agent move itself. This is opt-in:

1. Open the agent's detail page → **Portals** tab
2. In the **Workplace** card, toggle **Allow the agent to switch workplace**
3. Choose which Workplaces the agent may use: **Any workplace**, or a specific list (the local workspace is always allowed)

When enabled, the agent gets a `switch_workplace` tool:

- `switch_workplace(action='list')` — shows the Workplaces the agent may use and which one is current
- `switch_workplace(action='switch', workplace='remote-prod')` — moves the agent to a Workplace by id or exact name (`'local'` for the local workspace)

The switch is agent-wide and persistent — it applies to all of the agent's sessions, and any later tool calls in the same turn run in the new Workplace. A "Workplace switched" divider appears in the chat so you can see exactly when the context changed.

**Example:**

```text
agent: switch_workplace(action='switch', workplace='raspberry-pi-1')
chat:  ── Workplace switched: raspberry-pi-1 ──
```

## Sharing Workplaces Between Agents

**Local** and **Remote** workplaces can be assigned to multiple agents simultaneously. Each agent operates in the same filesystem context, which is useful when agents collaborate on the same codebase.

**Tunnel** workplaces are restricted to one agent at a time.

## Status Indicators

| Color | Meaning |
|-------|---------|
| Green dot | Connected |
| Yellow dot | Connecting / pairing in progress |
| Gray dot | Disconnected |
| Red dot | Error; hover or open detail page for message |

The status is updated in real-time via SSE events (`workplace_status_changed`, `connector_connected`, `connector_disconnected`).

## Connection Overlay

When an agent is using a Remote or Tunnel Workplace and the connection is not yet established, a yellow banner appears above the chat input:

- **Remote**: "Connecting to [workplace]..." with a spinner, meaning Evonic is opening the SSH connection
- **Tunnel**: "Waiting for Evonet..." (the device hasn't connected yet)
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

## Accessing Agent Home from Remote Workplaces

When an agent uses a Remote or Tunnel Workplace, its workspace is on a different machine. The agent can still access its own configuration, system prompt, and knowledge base files on the Evonic server using the `/_self/` virtual path prefix:

```python
# Read the agent's system prompt (on the Evonic server)
read_file(file_path="/_self/SYSTEM.md")

# Save a KB file (on the Evonic server)
write_file(file_path="/_self/kb/notes.md", content="...")
```

The `/_self/` prefix works with all file tools and resolves on the Evonic host regardless of where the agent's workspace is located. See [Tools: The `/_self/` Virtual Path](/agents/tools#the-_self-virtual-path) for details.

## Migrating from the `sshc` tool

*Changed in v1.6.0.*

The `sshc` tool — and the per-session SSH connection backend behind it — has been removed. Run remote commands through a workplace instead: the connection is configured once, and the regular `bash` tool executes there.

| Before (`sshc`) | Now |
|---|---|
| `sshc(host=..., user=..., command=...)` for each command | Create a **Remote** workplace with the host and credentials |
| Credentials passed in the tool call | Credentials stored in the workplace (or an SSH key in `keys/`) |
| Session set up ad hoc per call | The workplace connects automatically on use |
| Output returned from `sshc` | `bash(command="...")` runs on the workplace and returns `stdout`, `stderr`, and `exit_code` |

**Migration steps:**

1. Open `/workplaces` and create a **Remote** workplace with the same host, user, and key you used with `sshc`.
2. Assign it to the agent (or let the agent switch to it with `switch_workplace`).
3. Replace `sshc(...)` calls in prompts and skills with `bash(command="...")`.
4. Remove any `sshc` entries from tool assignments — the tool no longer exists.

```bash
# Before
sshc(host="build-01", user="deploy", command="systemctl status nginx")

# After — with the build-01 Remote workplace active
bash(command="systemctl status nginx")
```

## See Also

- [Evonet: Tunnel Workplace Connector](/evonet): install and configure the Evonet binary
- [Creating Agents](/agents/creating-agents): agent setup guide
- [Tools](/agents/tools): tools that use the execution environment (bash, runpy, read_file, write_file)

