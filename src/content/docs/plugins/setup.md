---
title: Setup
description: Install, configure, enable, and manage plugins via CLI.
---

This guide covers installing, configuring, and managing plugins through the Evonic CLI and web UI.

## Install a Plugin

Install a plugin from a zip file or directory.

### Via CLI

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

### Via Web UI

Navigate to the plugin management page and upload your plugin zip file.

## Uninstall a Plugin

Remove a plugin from the platform.

```bash
evonic plugin uninstall my_plugin
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `plugin_id` | ID of the plugin to uninstall (required) |

## List Plugins

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

## Get Plugin Info

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

## Enable/Disable a Plugin

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

## Reload a Plugin

Reload a plugin after making changes to its code.

```bash
evonic plugin reload session-recap
```

**Arguments:**

| Argument | Description |
|----------|-------------|
| `plugin_id` | ID of the plugin to reload (required) |

## View Plugin Logs

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

## Configure a Plugin

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
