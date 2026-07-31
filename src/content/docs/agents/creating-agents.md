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
| `assign_skills` / `unassign_skill` tools | ✅ Yes | ❌ No |
| Delete other agents' memories (`forget_memory`) | ✅ Yes | ❌ No |

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
| `--model-fallback` | No | Fallback model chain (comma-separated) |
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

### API Format

*Introduced in v0.7.0.*

When configuring a model, you can choose the **API format** the LLM client uses to communicate with the model provider. This is available as a dropdown in the model settings (`/system/models`):

| Format | Description |
|--------|-------------|
| **OpenAI** | Standard OpenAI-compatible API format (default for most providers) |
| **Anthropic** | Anthropic's native API format (for Claude models via Anthropic-compatible endpoints) |

The API format dropdown lets you connect **Claude and other Anthropic-compatible models natively** without needing a proxy or translation layer. The LLM client automatically handles the format translation when set to Anthropic.

This is configured **per-model** (not per-agent) — when you create or edit a model, the API format dropdown appears alongside the provider, base URL, and API key fields.

See [Models](/system/models) for full configuration details.

### Model Fallback

*Introduced in v0.5.0. Sticky behavior added in v0.6.78.*

You can configure a **fallback chain** of models in case the primary model fails. The agent automatically retries with the next model in the chain if the primary model times out or returns an error.

Configure fallbacks in the **Model Fallback** field, comma-separated:

```
gpt-4, gpt-4-mini, llama3.2:3b
```

**Behavior:**
- Each model in the chain is tried in order (1 retry per model)
- **Sticky fallback** (v0.6.78+) — once a fallback model is activated, it stays active until manually reset for more predictable behavior
- To reset back to the primary model, use the `reset_active_model` tool
- A badge in the UI shows which fallback model is currently active
- If all models in the chain fail, the agent returns a timeout error

#### Global Default Model Fallback

*Introduced in v1.1.0.*

In addition to per-agent model fallback chains, you can now set a **global default fallback model** that applies across all agents. Configure the `default_model_fallback_id` setting to define a platform-wide backup model.

**Behavior:**
- When an agent's primary model times out or returns a transient error, and the agent has no fallback chain configured, the global fallback is used
- The `/model` slash command output is now fallback-aware — it displays both the active model and any fallback that is currently engaged
- `describe_image` (vision tool) also falls back on rate limits and transient errors, using the global fallback when no per-agent vision fallback is set

