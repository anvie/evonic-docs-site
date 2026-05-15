---
title: Agent API Plugin
description: Expose Evonic agents via an OpenAI-compatible REST API with token authentication.
sidebar:
  order: 11
---

## Overview

The **Agent API** plugin exposes Evonic agents through an OpenAI-compatible REST API. This allows external applications to interact with your agents using the familiar `/v1/chat/completions` endpoint pattern, with bearer-token authentication, quota management, and model-scoping.

## Installation

The plugin is available as a built-in plugin under `plugins/agentapi/`. Enable it from the **Plugins** page in the Web UI or via the CLI.

## How It Works

The plugin creates an OpenAI-compatible API layer that maps external model names to your internal Evonic agents:

1. External client calls `/plugin/agentapi/v1/chat/completions` with a model name like `gpt-4-assistant`
2. The plugin looks up the model → agent mapping to find which Evonic agent to use
3. The request is forwarded to the mapped agent
4. The agent processes the request and returns a response in OpenAI-compatible format

## Configuration

### Model → Agent Mapping

The `MODEL_AGENT_MAP` variable defines how external model names map to internal agent IDs:

```json
{
  "gpt-4-assistant": "linus",
  "claude-assistant": "siwa",
  "custom-agent": "my_agent"
}
```

Each key is a public-facing model name (used in API requests), and each value is the ID of an Evonic agent.

## API Endpoints

### POST `/plugin/agentapi/v1/chat/completions`

Send a chat completion request to an agent.

**Headers:**
```
Authorization: Bearer <api_token>
Content-Type: application/json
```

**Request body:**
```json
{
  "model": "gpt-4-assistant",
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ],
  "temperature": 0.7
}
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `model` | Yes | The public model name (maps to an agent via `MODEL_AGENT_MAP`) |
| `messages` | Yes | Array of message objects with `role` and `content` |
| `temperature` | No | Sampling temperature (passed to the underlying model) |

### GET `/plugin/agentapi/v1/models`

List all available model names (agent mappings).

Returns the keys from `MODEL_AGENT_MAP` as available models.

## Token Management

*Introduced in v0.3.19.*

The Agent API now provides a **token management UI** for creating, editing, deleting, and inspecting API tokens.

### Creating Tokens

1. Go to the **Agent API** plugin settings in the Web UI
2. Navigate to the **Tokens** tab
3. Click **Create Token**
4. Set a label/name for the token (e.g., "Production App")
5. Optionally set a usage quota
6. Copy the generated token — it will not be shown again

### Token Features

| Feature | Description |
|---------|-------------|
| **Create** | Generate new bearer tokens with optional labels |
| **Edit** | Update token labels or quotas |
| **Delete** | Revoke tokens to block access |
| **Inspect** | View token metadata (created date, last used, usage count) |

### Token Usage

Tokens are passed as Bearer tokens in the `Authorization` header:

```http
Authorization: Bearer evo_abc123def456...
```

### Quota Management

Each token can have an optional usage quota, limiting how many requests it can make. This is useful for:

- Rate-limiting API access for specific applications
- Controlling usage before billing
- Preventing runaway scripts

## Example: Using the Agent API

### With cURL

```bash
curl -X POST https://your-evonic-instance.com/plugin/agentapi/v1/chat/completions \
  -H "Authorization: Bearer evo_abc123def456" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4-assistant",
    "messages": [
      {"role": "user", "content": "What is the weather today?"}
    ]
  }'
```

### With Python

```python
import requests

response = requests.post(
    "https://your-evonic-instance.com/plugin/agentapi/v1/chat/completions",
    headers={
        "Authorization": "Bearer evo_abc123def456",
        "Content-Type": "application/json",
    },
    json={
        "model": "gpt-4-assistant",
        "messages": [{"role": "user", "content": "Hello!"}],
    },
)

print(response.json())
```

## Security

- **Bearer token authentication** — all requests must include a valid token
- **Per-token quotas** — limit usage per application
- **Token revocation** — instantly block compromised tokens
- **Model scoping** — agents are only accessible through their mapped model name
