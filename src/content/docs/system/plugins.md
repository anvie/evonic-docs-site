---
title: Plugins
description: "Plugin system: event-driven extensions for the Evonic platform."
sidebar:
  order: 4
---

Plugins are event-driven extensions that respond to platform events (like `message_received`, `turn_complete`, or `message_sent`). They run automatically when triggered and can send notifications, process data, or integrate with external services. A plugin is a directory under `plugins/` containing a manifest (`plugin.json`) and a handler (`handler.py`), with optional Flask routes via `routes.py`.

For complete documentation: [Plugins: Full Reference](/plugins), [Events](/system/events), [Plugin SDK](/plugins/sdk), [Best Practices](/plugins/best-practices), and [Troubleshooting](/plugins/troubleshooting).
