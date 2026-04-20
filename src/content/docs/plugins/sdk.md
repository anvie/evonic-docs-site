---
title: SDK
description: PluginSDK methods available for building Evonic plugins.
---

# Plugin SDK

Each handler receives a `PluginSDK` instance (`sdk` parameter) with these methods:

## `sdk.log(message, level="info")`

Log a message with plugin context. Messages appear in plugin logs.

```python
def on_message_received(event, sdk):
    sdk.log("Processing incoming message")
    sdk.log("Error occurred", level="error")
    sdk.log("Debug info", level="warn")
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | string | — | Log message text |
| `level` | string | `"info"` | Log level: `"info"`, `"warn"`, or `"error"` |

## `sdk.send_message(agent_id, external_user_id, channel_id, text)`

Send a message to a user via an agent session on a specific channel.

```python
def on_turn_complete(event, sdk):
    session = sdk.get_session(event['session_id'])
    agent_id = session.get('agent_id')
    user_id = session.get('user_id')
    channel_id = session.get('channel_id')

    sdk.send_message(
        agent_id=agent_id,
        external_user_id=user_id,
        channel_id=channel_id,
        text="Your turn is complete!"
    )
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `agent_id` | string | Target agent ID |
| `external_user_id` | string | User identifier on the channel (e.g. Telegram user ID) |
| `channel_id` | string | Channel ID (UUID) or channel type hint like `'telegram'` |
| `text` | string | Message text to send |

**Returns:** `{"success": bool, "session_id": str}` on success, or `{"success": False, "error": str}` on failure.

## `sdk.http_request(method, url, headers=None, json=None, data=None, timeout=30)`

Make an HTTP request to an external API.

```python
def on_message_received(event, sdk):
    response = sdk.http_request(
        method="POST",
        url="https://api.example.com/webhook",
        json={"session_id": event.get("session_id"), "message": event.get("message")},
        timeout=10
    )
    if response.get("ok"):
        sdk.log(f"Webhook sent: {response['status_code']}")
    else:
        sdk.log(f"Webhook failed: {response.get('error')}", level="error")
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `method` | string | — | HTTP method: `"GET"`, `"POST"`, `"PUT"`, `"DELETE"`, etc. |
| `url` | string | — | Target URL |
| `headers` | dict | `None` | Optional HTTP headers |
| `json` | dict | `None` | JSON body (automatically serialized) |
| `data` | string | `None` | Raw body data |
| `timeout` | int | `30` | Request timeout in seconds |

**Returns:** `{"status_code": int, "body": str, "headers": dict, "ok": bool}` on success, or `{"error": str, "ok": False}` on failure.

## `sdk.get_session_messages(session_id, agent_id=None, limit=50)`

Read messages from a session.

```python
def on_turn_complete(event, sdk):
    messages = sdk.get_session_messages(
        session_id=event['session_id'],
        limit=10
    )
    sdk.log(f"Last 10 messages: {len(messages)}")
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `session_id` | string | — | Session ID |
| `agent_id` | string | `None` | Optional agent ID filter |
| `limit` | int | `50` | Max number of messages to return |

**Returns:** List of message dicts.

## `sdk.get_session(session_id)`

Get enriched session details (includes `agent_name`, `channel_type`, etc.).

```python
def on_message_received(event, sdk):
    session = sdk.get_session(event['session_id'])
    agent_name = session.get('agent_name', 'Unknown')
    sdk.log(f"Session agent: {agent_name}")
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `session_id` | string | Session ID |

**Returns:** Dict with session details.
