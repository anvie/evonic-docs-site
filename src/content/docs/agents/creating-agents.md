---
title: Creating Agents
description: How to create and configure agents with system prompts.
sidebar:
  order: 2
---

Agents are the core building blocks of Evonic. Each agent is an independently configured LLM-powered assistant that can reason, plan, and take actions.

## Super Agent

When you first set up Evonic, **the very first agent you create is automatically designated as the Super Agent**. This isn't optional — the platform requires a Super Agent to bootstrap itself.

### What Makes It "Super"?

The Super Agent is the **platform administrator**. It has elevated privileges that regular agents don't:

| Privilege | Super Agent | Regular Agent |
|---|---|---|
| Can be disabled? | ❌ No | ✅ Yes |
| Apply skillsets to create new agents | ✅ Yes | ❌ No |
| Create tasks on Kanban (`create_task_super_only`) | ✅ Yes | ❌ No |
| Bypass super-agent setup checks (update endpoint) | ✅ Yes | ❌ No |

### Role & Responsibilities

Think of the Super Agent as your **AI platform manager**. Its job is:

- **Orchestrate other agents**: Create, configure, and manage specialized agents for different tasks
- **Apply skillsets**: Use pre-built templates to spin up new agents with the right tools and prompts
- **Oversee workflows**: Manage Kanban boards and coordinate multi-agent operations
- **Self-update the platform**: Has special access to the update system to keep Evonic current

### How to Identify the Super Agent

In the CLI, the Super Agent shows `Super: yes`:

```bash
evonic agent get siwa
# Output:
# ID:          siwa
# Name:        Siwa Miwa
# Description: Super agent
# Status:      enabled
# Super:       yes        ← this is the Super Agent
```

## Creating an Agent

### Via the Web UI

1. Go to `/agents`
2. Click **+ New Agent**
3. Fill in:
   - **Agent ID**: slug format, alphanumeric + underscores only (e.g., `bookstore_bot`)
   - **Name**: display name (e.g., "Bookstore Assistant")
   - **Description**: short description
4. Click **Create**: you'll be redirected to the agent's config page

### Via the API

```bash
curl -X POST http://localhost:8080/api/agents \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "bookstore_bot",
    "name": "Bookstore Assistant",
    "description": "Book recommendation assistant for a local bookstore"
  }'
```

### Via CLI

```bash
# Basic agent
evonic agent add my_bot --name "My Bot"

# Agent with description
evonic agent add bookstore_bot --name "Bookstore Assistant" --description "Book recommendation assistant"

# Agent with a specific model
evonic agent add research_bot --name "Research Bot" --model gpt-4

# Agent from a skillset template
evonic agent add dev_bot --name "Dev Bot" --skillset coder --description "Coding assistant"
```

**Options:**

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | Yes | Display name for the agent |
| `--description` | No | Short description |
| `--model` | No | Model override |
| `--skillset` | No | Skillset template ID (pre-configures tools & prompt) |

## Listing Agents

View all agents with their status, tool count, and channel count:

```bash
evonic agent list
```

**Output:**

```
ID        Name         Status   Tools  Channels
-------------------------------------------------
siwa      Siwa Miwa    enabled     10         1
claimg    ClaimGuard   enabled      7         0
```

## Getting Agent Details

View detailed information about a specific agent:

```bash
evonic agent get bookstore_bot
```

**Output:**

```
ID:          bookstore_bot
Name:        Bookstore Assistant
Description: Book recommendation assistant for a local bookstore
Status:      enabled
Super:       no
Model:       moonshotai/kimi-k2-thinking

System Prompt: You are a book recommendation assistant...

Tools (10):
  - bash
  - calculator
  - patch
  ...

Channels (1):
  - Mirai
```

## Default Agent Capabilities

New agents come with several capabilities enabled by default:

| Capability | Description |
|---|---|
| **Vision** (`vision_enabled`) | Agent can process images sent through supported channels (e.g., Telegram) |
| **Agent ID Injection** (`inject_agent_id`) | The agent's own ID is injected into its system prompt so it knows its identity |
| **Date/Time Injection** (`inject_datetime`) | Current date and time are injected into the system prompt each turn |
| **Intermediate Responses** (`send_intermediate_responses`) | Tool results and intermediate steps are sent as visible messages to the user in real-time |
| **Agent State** (`enable_agent_state`) | Plan/Execute mode system is active; state persists across conversation turns and summarization |