**Also new in v1.1.0:** You can now configure a dedicated **Evaluation Model** setting (#732) for the evaluator pipeline, separate from the agent's main model.

### Workspace Directory

Each agent has a **workspace directory** for file operations. By default, this is `agents/<agent_id>/workspace/`. You can customize it in the General tab to point to any directory on the filesystem.

The workspace provides an isolated context for tools like `runpy`, `bash`, `write_file`, and `patch`. All file paths in these tools are resolved relative to the workspace directory.

### Agent State

Agents operate in one of two modes: **Plan** or **Execute**. This state is persisted across conversation turns and survives LLM context summarization.

- **Plan mode**: The agent generates plans and reasoning before executing. This is the default mode when a new session starts.
- **Execute mode**: The agent executes actions directly.

The agent state is managed automatically by the runtime. See [Agent State](/agents/agent-state) for details.

### Slash Command Controls

*Introduced in v1.1.0.*

You can control which slash commands are available to each agent using two new fields in the **Settings** tab (#728):

| Setting | Description |
|---------|-------------|
| `hidden_slash_commands` | Commands hidden from `/help` output and autocomplete, but still executable |
| `disabled_slash_commands` | Commands completely blocked — attempting to use them returns an error |

**Use Cases:**
- **Hide advanced commands** from simple agents (e.g., hide `/restart` from non-admin agents)
- **Disable dangerous commands** for tightly-scoped agents (e.g., disable `/sub` to prevent sub-agent spawning)
- **Simplify the command palette** for agents used by non-technical users

Configure these as comma-separated lists in the agent's Settings tab. Changes take effect immediately — no restart required.

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

## Run-As-User Isolation

*Introduced in v0.7.0.*

Each agent can be configured to run its `bash` and `runpy` tools under a **specific Linux user** on the host system. This adds an extra layer of OS-level isolation: even if an agent escapes its sandbox, it operates under a restricted user account rather than the Evonic server process owner.

### Configuration

Set the run-as-user in the agent's **General** tab or via the API/CLI:

| Method | Configuration |
|--------|---------------|
| **Web UI** | Enter the Linux username in the **Run As User** field in the agent's General tab |
| **API** | Set `"run_as_user": "username"` in the agent configuration payload |

### Behavior

- When `run_as_user` is set, all `bash` and `runpy` commands execute under that user's identity
- Environment variables are preserved across `sudo` boundaries (`sudo -E` behavior)
- The user must exist on the host system before the agent can use it
- If the user does not exist, the tool returns a clear error

### Use Cases

- **Multi-tenant deployments**: Each agent runs under a dedicated user, preventing file access across agent boundaries
- **Compliance**: Meet audit requirements by tying agent actions to specific OS accounts
- **Limited permissions**: Create restricted Linux users with only the permissions an agent needs


## Sub-Agent Settings

*Introduced in v0.8.0.*

When creating or configuring an agent, two new advanced settings control sub-agent behavior:

| Setting | Description |
|---------|-------------|
| `inter_agent_clear_context` | Whether the agent's context is cleared between inter-agent messages. When enabled (default), each inter-agent turn starts with a fresh context, preventing message history from accumulating across delegation calls. |
| `builtin_tools_enabled` | Whether built-in tools (read, write_file, patch, str_replace, etc.) are available. When enabled (default), the agent inherits the full set of built-in tools. When disabled, only explicitly assigned tools and skills are available. |

### Configuration

Configure these settings in the agent's **Advanced** settings panel, accessible from the agent detail page.

### Use Cases

- **`inter_agent_clear_context` disabled**: Useful for sub-agents that need conversation continuity across multiple delegation rounds
- **`builtin_tools_enabled` disabled**: Useful for tightly-scoped agents that should only use specific tools (e.g., a calculator agent that doesn't need file system access)

See [Sub-Agents](/agents/sub-agents) for the full sub-agent system documentation.


### Super Agent Skill Assignment

*Introduced in v1.1.0.*

The Super Agent can now selectively assign individual skills to itself (#739). Previously, the Super Agent bypassed authorization checks for all skill operations, which was too broad. With v1.1.0, the assignment model is more granular:

- Super Agents can assign **specific skills** rather than receiving blanket authorization
- A database migration (section 10b) tracks which skills have been approved for the Super Agent
- Skill reviews now respect individual assignment decisions

This change aligns with Evonic's security-first design philosophy — no agent, not even the Super Agent, gets unrestricted access by default.

## Agent JSON Export/Import

*Introduced in v1.1.0.*

Agents can now be exported and imported as JSON files, enabling full agent portability:

```bash
# Export an agent
evonic agent export bookstore_bot --output bookstore_bot.json

# Import an agent
evonic agent import bookstore_bot.json
```

**What gets exported:**
- Agent ID, name, description
- System prompt
- Model configuration (model, fallback chain, API format)
- Tool assignments
- Skill assignments
- Channel configuration
- All settings from the General, Tools, and Settings tabs

**Validation:** Imported JSON files are validated against the current schema before creation. If the schema has changed between export and import, you'll get clear error messages indicating which fields need adjustment.

This is ideal for:
- **Backing up** agent configurations before major changes
- **Migrating** agents between Evonic instances (dev → staging → production)
- **Sharing** agent templates with your team
- **Version-controlling** agent configurations alongside your codebase

## Cloning an Agent

*Introduced in v0.2.0.*

Instead of configuring a new agent from scratch, you can **clone an existing agent** to create a copy with the same configuration. This is useful when you want to:

- Create multiple agents with similar settings
- Duplicate an agent as a template for a new role
- Experiment with config changes without modifying the original

### Via Web UI

1. Go to `/agents`
2. Find the agent you want to clone
3. Click the **Clone** button (or use the dropdown menu)
4. Enter a new **Agent ID** and **Name** for the clone
5. Click **Clone** — all settings (tools, skills, channels, system prompt) are copied

### Via CLI

```bash
evonic agent clone <source_agent_id> --id <new_agent_id> --name "New Agent Name"
```

**Example:**

```bash
evonic agent clone bookstore_bot --id bookstore_bot_staging --name "Bookstore Bot (Staging)"
```

**What gets copied:**

| Setting | Copied? | Notes |
|---------|---------|-------|
| System prompt | ✅ Yes | Exact copy |
| Tool assignments | ✅ Yes | Same tools enabled |
| Skill assignments | ✅ Yes | Same skills enabled |
| Channel connections | ✅ Yes | But the clone still needs to be added to channel allowlists |
| Safety checker setting | ✅ Yes | Preserved as-is |
| Model override | ✅ Yes | Preserved as-is |
| Workspace directory | ✅ Yes | Preserved as-is |
| Chat history | ❌ No | Starts fresh |
| Agent state | ❌ No | Starts fresh |

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
