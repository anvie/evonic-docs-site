---
title: Channels
description: Connect Evonic agents to Telegram, WhatsApp, Discord, Slack, and other messaging platforms.
sidebar:
  order: 5
---

## Overview

Channels act as the bridge between Evonic agents and external messaging platforms. They allow users to interact with agents through their preferred interface — Telegram, WhatsApp, Discord, Slack, or the web UI — without changing how the agent works underneath.

The architecture is fully modular: adding a new channel type requires implementing a standard interface, allowing Evonic to scale to any messaging protocol without modifying the core agent runtime.

<Aside type="tip">
  A single agent can be connected to multiple channels simultaneously. Each channel provides a separate entry point, and sessions are tracked independently per user per channel.
</Aside>

## How Channels Work

When a message arrives through a channel, the following flow occurs:

1. **Message Arrival**: The channel implementation (e.g., a Telegram bot) receives a message from the external platform.
2. **Extraction**: The channel extracts the `external_user_id` and the message text.
3. **Check Access**: If the channel is in **restricted mode**, the system checks if the user is in the allowlist or has a pending pairing code.
4. **Runtime Dispatch**: The channel calls `agent_runtime.handle_message(agent_id, user_id, text, channel_id)`.
5. **Processing**: The Agent Runtime:
   - Identifies the correct session for that specific user on that specific channel
   - Constructs the conversation context (System Prompt + History + New Message)
   - Calls the LLM
   - Executes any required tools through HMADS (Heuristic Mal-Activity Detection System)
6. **Response**: The runtime returns a response string to the channel.
7. **Delivery**: The channel sends the response back to the user on the original platform.

<FileTree>
  - backend/
    - channels/
      - base.py (Interface definition)
      - telegram.py (Implementation)
      - registry.py (Channel registration)
      - pairing.py (Pairing code generation & validation)
</FileTree>

## Channel Modes

Introduced in **v0.2.0**. Each channel has a mode that controls who can interact with the agent through that channel.

| Mode | Description |
|------|-------------|
| **Open** | Everyone is allowed to chat. No allowlist check. |
| **Restricted** | Only users in the allowlist can chat. New users receive a **pairing code** that an admin must approve. |

New channels default to **restricted** mode. You can change the mode at any time via the **Channel Detail Modal** in the Web UI (click on a channel card) or through the API.

### Open Mode

In open mode, any user who sends a message to the channel can immediately start interacting with the agent. No approval is needed.

```json
{
  "config": {
    "mode": "open"
  }
}
```

### Restricted Mode

In restricted mode, only users whose `external_user_id` is in the channel's **allowlist** can chat. When an unregistered user sends a message:

1. The channel checks if the user is already in the allowlist.
2. If not, it checks for an existing non-expired pending approval for that user.
3. If none exists, the system generates a **pairing code** and creates a pending approval record.
4. The user receives the pairing code as a reply and must share it with an admin.
5. An admin approves the code (via CLI or Web UI), adding the user to the allowlist.
6. The user can now interact with the agent normally.

```json
{
  "config": {
    "mode": "restricted",
    "allowed_users": ["123456789", "987654321"]
  }
}
```

## Pairing Codes

Pairing codes allow users to request access to a restricted channel. They are 6-character alphanumeric codes that expire after **5 minutes**.

### Code Format

- **Format**: `XXXXXX` — 6 uppercase alphanumeric characters, no hyphen.
- **Character set**: `ABCDEFGHJKMNPQRSTUVWXYZ23456789`
- **Ambiguous characters excluded**: `0`, `O`, `1`, `I`, `L` (prevent visual confusion).

<Aside type="tip">
  Legacy codes in `XXX-XXX` format (e.g., `XK4-M9Q`) are accepted for backward compatibility. The hyphen is automatically stripped and letters uppercased before lookup.
</Aside>

### Pairing Flow

