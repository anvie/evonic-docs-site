---
title: Evonet — Cloud Workplace Connector
description: A lightweight Go binary that connects any device to Evonic over WebSocket, enabling remote agent execution without SSH or a public IP.
sidebar:
  order: 8
---

**Evonet** is a lightweight Go binary that runs on a target device and connects it to an Evonic server over WebSocket. Once connected, agents can execute bash scripts, Python code, and file operations on that device — without SSH, port forwarding, or a public IP address.

It's the backend for **Cloud Workplaces**. See [Workplaces](/agents/workplaces) for the Evonic-side setup.

## How It Works

```
Agent (Evonic server) ──── WebSocket (outbound) ──── Evonet (your device)
                                                             │
                                                      bash / python / files
```

Evonet makes the connection *outbound* from the device, so the device needs no open inbound ports. Any device that can reach the Evonic server URL works — home networks, corporate firewalls, cloud VMs, Raspberry Pis.

## Installation

### Download a pre-built binary

Download the binary for your platform from the Evonic releases page:

```bash
# Linux (amd64)
curl -L https://your-evonic-server/releases/evonet-linux-amd64 -o evonet
chmod +x evonet
sudo mv evonet /usr/local/bin/
```

### Build from source

Requires Go 1.21+.

```bash
git clone <evonic-repo>
cd evonet/
make build           # current platform
make build-linux     # Linux amd64
make build-macos     # macOS arm64 + amd64
make build-windows   # Windows amd64
```

## Quick Start

**1. Pair with your Evonic server**

In the Evonic UI, open a Cloud Workplace → click **Generate Pairing Code** → copy the 6-character code.

On the device:

```bash
evonet pair --code X7KQ2M --server https://your-evonic-server.com
```

**2. Connect**

```bash
evonet run    # auto-reconnect (recommended)
```

The Workplace status in the UI turns green. Agents assigned to this Workplace can now run commands on the device.

## Commands

```
evonet pair    --code <CODE> --server <URL>   Pair with Evonic server
evonet start                                  Connect (exits on disconnect)
evonet run                                    Connect with auto-reconnect
evonet status                                 Show pairing status
evonet unpair                                 Clear credentials
```

### Options for `start` / `run`

```
--config <path>    Config file (default: ~/.evonet/config.yaml)
--server <url>     Override server URL
--token  <token>   Override connector token
--workdir <path>   Override working directory
```

## Configuration

Config is resolved in priority order (highest wins):

1. CLI flags
2. `~/.evonet/config.yaml` (written by `evonet pair`)
3. Config embedded in the binary

```yaml
# ~/.evonet/config.yaml
server_url: https://your-evonic-server.com
connector_token: tok_abc123...
workplace_id: workplace_xyz
workplace_name: My Server
workspace_path: /home/user/workspace
```

## Running as a Service

### systemd (Linux)

```ini
# /etc/systemd/system/evonet.service
[Unit]
Description=Evonet Cloud Workplace Connector
After=network.target

[Service]
ExecStart=/usr/local/bin/evonet run
Restart=on-failure
RestartSec=5
User=ubuntu

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now evonet
```

### macOS (launchd)

```xml
<!-- ~/Library/LaunchAgents/com.evonic.evonet.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.evonic.evonet</string>
  <key>ProgramArguments</key>
  <array><string>/usr/local/bin/evonet</string><string>run</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.evonic.evonet.plist
```

## Embedding Config in the Binary

For distributing a pre-configured Evonet binary (e.g., to a teammate or a server):

```bash
# 1. Create config.json
cat > config.json << 'EOF'
{
  "server_url": "https://your-evonic-server.com",
  "connector_token": "tok_abc123...",
  "workplace_id": "workplace_xyz",
  "workspace_path": "/home/user/workspace"
}
EOF

# 2. Build and embed
cd evonet/
make embed CONFIG=../config.json

# 3. Distribute the 'evonet' binary — it auto-connects on 'evonet run'
```

The JSON config is appended after the binary using a magic marker. It can still be overridden by `~/.evonet/config.yaml` or CLI flags.

## Security Notes

- The connector token is equivalent to a password — protect `~/.evonet/config.yaml` with `chmod 600`.
- Pairing codes expire after 5 minutes. They cannot be reused.
- `exec_bash` and `exec_python` run with the OS privileges of the `evonet` process. Run Evonet as a dedicated least-privilege user.
- All traffic flows over the WebSocket connection authenticated by the connector token (no additional auth per request).

## See Also

- [Workplaces — Execution Environments](/agents/workplaces) — create and manage Workplaces in the Evonic UI
- [Configuration Reference](/reference/configuration) — server-side connector settings