These capabilities can be toggled per-agent in the **General** tab.

## Agent Configuration

The agent detail page (`/agents/<id>`) has five tabs:

### General Tab

| Field | Description |
|---|---|
| **Name** | Display name |
| **Description** | Short description |
| **Model Override** | Use a different model than the default (leave empty for default) |
| **System Prompt** | The agent's persona and instructions |
| **Workspace Directory** | Custom filesystem directory for the agent's file operations (optional, defaults to `agents/<agent_id>/workspace/`) |
| **Timeout Retries** | Number of times to retry the LLM call if it times out (default: 1) |

The system prompt defines who the agent is and how it behaves. Example:

```
You are a book recommendation assistant for a local bookstore.

Always respond in English. Be friendly and professional.

## POPULAR BOOKS
| Title | Author | Price |
| The Great Gatsby | F. Scott Fitzgerald | $12.99 |
| To Kill a Mockingbird | Harper Lee | $14.99 |
```

### Model Selection

You can override the default model for a specific agent. This is useful when you want different agents to use different models based on their requirements:

```
# In the Model Override field:
llama3.2:3b
```

Or use a remote model:

```
# For cloud models:
meta-llama/Llama-3-8b-Instruct
```

### Workspace Directory

Each agent has a **workspace directory** for file operations. By default, this is `agents/<agent_id>/workspace/`. You can customize it in the General tab to point to any directory on the filesystem.

The workspace provides an isolated context for tools like `runpy`, `bash`, `write_file`, and `patch`. All file paths in these tools are resolved relative to the workspace directory.

### Agent State

Agents operate in one of two modes: **Plan** or **Execute**. This state is persisted across conversation turns and survives LLM context summarization.

- **Plan mode**: The agent generates plans and reasoning before executing. This is the default mode when a new session starts.
- **Execute mode**: The agent executes actions directly.

The agent state is managed automatically by the runtime. See [Agent State](/agents/agent-state) for details.

### Knowledge Tab

Upload `.md` files that the agent can read during conversations. See [Knowledge Base](/agents/knowledge-base).

### Tools Tab

Assign tools from the registry that the agent can invoke. See [Tools](/agents/tools).

### Channels Tab

Connect external messaging platforms. See [Channels](/agents/channels).

### Chat Tab

Chat directly with the agent from the browser to test its behavior before deploying to external channels. The chat interface supports:

- **Stop button**: Interrupt the agent while it's processing
- **Thinking timeline**: Visual timeline showing the agent's reasoning process
- **Tab persistence**: Your active tab is remembered across page refreshes (via URL hash)
- **Mobile layout**: Responsive design for mobile devices

## Safety Checker Toggle

Each agent has a **safety checker** that reviews tool calls (such as `bash` and `runpy`) before execution. This is enabled by default (`safety_checker_enabled = 1`).

You can disable the safety checker per agent to enable **full autopilot mode**, where the agent executes tools without requiring user approval for each call.

| Setting | Value | Behavior |
|---|---|---|
| Enabled (default) | `1` | Potentially dangerous tool calls trigger a user approval gate |
| Disabled | `0` | Tools execute directly: full autopilot without intervention |

:::caution[Warning]
Disabling the safety checker means the agent will execute code and system commands without any approval gate. Only disable this for agents you fully trust.
:::

## Enabling and Disabling Agents

### Enable an Agent

```bash
evonic agent enable my_bot
```

### Disable an Agent

```bash
evonic agent disable my_bot
```

Disabling an agent prevents it from processing new messages. Super agents cannot be disabled.

## Deleting an Agent

Permanently remove an agent. Requires interactive confirmation:

```bash
evonic agent remove my_bot
```

**Output:**

```
Agent to remove:
  ID:        my_bot
  Name:      My Bot
  Status:    enabled
Are you sure? [y/N]: y
Agent removed: my_bot
```

Deleting an agent removes its database records, all channel configurations, chat sessions, and the KB directory on disk.

## Updating an Agent

Update an agent's configuration via the API:

```bash
curl -X PUT http://localhost:8080/api/agents/bookstore_bot \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Bookstore Bot",
    "system_prompt": "Updated system prompt here..."
  }'
```

## Agent ID Rules

- Alphanumeric characters and underscores only: `^[a-zA-Z0-9_]+$`
- No spaces, hyphens, or special characters
- Must be unique
- Used as the filesystem directory name (`agents/<id>/kb/`)
- Cannot be changed after creation
