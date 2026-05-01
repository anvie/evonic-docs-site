---
title: Overview
description: Introduction to the Evonic plugin system: create, manage, and extend Evonic with custom plugins.
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

Plugins can also extend the platform with **Flask routes** (web pages and API endpoints) by providing a `routes.py` file with a `create_blueprint()` function. See [Route Registration](/docs/cli/route-registration) for a complete guide.

```
my_plugin/
├── plugin.json    # Manifest: metadata, events, variables, routes
├── handler.py     # Event handler functions
├── routes.py      # Flask route handlers (optional)
└── templates/     # Jinja2 templates (optional)
    └── page.html
```

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

Each event in the `events` array maps to a handler function named `on_<event_name>` in `handler.py`. See [Events](/system/events) for a list of all supported events. The handler signature is:

```python
def on_<event_name>(event: dict, sdk: PluginSDK) -> None:
    """Handle <event_name> events."""
    # Your logic here
```

- **`event`**: a dict containing event-specific data (e.g. `session_id`, `message`, `summary`, etc.)
- **`sdk`**: a `PluginSDK` instance providing helper methods (see [Plugin SDK](/plugins/sdk))
- **Return value**: handlers should not return anything. The framework ignores return values.

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

### Configuration Variables

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

### Example Plugin: Message Logger

Here's a complete example plugin that logs all incoming messages and sends a notification when a turn completes:

#### plugin.json

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

#### handler.py

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

## Quick Links

- [Plugin SDK](/plugins/sdk): Available methods and helpers
- [Events](/system/events): All supported events
- [Setup](/plugins/setup): Install, configure, and manage plugins
- [Best Practices](/plugins/best-practices): Tips for writing great plugins
- [Troubleshooting](/plugins/troubleshooting): Common issues and fixes
