---
title: Channels
description: Connect agents to Telegram, WhatsApp, Discord, Slack, and other messaging platforms.
sidebar:
  order: 5
---

## Overview

Channels act as the bridge between Evonic agents and external messaging platforms. They allow users to interact with agents through their preferred interface, such as Telegram, WhatsApp, Discord, or Slack.

The architecture is fully modular: adding a new channel type requires implementing a standard interface, allowing Evonic to scale to any messaging protocol without changing the core agent runtime.

<Aside type="tip">
A single agent can be connected to multiple channels simultaneously. Each channel is treated as a separate entry point for the agent.
</Aside>

## How Channels Work

When a message is sent via a channel, the following flow occurs:

1. **Message Arrival**: The channel implementation (e.g., a Telegram bot) receives a message from the external platform.
2. **Extraction**: The channel extracts the `external_user_id` and the message text.
3. **Runtime Dispatch**: The channel calls `agent_runtime.handle_message(agent_id, user_id, text, channel_id)`.
4. **Processing**: The Agent Runtime:
    - Identifies the correct session for that specific user on that specific channel.
    - Constructs the conversation context (System Prompt + History + New Message).
    - Calls the LLM.
    - Executes any required tools.
5. **Response**: The runtime returns a response string to the channel.
6. **Delivery**: The channel sends the response back to the user on the original platform.

<FileTree>
- backend/
  - channels/
    - base.py (Interface definition)
    - telegram.py (Implementation)
    - registry.py (Channel registration)
</FileTree>

## Supported Channels

| Type | Status | Library | Description |
|---|---|---|---|
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

### Via the API

To add a channel programmatically, send a `POST` request to the agent's channel endpoint:

```bash
curl -X POST http://localhost:8080/api/agents/<agent_id>/channels \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "telegram",
    "name": "My Telegram Bot",
    "config": {
      "bot_token": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
    }
  }'
```

## Primary Channels

An agent can designate one connected channel as its **primary channel**. 

The primary channel is used for **outbound notifications**. For example, if an agent needs to proactively alert a user (via `escalate_to_user`), it will attempt to send that message through the primary channel.

### Routing Priority

When an agent needs to send a message:
1. If a **primary channel** is set and active $\rightarrow$ use it.
2. Otherwise $\rightarrow$ fall back to the channel the user originally messaged from.

This ensures that if a user starts a chat on Discord, the agent responds on Discord, even if a Telegram bot is also connected.

## Telegram Setup Guide

### Prerequisites

1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram.
2. Copy the **API Token** provided by BotFather.
3. Ensure the environment has `python-telegram-bot` installed.

### Configuration Fields

| Field | Description |
|---|---|
| `bot_token` | The unique token provided by BotFather. |

### Managing the Bot

Once configured, you can control the bot state via the API:

| Action | Method | Endpoint |
|---|---|---|
| **Start Bot** | `POST` | `/api/agents/<id>/channels/<ch_id>/start` |
| **Stop Bot** | `POST` | `/api/agents/<id>/channels/<ch_id>/stop` |

## Best Practices

<Steps>

1. **Use Unique Names**: When adding multiple channels of the same type, give them descriptive names (e.g., "Customer Support Telegram" vs "Internal Alert Telegram") to avoid confusion in the UI.
2. **Monitor Channel Status**: Regularly check if your channels are "Running". If a bot token is revoked or the service goes down, the channel will stop receiving messages.
3. **Handle Session Scoping**: Remember that sessions are keyed by `(agent_id, channel_id, external_user_id)`. A user having a conversation on Telegram will have a different history than that same user on Discord.
4. **Graceful Shutdown**: When stopping an agent, ensure you stop the channels as well to prevent orphaned background threads or hanging connections.

</Steps>

## Channel Management API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/agents/<id>/channels` | List all channels for an agent |
| `POST` | `/api/agents/<id>/channels` | Add a new channel |
| `PUT` | `/api/agents/<id>/channels/<ch_id>` | Update channel config |
| `DELETE` | `/api/agents/<id>/channels/<ch_id>` | Delete a channel |
| `POST` | `/api/agents/<id>/channels/<ch_id>/start` | Start the channel |
| `POST` | `/api/agents/<id>/channels/<ch_id>/stop` | Stop the channel |
| `POST` | `/api/agents/<id>/channels/<ch_id>/set-primary` | Set as primary channel |
| `POST` | `/api/agents/<id>/channels/<ch_id>/unset-primary` | Unset as primary channel |

---

See [Creating Channels](/development/creating-channels) for technical details on implementing new channel types.
