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
