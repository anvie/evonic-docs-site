---
title: Plugins
description: Event-driven plugin system — create, manage, and extend Evonic with custom plugins.
---

# Plugins

Plugins are event-driven extensions that respond to platform events. They run automatically when triggered by events and can perform actions like sending notifications, processing data, or integrating with external services.

## Plugin Structure

A plugin is a directory under `plugins/` containing:

```
my_plugin/
├── plugin.json    # Manifest: metadata, events, variables
└── handler.py     # Event handler functions
```

That's it. No `setup.py`, no `backend/` subdirectory. Just two files at the root of the plugin directory.

### plugin.json

The plugin manifest defines the plugin's metadata and events it responds to:

```json
{
  "id": "my_plugin",
  "name": "My Custom Plugin",
  "version": "1.0.0",
  "description": "Plugin that does something when events occur",
  "events": [
    "message_received",
    "turn_complete"
  ],
  "variables": [
    {
      "name": "CONFIG_KEY",
      "type": "string",
      "description": "Configuration variable description"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique plugin identifier (lowercase, alphanumeric + underscores) |
| `name` | string | Yes | Display name for the plugin |
| `version` | string | Yes | Semantic version (e.g. `1.0.0`) |
| `description` | string | Yes | Short description of what the plugin does |
| `events` | string[] | Yes | List of event names this plugin subscribes to |
| `variables` | object[] | No | Configuration variables users can set |

### Handler Functions

Each event in the `events` array maps to a handler function named `on_<event_name>` in `handler.py`. The handler signature is:

```python
def on_<event_name>(event: dict, sdk: PluginSDK) -> None:
    """Handle <event_name> events."""
    # Your logic here
```

- **`event`** — a dict containing event-specific data (e.g. `session_id`, `message`, `summary`, etc.)
- **`sdk`** — a `PluginSDK` instance providing helper methods (see [Plugin SDK](#plugin-sdk))
- **Return value** — handlers should not return anything. The framework ignores return values.

### Example Handler

```python
def on_message_received(event, sdk):
    """Log every incoming message."""
    session_id = event.get('session_id', '')
    user_message = event.get('message', '')
    sdk.log(f"Received message from session {session_id}: {user_message}")

def on_turn_complete(event, sdk):
    """Log when a conversation turn finishes."""
    session_id = event.get('session_id', '')
    sdk.log(f"Turn complete for session {session_id}")
```

## Plugin Events

Plugins respond to platform events. Here are all supported events:

| Event | Description | Event Data |
|-------|-------------|------------|
| `message_received` | User sends a message to an agent | `session_id`, `user_id`, `message`, `channel_id`, `agent_id` |
| `message_sent` | Agent sends a message to a user | `session_id`, `user_id`, `message`, `channel_id`, `agent_id` |
| `session_created` | A new session is created | `session_id`, `agent_id`, `user_id`, `channel_id` |
| `processing_started` | Agent starts processing a message | `session_id`, `user_id`, `message`, `agent_id` |
| `llm_thinking` | LLM is generating a response | `session_id`, `message`, `agent_id` |
| `llm_response_chunk` | A chunk of LLM response is received | `session_id`, `chunk`, `agent_id` |
| `tool_executed` | A tool is executed by the agent | `session_id`, `tool_name`, `tool_args`, `tool_result`, `agent_id` |
| `final_answer` | Agent produces a final answer | `session_id`, `answer`, `agent_id` |
| `turn_complete` | A full conversation turn finishes | `session_id`, `agent_id`, `user_id` |
| `summary_updated` | Session summary is updated | `session_id`, `summary`, `message_count`, `agent_id` |

## Plugin SDK

Each handler receives a `PluginSDK` instance (`sdk` parameter) with these methods:

### `sdk.log(message, level="info")`

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

### `sdk.send_message(agent_id, external_user_id, channel_id, text)`

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

### `sdk.http_request(method, url, headers=None, json=None, data=None, timeout=30)`

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

### `sdk.get_session_messages(session_id, agent_id=None, limit=50)`

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

### `sdk.get_session(session_id)`

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

## Configuration Variables

Plugins can define configuration variables that users can set via CLI. Variable types:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text value | `"https://hooks.example.com"` |
| `number` | Numeric value | `10` |
| `boolean` | True/false value | `true` |
| `array` | List of values | `["value1", "value2"]` |

Access variables in your handler via `sdk.config`:

```python
def on_message_received(event, sdk):
    webhook_url = sdk.config.get('WEBHOOK_URL', '')
    min_count = int(sdk.config.get('MIN_COUNT', 5))
    enabled = sdk.config.get('ENABLE_FEATURE', True)
```

## Example Plugin: Message Logger

Here's a complete example plugin that logs all incoming messages and sends a notification when a turn completes:

### plugin.json

```json
{
  "id": "message_logger",
  "name": "Message Logger",
  "version": "1.0.0",
  "description": "Logs all incoming messages and notifies on turn completion",
  "events": [
    "message_received",
    "turn_complete"
  ],
  "variables": [
    {
      "name": "WEBHOOK_URL",
      "type": "string",
      "description": "Webhook URL for notifications"
    },
    {
      "name": "MIN_COUNT",
      "type": "number",
      "description": "Minimum messages before logging"
    }
  ]
}
```

### handler.py

```python
def on_message_received(event, sdk):
    """Log every incoming message."""
    session_id = event.get('session_id', '')
    user_message = event.get('message', '')
    sdk.log(f"Received: session={session_id}, message={user_message}")

