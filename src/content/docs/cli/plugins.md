---
title: Plugin Management
description: Complete guide to managing plugins with the Evonic CLI.
---

# Plugin Management

Plugins are event-driven extensions that respond to platform events. They run automatically when triggered by events and can perform actions like sending notifications, processing data, or integrating with external services.

## Plugin Structure

A plugin is a directory or zip file containing:

```
my_plugin/
├── plugin.json         # Metadata and event definitions
├── setup.py            # Python package configuration
└── backend/
    └── plugin.py       # Plugin implementation
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
    "event_name"
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

## Commands

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

## Plugin Events

Plugins respond to platform events. Common events include:

| Event | Description |
|-------|-------------|
| `summary_updated` | Triggered when a session summary is updated |
| `message_sent` | Triggered when a message is sent to an agent |
| `message_received` | Triggered when a message is received from a user |
| `tool_executed` | Triggered when a tool is executed |
| `agent_created` | Triggered when a new agent is created |
| `agent_updated` | Triggered when an agent is updated |

## Creating Custom Plugins

### Step 1: Create Directory Structure

```bash
mkdir -p my_plugin/backend
```

### Step 2: Create plugin.json

```json
{
  "id": "my_plugin",
  "name": "My Custom Plugin",
  "version": "1.0.0",
  "description": "Plugin that logs all messages",
  "events": [
    "message_sent",
    "message_received"
  ],
  "variables": [
    {
      "name": "LOG_LEVEL",
      "type": "string",
      "description": "Logging level (INFO, DEBUG, ERROR)"
    }
  ]
}
```

### Step 3: Create Plugin Implementation

```python
# backend/plugin.py
import logging

logger = logging.getLogger(__name__)

def on_message_sent(event_data: dict) -> dict:
    """Handle message_sent events."""
    logger.info(f"Message sent: {event_data}")
    return {"status": "processed"}

def on_message_received(event_data: dict) -> dict:
    """Handle message_received events."""
    logger.info(f"Message received: {event_data}")
    return {"status": "processed"}
```

### Step 4: Create setup.py

```python
from setuptools import setup, find_packages

setup(
    name='my_plugin',
    version='1.0.0',
    packages=find_packages(),
)
```

### Step 5: Install and Enable the Plugin

```bash
evonic plugin install ./my_plugin/
evonic plugin enable my_plugin
```

## Configuration Variables

Plugins can define configuration variables that users can set. Variable types include:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text value | `"https://hooks.example.com"` |
| `number` | Numeric value | `10` |
| `boolean` | True/false value | `true` |
| `array` | List of values | `["value1", "value2"]` |

### Setting Configuration

```bash
# Set a string value
evonic plugin config my_plugin --set CONFIG_KEY "my value"

# Set a numeric value
evonic plugin config my_plugin --set MIN_COUNT 10

# Set a boolean value
evonic plugin config my_plugin --set ENABLE_FEATURE true
```

## Best Practices

### Event Handling

- Handle events gracefully with try/except blocks
- Return structured results (dict) from event handlers
- Log important actions for debugging
- Don't block on long-running operations

### Configuration

- Provide sensible defaults for all configuration variables
- Validate configuration values on load
- Use environment variables for sensitive data
- Document all configuration variables

### Logging

- Use the standard logging module
- Include context in log messages
- Use appropriate log levels (INFO, DEBUG, ERROR)
- Don't log sensitive data (API keys, passwords)

### Error Handling

- Handle errors gracefully without crashing
- Return error details in the result dict
- Log errors with context
- Provide meaningful error messages

## Troubleshooting

### Plugin Not Triggering

**Problem:** Plugin doesn't respond to events.

**Solution:**
- Verify the plugin is enabled: `evonic plugin info <plugin_id>`
- Check that the event name matches in plugin.json
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
- Verify logging is configured in plugin code
- Use `--limit` to see more entries: `evonic plugin logs <plugin_id> --limit 100`
- Check if the plugin is enabled
