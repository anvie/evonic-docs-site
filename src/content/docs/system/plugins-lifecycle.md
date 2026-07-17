---
title: Plugin Lifecycle System
description: Managing the initialization, runtime, and shutdown of platform plugins.
---

# Plugin Lifecycle System

Evonic v1.0.0 introduces a formalized **Plugin Lifecycle System**. Previously, plugins were loaded as simple event handlers; they now follow a strict set of lifecycle states to ensure stability, resource efficiency, and graceful failures.

## Lifecycle States

Every plugin now transitions through these four states:

### 1. Initialization (`init`)
Occurs when the platform first detects the plugin directory. 
- **Actions**: Validating `plugin.json`, registering event listeners, and establishing database connections.
- **Failure**: If `init` fails, the plugin is marked as `Errored` and will not be loaded into the runtime.

### 2. Activation (`activate`)
Occurs when the plugin is enabled in the agent settings or system configuration.
- **Actions**: Allocating buffers, starting background threads, and warming up caches.
- **Behavior**: This is where the plugin becomes "live" and begins responding to events.

### 3. Runtime (`active`)
The steady state where the plugin processes platform events.
- **Execution**: Handlers are executed asynchronously to prevent blocking the main agent runtime.
- **Monitoring**: The platform tracks the execution time of each handler; plugins that consistently exceed timeout limits are automatically throttled.

### 4. Deactivation (`deactivate`)
Occurs when a plugin is disabled or the system is shutting down.
- **Actions**: Closing open sockets, flushing pending logs, and releasing file locks.
- **Importance**: Ensures that no orphaned processes are left running in the background.

## Evaluator Expansion

As part of the lifecycle update, the **Evaluator** system has been expanded to be a "first-class citizen" of the plugin architecture.

### New Evaluator Capabilities:
- **Dynamic Prompt Testing**: Evaluators can now be triggered during the `activate` phase to verify that a plugin's accompanying prompts are still compatible with the current model version.
- **Cross-Session Metrics**: Evaluators can now aggregate data across multiple sessions to generate "Reliability Scores" for specific tools or plugins.
- **Automated Regression**: The system can now run a suite of "gold-standard" tests against a plugin update before it is fully activated in production.

## Plugin Manifest (`plugin.json`)

Every plugin must include a `plugin.json` manifest at its root. This is validated during the `init` phase:

```json
{
  "name": "my-custom-plugin",
  "version": "1.0.0",
  "description": "A custom Evonic plugin",
  "author": "your-name",
  "entry_point": "handler.py",
  "lifecycle": {
    "init": "on_init",
    "activate": "on_activate",
    "deactivate": "on_deactivate"
  },
  "permissions": ["db_read", "db_write", "network"],
  "dependencies": {
    "python": ">=3.10"
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique plugin identifier (snake_case) |
| `version` | Yes | Semantic version |
| `entry_point` | Yes | Python module for lifecycle handlers |
| `lifecycle` | No | Custom handler function names (defaults shown above) |
| `permissions` | No | Capabilities the plugin requests at runtime |
| `dependencies` | No | Runtime requirements |

## Database Layer

Plugins interact with the Evonic database through a dedicated **Plugin DB Layer** — a restricted ORM interface that provides safe, scoped access:

```python
from evonic.plugin_db import get_db

def on_activate(context):
    db = get_db()
    # Read-only access: query agent configs, sessions, channels
    agents = db.query("SELECT id, name FROM agents WHERE active = 1")

    # Write access (requires "db_write" permission): store plugin state
    db.execute(
        "INSERT INTO plugin_state (plugin, key, value) VALUES (?, ?, ?)",
        ("my-plugin", "last_run", "2026-07-17")
    )
```

### Database Permissions

| Permission | Allows |
|------------|--------|
| `db_read` | `SELECT` queries on agents, sessions, channels, and plugin tables |
| `db_write` | `INSERT`, `UPDATE`, `DELETE` on plugin-owned tables only |

The DB layer enforces table-level access control — a plugin with `db_write` can only modify rows in tables prefixed with `plugin_` or tables it explicitly owns.

## Flask Routes

Plugins can register custom HTTP endpoints via Flask blueprints. Routes are registered during the `init` phase:

```python
from flask import Blueprint, jsonify

def on_init(context):
    bp = Blueprint('my_plugin', __name__)

    @bp.route('/api/plugins/my-plugin/status')
    def status():
        return jsonify({"status": "ok", "uptime": "2h 15m"})

    context.register_blueprint(bp)
    return True
```

All plugin routes are automatically prefixed with `/api/plugins/<plugin-name>/` and are protected by the same authentication middleware as the rest of the Evonic API.

## Developer Implementation

To implement the lifecycle in your `handler.py`, use the following method signatures:

```python
def on_init(context):
    # Setup logic here
    return True

def on_activate(context):
    # Activation logic here
    return True

def on_deactivate(context):
    # Cleanup logic here
    return True
```

If a plugin fails to return `True` during `on_init` or `on_activate`, the platform will automatically trigger a `deactivate` call to clean up any partial allocations.
