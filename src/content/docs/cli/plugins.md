---
title: Plugin Management
description: CLI commands for managing Evonic plugins.
---

Plugins are event-driven extensions that respond to platform events. Commands for listing, installing, and uninstalling plugins.

## `evonic plugin list`

List all installed plugins.

```bash
evonic plugin list
```

**Output:**

```
ID             Name             Version  Status   Events
----------------------------------------------------------
kanban         Kanban           1.0.0    enabled       3
session-recap  Session Recap    1.0.0    enabled       1
```

## `evonic plugin install <source>`

Install a plugin from a zip file or directory.

```bash
evonic plugin install <source>
```

**Example:**

```bash
# Install from zip file
evonic plugin install ./my-plugin.zip

# Install from directory
evonic plugin install ./my-plugin/
```

**Output:**

```
Plugin installed: My Plugin (my_plugin) v1.0.0
```

## `evonic plugin uninstall <plugin_id>`

Uninstall a plugin by its ID. System plugins cannot be uninstalled.

```bash
evonic plugin uninstall my_plugin
```

**Output:**

```
Plugin uninstalled: my_plugin
```

## Next Steps

- [Server Management](/cli/server)
- [Overview](/cli)
