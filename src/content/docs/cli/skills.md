---
title: Skill Management
description: CLI commands for managing Evonic skills.
---

Skills are self-contained tool packages that extend agent capabilities. The CLI provides commands for listing, installing, inspecting, and removing skills.

## `evonic skill list`

List all installed skills with their status and tool count.

```bash
evonic skill list
```

**Output:**

```
ID            Name                  Version  Status   Tools
-------------------------------------------------------------
hello_world   Hello World           1.0.0    enabled      1
kanban_agent  Kanban Agent          1.0.0    enabled      4
```

## `evonic skill add <source>`

Install a skill from a local path, zip file, or GitHub URL.

```bash
evonic skill add <source>
```

| Source Type | Description |
|-------------|-------------|
| Local path | Path to a skill directory (e.g. `./my-skill/`) |
| Zip file | Path to a `.zip` file (e.g. `./my-skill.zip`) |
| GitHub URL | Repository URL (e.g. `https://github.com/user/repo`) |

**Example:**

```bash
# Install from local directory
evonic skill add ./my-skill/

# Install from zip file
evonic skill add ./my-skill.zip

# Install from GitHub
evonic skill add https://github.com/user/my-skill
```

**Output:**

```
Skill installed: My Skill (my_skill) v1.0.0
```

## `evonic skill get <skill_id>`

Show detailed information about a specific skill.

```bash
evonic skill get hello_world
```

**Output:**

```
ID:        hello_world
Name:      Hello World
Version:   1.0.0
Status:    enabled
Description: Simple demo skill

Tools (1):
  - hello
    Say hello

Variables (0):
```

## `evonic skill rm <skill_id>`

Uninstall a skill by its ID. Built-in/core skills cannot be removed.

```bash
evonic skill rm my_skill
```

**Output:**

```
Skill uninstalled: my_skill
```

## Next Steps

- [Skillset Management](/cli/skillsets)
- [Agent Management](/cli/agents)
