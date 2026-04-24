---
title: Skillsets
description: Pre-configured agent templates for instant setup with tools, prompts, and skills.
sidebar:
  order: 8
---

## What is a Skillset

A **skillset** is a pre-configured template that bundles everything needed to create a ready-to-use agent in one step: system prompt, tool assignments, skills, and even model selection. Think of it as a preset or blueprint — instead of manually configuring an agent from scratch, you apply a skillset and get a fully functional agent instantly.

Skillsets are stored as JSON files in the `skillsets/` directory at the project root.

## How It Works

When you apply a skillset, the platform performs the following steps automatically:

1. Loads the skillset template by its ID.
2. Creates a new agent with the configured system prompt and description.
3. Assigns all tools listed in the template.
4. Enables any skills defined in the template.
5. Sets the model if specified.
6. Returns the newly created agent.

The result is an agent that is immediately ready to process messages — no manual configuration needed.

## Available Skillsets

The platform ships with the following built-in skillsets:

### coder

**General-purpose coding agent** for building, debugging, and refactoring software across multiple languages and frameworks.

| Field | Value |
|-------|-------|
| **Tools** | `read_file`, `write_file`, `str_replace`, `patch`, `bash`, `runpy`, `calculator` (7 tools) |
| **Skills** | None |

### data_analyst

**Data analysis agent** for statistical analysis, data processing, visualization, and reporting using Python.

| Field | Value |
|-------|-------|
| **Tools** | `bash`, `read_file`, `write_file`, `runpy`, `calculator` (5 tools) |
| **Skills** | None |

### devops

**DevOps and infrastructure agent** for managing CI/CD pipelines, containers, cloud resources, and system automation.

| Field | Value |
|-------|-------|
| **Tools** | `bash`, `read_file`, `write_file`, `str_replace`, `patch`, `runpy`, `calculator`, `sshc` (8 tools) |
| **Skills** | None |

### pentester

**Penetration testing agent** for security assessment, vulnerability scanning, and exploitation analysis.

| Field | Value |
|-------|-------|
| **Tools** | `bash`, `read_file`, `write_file`, `runpy`, `calculator` (5 tools) |
| **Skills** | None |

### reverse_engineer

**Reverse engineering agent** for binary analysis, malware research, and software reverse engineering.

| Field | Value |
|-------|-------|
| **Tools** | `bash`, `read_file`, `write_file`, `runpy`, `calculator` (5 tools) |
| **Skills** | None |

### sysadmin

**System administration agent** for server management, monitoring, user administration, and troubleshooting.

| Field | Value |
|-------|-------|
| **Tools** | `bash`, `read_file`, `write_file`, `str_replace`, `patch`, `runpy`, `calculator`, `sshc` (8 tools) |
| **Skills** | None |

## How to Use

### Via API — `apply_skillset`

The primary way to create an agent from a skillset is through the `apply_skillset` platform function. This can be called by the super agent or via the API.

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `skill_id` | Yes | The skillset template ID (e.g., `"coder"`, `"devops"`) |
| `agent_id` | Yes | Unique ID for the new agent (alphanumeric and underscores only) |
| `name` | No | Display name for the agent (uses skillset default if omitted) |
| `description` | No | Description for the agent (uses skillset default if omitted) |
| `model` | No | Optional model override (uses skillset default if omitted) |

**Example — Creating a coder agent:**

```python
# Create a coding agent from the "coder" skillset
apply_skillset(
    skill_id="coder",
    agent_id="my_coder",
    name="My Coder Agent"
)
```

After this call, an agent named "My Coder Agent" with ID `my_coder` is created with all 7 coding tools already assigned and the coder system prompt configured.

### Via Web UI

1. Navigate to the agent management page.
2. Click **Create from Skillset** (or similar option).
3. Select a skillset template from the list.
4. Provide an agent ID and optional name.
5. The agent is created instantly with all configuration applied.

### Via CLI

List available skillsets:

```bash
python3 manage_skillset.py list
```

Create an agent from a skillset:

```bash
python3 manage_skillset.py apply --skill coder --agent-id my_coder
```

## Skillset JSON Format

Each skillset is defined as a JSON file in the `skillsets/` directory:

```json
{
  "id": "coder",
  "name": "Coder",
  "description": "General-purpose coding agent for building, debugging, and refactoring software.",
  "system_prompt": "You are a skilled software developer. You write clean, well-documented code, debug issues efficiently, and follow best practices.",
  "model": "",
  "tools": [
    "read_file",
    "write_file",
    "str_replace",
    "patch",
    "bash",
    "runpy",
    "calculator"
  ],
  "skills": [],
  "kb_files": {}
}
```

| Field | Description |
|-------|-------------|
| `id` | Unique skillset identifier |
| `name` | Display name |
| `description` | Short description of the agent's purpose |
| `system_prompt` | Full system prompt/persona for the agent |
| `model` | Optional model override (empty string uses platform default) |
| `tools` | List of tool IDs to assign |
| `skills` | List of skill IDs to enable |
| `kb_files` | Knowledge base files to include |

## Creating Custom Skillsets

To create your own skillset template:

1. Create a JSON file in the `skillsets/` directory (e.g., `skillsets/my_template.json`).
2. Define the agent configuration using the format above.
3. The new skillset becomes available immediately for use with `apply_skillset`.

Example custom skillset for a customer support agent:

```json
{
  "id": "support_agent",
  "name": "Support Agent",
  "description": "Customer support agent for handling inquiries and ticket management.",
  "system_prompt": "You are a helpful customer support agent. Always be polite, empathetic, and solution-oriented.",
  "model": "",
  "tools": ["read_file", "bash", "runpy"],
  "skills": ["ticket_management"],
  "kb_files": {}
}
```