def on_turn_complete(event, sdk):
    """Send notification when a turn completes."""
    session_id = event.get('session_id', '')
    webhook_url = sdk.config.get('WEBHOOK_URL', '').strip()

    if not webhook_url:
        sdk.log("Skipped: no WEBHOOK_URL configured", level="warn")
        return

    sdk.http_request(
        method="POST",
        url=webhook_url,
        json={"session_id": session_id, "event": "turn_complete"}
    )
    sdk.log(f"Turn complete notification sent for session {session_id}")
```

## CLI Commands

### Install a Plugin

Install a plugin from a zip file or directory.

```bash
# Install from zip file
evonic plugin install ./my_plugin.zip

# Install from directory
evonic plugin install ./my_plugin/

# Force overwrite existing plugin
evonic plugin install ./my_plugin.zip --force
```

**Options:**

| Option | Description |
|--------|-------------|
| `path` | Path to zip file or directory (required) |
| `-f, --force` | Force overwrite existing plugin |

### Uninstall a Plugin

Remove a plugin from the platform.

```bash
evonic plugin uninstall my_plugin
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `plugin_id` | ID of the plugin to uninstall (required) |

### List Plugins

View all installed plugins with their status and events.

```bash
evonic plugin list
```

**Example Output:**

```
  ID             Name                     Version  Enabled  Events
  -------------  -----------------------  -------  -------  ------
  session-recap  Session Recap Extractor  1.0.0    No       1

  Total: 1 plugin(s)
```

### Get Plugin Info

View detailed information about a specific plugin, including configuration variables.

```bash
evonic plugin info session-recap
```

**Example Output:**

```
  Plugin ID    : session-recap
  Name         : Session Recap Extractor
  Version      : 1.0.0
  Description  : Parses native session summaries to extract actionable items (payment verification, human escalation, unresolved issues) and sends notifications
  Enabled      : False
  Events       : 1
    - summary_updated
  Variables    : 5
    - WEBHOOK_URL (string): Notification Webhook URL
    - NOTIFY_AGENT_ID (string): Notify via Agent ID
    - NOTIFY_CHANNEL_ID (string): Notify Channel Type or ID
    - NOTIFY_USER_ID (string): Admin User ID
    - MIN_MESSAGES (number): Min messages before analysis

  Configuration:
    WEBHOOK_URL =
    NOTIFY_AGENT_ID = krasan_admin
    NOTIFY_CHANNEL_ID = telegram
    NOTIFY_USER_ID = 76639539
    MIN_MESSAGES = 6
```

### Enable/Disable a Plugin

Control whether a plugin is active.

```bash
# Enable a plugin
evonic plugin enable session-recap

# Disable a plugin
evonic plugin disable session-recap
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `plugin_id` | ID of the plugin to enable/disable (required) |

### Reload a Plugin

Reload a plugin after making changes to its code.

```bash
evonic plugin reload session-recap
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `plugin_id` | ID of the plugin to reload (required) |

### View Plugin Logs

View logs for a specific plugin.

```bash
# View recent logs
evonic plugin logs session-recap

# View last 100 log entries
evonic plugin logs session-recap --limit 100
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `plugin_id` | ID of the plugin (required) |

**Options:**

| Option | Description |
|--------|-------------|
| `--limit LIMIT, -n LIMIT` | Number of log entries to show |

### Configure a Plugin

View or modify plugin configuration.

```bash
# Show current configuration
evonic plugin config session-recap

# Set configuration values
evonic plugin config session-recap --set WEBHOOK_URL https://hooks.example.com/notify
evonic plugin config session-recap --set MIN_MESSAGES 10
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `plugin_id` | ID of the plugin (required) |

**Options:**

| Option | Description |
|--------|-------------|
| `--set KEY [VALUE ...]` | Set configuration key=value pairs |

## Best Practices

### Event Handling

- Handle events gracefully with try/except blocks
- Don't return anything from handlers — the framework ignores return values
- Log important actions for debugging using `sdk.log()`
- Don't block on long-running operations — use `sdk.http_request()` with a short timeout

### Configuration

- Provide sensible defaults for all configuration variables
- Validate configuration values on load
- Use environment variables for sensitive data
- Document all configuration variables in `plugin.json`

### Logging

- Use `sdk.log()` for all logging — it adds plugin context automatically
- Include context in log messages (session_id, user_id, etc.)
- Use appropriate log levels (`info`, `warn`, `error`)
- Don't log sensitive data (API keys, passwords, PII)

### Error Handling

- Handle errors gracefully without crashing
- Log errors with context using `sdk.log(message, level="error")`
- Provide meaningful error messages
- Check return values from SDK methods (e.g. `sdk.send_message()`)

## Troubleshooting

### Plugin Not Triggering

**Problem:** Plugin doesn't respond to events.

**Solution:**
- Verify the plugin is enabled: `evonic plugin info <plugin_id>`
- Check that the event name matches in `plugin.json`
- Check plugin logs: `evonic plugin logs <plugin_id>`
- Verify the event is being emitted by the platform

### Configuration Not Applied

**Problem:** Plugin configuration changes don't take effect.

**Solution:**
- Reload the plugin: `evonic plugin reload <plugin_id>`
- Verify configuration was set correctly: `evonic plugin config <plugin_id>`
- Check for typos in configuration variable names
- Restart the Evonic server if needed

### Plugin Crashing

**Problem:** Plugin crashes or stops responding.

**Solution:**
- Check plugin logs: `evonic plugin logs <plugin_id>`
- Verify plugin code has no syntax errors
- Check for unhandled exceptions in event handlers
- Reload the plugin: `evonic plugin reload <plugin_id>`

### Logs Not Showing

**Problem:** Plugin logs are empty or not showing.

**Solution:**
- Check log level in plugin configuration
- Verify `sdk.log()` is being called in your handler
- Use `--limit` to see more entries: `evonic plugin logs <plugin_id> --limit 100`
- Check if the plugin is enabled
