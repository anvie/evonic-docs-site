---
title: Channels
description: Connect agents to Telegram, WhatsApp, and other messaging platforms.
sidebar:
  order: 5
---

## Overview

Channels connect agents to external messaging platforms. The architecture is fully modular — adding a new channel type requires implementing a simple interface, not restructuring core code.

## Supported Channels

| Type | Status | Library |
|---|---|---|
| Telegram | Implemented | `python-telegram-bot` |
| WhatsApp | Config UI ready | — |
| Discord | Config UI ready | — |

## Adding a Channel to an Agent

### Via the Web UI

1. Go to the agent detail page → **Channels** tab
2. Click **+ Add Channel**
3. Select the channel type
4. Fill in the configuration (e.g., Telegram bot token)
5. Click **Add**

### Via the API

```bash
curl -X POST http://localhost:8080/api/agents/bookstore_bot/channels \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "telegram",
    "name": "Main Telegram Bot",
    "config": {
      "bot_token": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
    }
  }'
```

## Primary Channel

An agent can designate one connected channel as its **primary channel**. The primary channel determines the default routing target for **outbound notifications** — for example, when an agent calls `escalate_to_user`, the notification is sent through the primary channel if one is set and active.

### Setting a Primary Channel

Via the API:

```bash
curl -X POST http://localhost:8080/api/agents/<agent_id>/channels/<channel_id>/set-primary
```

You can also set the primary channel from the **Channels** tab in the web UI.

### Unsetting a Primary Channel

```bash
curl -X POST http://localhost:8080/api/agents/<agent_id>/channels/<channel_id>/unset-primary
```

### Routing Priority

When the agent needs to send an outbound notification:

1. If a **primary channel** is set and active → use it
2. Otherwise → fall back to the channel the user originally messaged from

This ensures notifications reach the user through their preferred channel, even if the conversation started elsewhere.

## Telegram Setup

### Prerequisites

1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Copy the bot token
3. Install the Python library: `pip install python-telegram-bot`

### Configuration

The Telegram channel requires one config field:

| Field | Description |
|---|---|
| `bot_token` | The token from BotFather |

### Starting the Bot

Start a channel via the API:

```bash
curl -X POST http://localhost:8080/api/agents/bookstore_bot/channels/<channel_id>/start
```

The bot starts polling in a background thread. All incoming text messages are routed through the Agent Runtime, which handles session management, tool execution, and response generation.

### Slash Commands

Telegram messages starting with `/` are treated as slash commands and handled by the agent runtime:

| Command | Description |
|---------|-------------|
| `/clear` | Clear the current conversation history |
| `/help` | Display available slash commands |
| `/summary` | Trigger conversation summarization |

See [Slash Commands](/agents/slash-commands) for full details.

### Stopping the Bot

```bash
curl -X POST http://localhost:8080/api/agents/bookstore_bot/channels/<channel_id>/stop
```

## Channel Management API

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

## How Channels Work

1. A channel receives a message from the external platform
2. It extracts the user ID and message text
3. It calls `agent_runtime.handle_message(agent_id, user_id, text, channel_id)`
4. The runtime processes the message (session lookup, LLM call, tool execution)
5. The runtime returns a response string
6. The channel sends the response back to the user

Sessions are keyed by `(agent_id, channel_id, external_user_id)`, so the same user has separate conversations per channel.

## Implementing New Channels

See [Creating Channels](/development/creating-channels) for a guide on implementing support for additional messaging platforms.
