---
title: Plugins
description: Plugin system — event-driven extensions for the Evonic platform.
sidebar:
  order: 4
---

Plugins are event-driven extensions that respond to platform events. They run automatically when triggered by events and can perform actions like sending notifications, processing data, or integrating with external services.

## How Plugins Fit In

```
Platform Event (message_received, turn_complete, etc.)
    ↓
Event Stream (pub/sub bus)
    ↓
Plugin System
    ├── Plugin A — on_message_received()
    ├── Plugin B — on_turn_complete()
    └── Plugin C — on_message_sent()
```

## Plugin Structure

A plugin is a directory under `plugins/` containing:

```
my_plugin/
    ├── plugin.json    # Manifest: metadata, events, variables
    └── handler.py     # Event handler functions
```

Plugins can also extend the platform with **Flask routes** (web pages and API endpoints) by providing a `routes.py` file with a `create_blueprint()` function.

## Learn More

- [Plugins — Full Reference](/plugins) — complete documentation with structure, handler functions, and examples
- [Events](/system/events) — all supported platform events
- [Plugin SDK](/plugins/sdk) — available SDK methods
- [Best Practices](/plugins/best-practices)
- [Troubleshooting](/plugins/troubleshooting)