1. A user sends a message to the channel (e.g., your Telegram bot).
2. The channel responds with a 6-character pairing code like `XK4M9Q`.
3. The user shares this code with an admin (via email, chat, or in person).
4. The admin approves the code:
   - **Via CLI**: `evonic channel approve XK4M9Q`
   - **Via Web UI**: Open the Channel Detail Modal and click **Approve** on the pending request.
5. The user is added to the channel's allowlist and can now interact with the agent.

### Generating Codes

Admins can also generate pairing codes on demand from the **Channel Detail Modal**:

1. Click on a channel card to open the detail modal.
2. Click the **Generate** button in the Pairing Code section.
3. A fresh 6-character code appears, valid for 5 minutes.
4. Click the **Copy** button to share it with a user.

### Code Validation

Pairing codes are validated against these rules:

- Must be exactly 6 characters long.
- Must contain only uppercase letters (A-Z, excluding O, I, L) and digits (2-9).
- No hyphens, spaces, or special characters (legacy hyphen format is normalised before validation).
- Must not be expired (codes expire 5 minutes after generation).

```python
# Example: valid codes
"XK4M9Q"  # ✅ Standard format
"ABC123"  # ✅
"XK4-M9Q" # ✅ Legacy format (hyphen stripped)

# Example: invalid codes
"abc123"  # ❌ Lowercase
"0O1L"    # ❌ Contains ambiguous characters
"ABCDE"   # ❌ Too short (5 chars)
"ABCDEFG" # ❌ Too long (7 chars)
```

## Supported Channels

| Type | Status | Library | Description |
|------|--------|---------|-------------|
| **Telegram** | ✅ Implemented | `python-telegram-bot` | Full support via bot tokens. |
| **WhatsApp** | ✅ Implemented | `@whiskeysockets/baileys` | WhatsApp Web via Node.js sidecar (Baileys bridge). |
| **Discord** | ⏳ Planned | `discord.py` | Coming soon. |
| **Slack** | ⏳ Planned | `slack-sdk` | Coming soon. |

## Configuration

You can configure channels through the Web UI or directly via the API.

### Via the Web UI

1. Navigate to the **Agents** page and select your agent.
2. Click on the **Channels** tab.
3. Click **+ Add Channel**.
4. Select the desired channel type (e.g., Telegram).
5. Provide the necessary configuration (e.g., Bot Token).
6. Click **Add**.

#### Channel Detail Modal

Clicking on a channel card opens the **Channel Detail Modal**, where you can manage all aspects of the channel:

<Aside type="note">
  The Channel Detail Modal was introduced in **v0.2.0** and replaces the previous inline channel management UI.
</Aside>

The modal provides:

- **Channel Info**: Name, type badge, mode toggle, and running status indicator.
- **Mode Toggle**: Switch between **Open** and **Restricted** mode. Toggling updates the mode immediately.
- **Pending Approvals**: Lists all users waiting for approval. Each entry shows the user name, external ID, pairing code, and timestamp. Click **Approve** or **Reject** to handle each request. Pending approvals auto-refresh every 30 seconds.
- **Pairing Code Generator**: Generate a temporary pairing code to share with a user. The code appears in large monospace text with a **Copy** button.
- **Allowed Users**: View the current allowlist with display names. Add new users by entering their `external_user_id` in the input field. Remove users with the **Remove** button.

### Via the API

To add a channel programmatically, send a `POST` request to the agent's channel endpoint:

```bash
curl -X POST http://localhost:8080/api/agents/<agent_id>/channels \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "telegram",
    "name": "My Telegram Bot",
    "config": {
      "bot_token": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
      "mode": "restricted"
    }
  }'
```

### Managing Channel Mode via API

You can update a channel's mode by sending a `PUT` request:

```bash
curl -X PUT http://localhost:8080/api/agents/<agent_id>/channels/<ch_id> \
  -H 'Content-Type: application/json' \
  -d '{
    "config": {
      "mode": "open"
    }
  }'
```

