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
| `message` | string |: | Log message text |
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
| `method` | string |: | HTTP method: `"GET"`, `"POST"`, `"PUT"`, `"DELETE"`, etc. |
| `url` | string |: | Target URL |
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
| `session_id` | string |: | Session ID |
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

## Plugin Detail Tabs

*Introduced in v1.3.0.*

A plugin can add its own tabs to the **plugin detail page**. Drop any file named `<slug>_tab.html` into the plugin's `templates/` directory and it automatically appears as an extra tab:

- `manage_tab.html` → a tab with id `manage` and label **Manage**
- `settings_tab.html` → a tab with id `settings` and label **Settings**

The HTML partial is injected into the detail page's tab area. To run setup code when the tab first opens, define a lazy initializer in the partial:

```html
<!-- plugins/myplugin/templates/manage_tab.html -->
<div id="myplugin-manage"><!-- manage UI --></div>
<script>
  // Runs once, the first time the "manage" tab is opened.
  function tabInit_manage() {
    // wire up your manage UI here
  }
</script>
```

The convention is `window.tabInit_<slug>()` — the platform calls it when the tab becomes visible.

## Endpoint Discovery & Pagination

*Introduced in v1.3.0.*

Plugin REST endpoints now support **discovery** (the platform can enumerate the endpoints a plugin exposes) and **pagination** for large result sets. When an endpoint returns a list, accept `limit` / `offset` (or equivalent) parameters so clients can page through results instead of loading everything at once.

## Multiple-Choice Prompts (`ask_user`)

*Introduced in v1.3.0.*

The built-in `ask_user` plugin lets an agent **pause mid-turn** and ask the user one or more multiple-choice questions. Each question renders as an interactive card in the web chat, and the user's selection is returned to the agent as the tool result.

- Each question needs **2–4 options** (minimum 2, maximum 4), and every option must have a `label`.
- An option can be marked `recommended` to suggest an answer.
- The agent waits for the answer before continuing its turn.

This is ideal for clarifying ambiguous requests without flooding the user with free-text follow-ups.
