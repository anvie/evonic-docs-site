---
title: Skillset Management
description: CLI commands for managing Evonic skillset templates.
---

Skillsets are pre-configured agent templates that define tools, skills, system prompts, and KB files. Commands for listing, inspecting, and applying skillset templates.

## `evonic skillset list`

List all available skillset templates.

```bash
evonic skillset list
```

**Output:**

```
ID                Name                  Description                                                                                                               Tools  Skills
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
coder             Coder                 General-purpose coding agent for building, debugging, and refactoring software...       7       0
data_analyst      Data Analyst          Data analysis agent for statistical analysis, data processing, visualization...         7       1
devops            DevOps Engineer       DevOps and infrastructure agent for managing CI/CD pipelines...                       8       0
pentester         Penetration Tester    Penetration testing agent for security assessment...                                 5       0
sysadmin          System Administrator  System administration agent for server management...                                  8       0
```

## `evonic skillset get <skillset_id>`

Show detailed information about a specific skillset template.

```bash
evonic skillset get coder
```

**Output:**

```
ID:          coder
Name:        Coder
Description: General-purpose coding agent for building, debugging, and refactoring software.
Model:       (default)

System Prompt: You are a skilled software developer. You write clean, well-documented code...

Tools (7):
  - read_file
  - write_file
  - str_replace
  - patch
  - bash
  - runpy
  - calculator

Skills (0):
```

## `evonic skillset apply <skillset_id>`

Create a new agent from a skillset template.

```bash
evonic skillset apply <skillset_id> --agent-id <id> [--name <name>] [--description <desc>] [--model <model>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--agent-id` | Yes | Agent ID for the new agent |
| `--name` | No | Display name (default: from skillset) |
| `--description` | No | Description (default: from skillset) |
| `--model` | No | Model override |

**Example:**

```bash
evonic skillset apply coder --agent-id my_coder --name "My Coder Agent"
```

**Output:**

```
Agent created: My Coder Agent (my_coder) from skillset 'coder'
```

## Next Steps

- [Agent Management](/cli/agents)
- [Model Management](/cli/models)