### Managing the Allowlist via API

To add a user to the allowlist:

```bash
curl -X PUT http://localhost:8080/api/agents/<agent_id>/channels/<ch_id> \
  -H 'Content-Type: application/json' \
  -d '{
    "config": {
      "allowed_users": ["user_id_1", "user_id_2"]
    }
  }'
```

## Primary Channels

An agent can designate one connected channel as its **primary channel**.

The primary channel is used for **outbound notifications**. For example, if an agent needs to proactively alert a user (via `escalate_to_user`), it will attempt to send that message through the primary channel.

### Routing Priority

When an agent needs to send a message:

1. If a **primary channel** is set and active → use it.
2. Otherwise → fall back to the channel the user originally messaged from.

This ensures that if a user starts a chat on Discord, the agent responds on Discord, even if a Telegram bot is also connected.

## Telegram Setup Guide

### Prerequisites

1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram.
2. Copy the **API Token** provided by BotFather.
3. Ensure the environment has `python-telegram-bot` installed.

### Configuration Fields

| Field | Description |
|-------|-------------|
| `bot_token` | The unique token provided by BotFather. |

### Managing the Bot

Once configured, you can control the bot state via the API:

| Action | Method | Endpoint |
|--------|--------|----------|
| **Start Bot** | `POST` | `/api/agents/<id>/channels/<ch_id>/start` |
| **Stop Bot** | `POST` | `/api/agents/<id>/channels/<ch_id>/stop` |

## Best Practices

<Steps>

1. **Use Unique Names**: When adding multiple channels of the same type, give them descriptive names (e.g., "Customer Support Telegram" vs "Internal Alert Telegram") to avoid confusion in the UI.

2. **Monitor Channel Status**: Regularly check if your channels are "Running". If a bot token is revoked or the service goes down, the channel will stop receiving messages.

3. **Use Restricted Mode for Public Channels**: If your channel is accessible to the public (e.g., a customer support Telegram bot), keep it in **restricted** mode and use pairing codes to onboard users selectively.

4. **Handle Session Scoping**: Sessions are keyed by `(agent_id, channel_id, external_user_id)`. A user having a conversation on Telegram will have a different history than that same user on Discord — this is intentional for privacy and context separation.

5. **Graceful Shutdown**: When stopping an agent, stop its channels as well to prevent orphaned background threads or hanging connections.

</Steps>

## Channel Management API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents/<id>/channels` | List all channels for an agent |
| `POST` | `/api/agents/<id>/channels` | Add a new channel |
| `PUT` | `/api/agents/<id>/channels/<ch_id>` | Update channel config |
| `DELETE` | `/api/agents/<id>/channels/<ch_id>` | Delete a channel |
| `POST` | `/api/agents/<id>/channels/<ch_id>/start` | Start the channel |
| `POST` | `/api/agents/<id>/channels/<ch_id>/stop` | Stop the channel |
| `POST` | `/api/agents/<id>/channels/<ch_id>/set-primary` | Set as primary channel |
| `POST` | `/api/agents/<id>/channels/<ch_id>/unset-primary` | Unset as primary channel |
| `POST` | `/api/agents/<id>/channels/<ch_id>/generate-pair-code` | Generate a pairing code |
| `GET` | `/api/agents/<id>/channels/<ch_id>/pending-approvals` | List pending approvals |
| `POST` | `/api/agents/<id>/channels/<ch_id>/pending-approvals/<id>/approve` | Approve a pending request |
| `POST` | `/api/agents/<id>/channels/<ch_id>/pending-approvals/<id>/reject` | Reject a pending request |

## Related Pages

- [Channel Approvals API](/agents/channel-approvals) — REST API and SSE for channel approvals
- [CLI Channel Management](/cli/channels) — Approve pairing codes via the CLI
- [Creating Channels](/development/creating-channels) — Technical details for implementing new channel types
