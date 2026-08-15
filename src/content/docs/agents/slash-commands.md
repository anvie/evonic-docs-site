---
title: Slash Commands
description: Quick actions for agents via slash commands including /clear, /help, /summary, /status, and more.
sidebar:
  order: 6
---

## Overview

Agents support **slash commands** for quick actions. These work in both the web chat and Telegram channel. Commands are recognized by messages starting with `/`.

## Built-in Commands

### `/clear`

Clears the current conversation history for the active session. In v1.0.0, this command automatically archives the session to the secure `session_archive.db` before deletion, preventing accidental data loss.

**Behavior:**
- Archives current session state to `session_archive.db`
- Deletes all messages from the current session
- Resets the session summary
- Truncates the agent's `llm.log` and `sessrecap.log` files
- Resets agent state to fresh plan mode
- Emits a `session_clear` event
- The agent responds with a confirmation message

**Example:**
```
/clear
> History cleared.
```

---

### `/clear-memory`

*Introduced in v0.6.91.*

Clears the agent's long-term memories. This removes all stored facts, preferences, and remembered information that the agent has accumulated across sessions.

**Behavior:**
- Deletes all memories stored via `remember()` or the Message Wrapper Protocol
- Each memory is soft-deleted (marked as expired) so it won't appear in future `recall()` results
- The agent responds with a confirmation of how many memories were cleared

**Example:**
```
/clear-memory
> Cleared 12 memories.
```

**Note:** This only affects the agent's long-term memory, not the current conversation history. To clear the conversation history, use `/clear` instead.

---

### `/help`

Displays a list of available slash commands with brief descriptions. Certain commands (e.g. `/restart`) are hidden from non-super agents.

**Response format:**
```
Available commands:
- /clear — Clear chat history for this session
- /help — Show available commands
- /summary — Force regenerate session summary
```

---

### `/summary`

Triggers conversation summarization for the current session. This compresses the conversation history into a concise summary, freeing up context space for the LLM.

**Behavior:**
- Runs the summarization algorithm on the current session
- Replaces the full message history with a summary
- The agent responds with a confirmation

**Example:**
```
/summary
> Session summary has been regenerated.
```

---

### `/stop`

Stops the agent's current processing loop immediately. Use this when the agent is stuck in a long-running response or you want to cancel an ongoing operation.

**Behavior:**
- Sends a stop signal to the agent runtime
- The current processing loop is interrupted
- The agent responds with a confirmation

**Example:**
```
/stop
> Stop signal sent.
```

---

### `/cwd`

Displays the current workspace directory the agent is operating in.

**Behavior:**
- Reads the agent's configured workspace path from the database
- Returns the absolute path

**Example:**
```
/cwd
> Current workspace: /workspace
```

---

### `/cd`

Changes the agent's workspace directory to a new path. Directory traversal via `..` is blocked for security.

**Permission:** All agents (super-agent restriction has been lifted).

**Behavior:**
- Updates the agent's workspace path in the database
- Destroys the existing Docker container so the new workspace is mounted on the next tool use
- Returns the new workspace path

**Example:**
```
/cd /workspace/projects/evonic
> Workspace changed to: /workspace/projects/evonic
```

**Error cases:**
```
/cd /nonexistent/path
> Error: directory does not exist: /nonexistent/path
```

```
/cd ../etc
> Error: path contains '..' which is not allowed: /workspace/../etc
```

---

### `/restart`

Restarts the entire Evonic service. This command replaces the running process in-place, preserving the original execution mode (foreground stays foreground, daemon stays daemon).

**Permission:** Super agent only.

**Behavior:**
- Validates the caller is the super agent
- Persists caller info so the new process can send a "ready" notification
- Stops all channels cleanly (releasing Telegram long-poll)
- Closes inherited file descriptors
- Resolves the correct restart target (release or dev mode)
- Replaces the current process via `os.execv`

**Example:**
```
/restart
> Restarting...
```

The new process will send a notification to the caller once boot is complete.

---

### `/plan`

Switches the agent to plan mode. In plan mode, the agent enters a deliberate planning phase with write tools blocked.

**Behavior:**
- Creates a fresh AgentState in plan mode
- Persists the state to the database
- The agent responds with a confirmation

**Example:**
```
/plan
> Switched to plan mode.
```

---

### `/exec`

*Introduced in v0.5.0.*

Switches the agent to execute mode. In execute mode, write tools are unlocked and the agent can take actions.

**Behavior:**
- Creates a fresh AgentState in execute mode
- Persists the state to the database
- The agent responds with a confirmation

**Example:**
```
/exec
> Switched to execute mode.
```

---

### `/dump`

*Introduced in v1.0.0.*

Exports the current session state as a JSONL file. This is invaluable for auditing, debugging, or migrating a conversation to another environment.

**Behavior:**
- Collects all messages, tool outputs, and agent state for the active session
- Generates a formatted JSONL dump file
- Saves the file to the agent's artifacts directory
- Returns a download link or artifact filename

**Example:**
```
/dump
> Session dumped to artifact: session_dump_20260717.jsonl
```

---

### `/unfocus`

Clears the agent's focus mode, allowing it to accept messages from all sessions again. When an agent is focused on a specific session, other sessions are ignored.

**Behavior:**
- Checks if focus mode is currently active
- If active, clears the focus and focus reason
- Returns information about what was cleared
- If focus mode was already off, returns a notification

**Example:**
```
/unfocus
> Focus mode cleared (was: working on task #183). Agent sekarang bisa menerima semua session.
```

---

### `/status`

Displays detailed status information about the agent, including model, mode, workplace, workspace, toggles, tools, skills, and channels.

**Behavior:**
- Queries the agent's full configuration and state from the database
- Returns structured information including:

| Field | Description |
|-------|-------------|
| **Model** | Active LLM model (agent-specific or override) |
| **Mode** | Current agent mode (`plan` or `execute`) |
| **Focus** | Whether focus mode is active (and reason) |
| **Plan file** | Active plan file path (if any) |
| **Workplace** | Workplace name, type, and connection status |
| **Workspace** | Workspace directory path |
| **Toggles** | Sandbox, Safety Checker, Vision, Agent Messaging |
| **Tools** | Number of tools configured |
| **Skills** | Number of skills configured |
| **Channels** | Connected channels and their status |

**Example:**
```
/status
> **Status — Adit**
>
> Model: Claude Sonnet 4 (claude-sonnet-4-20250514)
>
> Mode: execute
>
> Focus: yes — working on task #183
>
> Plan file: plan/kanban-task-183.md
>
> Workplace: Main Office (local, connected)
>
> Workspace: /workspace/docs-site
>
> Toggles:
>   Sandbox: enabled
>   Safety Checker: enabled
>   Vision: enabled
>   Agent Messaging: enabled
>
> Tools: 12
>
> Skills: 3
```

---

### `/shutdown`

*Introduced in v0.7.0.*

Cleanly shuts down the entire Evonic server from within a conversation. No terminal access needed.

**Permission:** Super agent only.

**Behavior:**
- Validates the caller is the super agent
- Initiates a graceful server shutdown
- All channels are stopped cleanly
- The server process exits

**Example:**
```
/shutdown
> Shutting down Evonic...
```


---

### `/detach`

*Introduced in v0.8.0.*

Moves a long-running command (builds, downloads, compilations) to the background so you can keep chatting while it runs. Progress is tracked persistently across the session.

**Behavior:**
- The process starts in the background immediately
- You can continue chatting without waiting for the process to finish
- When the job completes, the agent automatically notifies you with the result
- The background job tracker survives agent restarts within the same session

**Example:**
```
/detach
> Process detached with job ID #42. You'll be notified when it completes.
```

### Job Visibility & Monitors

*Introduced in v1.2.0.*

Detaching a job only moves it out of your way — it does not, by itself, tell you what happened. v1.2.0 adds two capabilities so long-running work stays accountable without ever blocking the chat:

**1. Running-job visibility.** The session's **Session State panel** now lists every background job started in the session, with its command, live status, exit code (once it exits), and whether a monitor is attached. You always know what is still running.

**2. Opt-in completion monitors.** You can ask the agent to *watch* a specific job and be told when something happens. Only an attached monitor produces a notification — unmonitored jobs stay silent, so an unrelated background command finishing never derails the conversation. A monitor is one-shot: it notifies exactly once, then removes itself.

| Watch condition | When it fires |
|-----------------|---------------|
| `on_exit`     | The watched process exits (any exit code) |
| `on_failure`  | The watched process exits non-zero |
| `log_match`   | A regex matches in the job's log tail |
| `shell`       | A shell predicate the agent runs succeeds |

Conditions are OR-combined, so a monitor fires on the first one that becomes true. Monitors survive server restarts (they are persisted as scheduler jobs) and are capped at **10 per session**, each defaulting to a **6-hour** expiry.

**Example — be told when a build finishes or fails:**
```
> Watch the build and tell me when it's done.
> Watching job #42 — I'll notify you when it exits.
... (you keep chatting) ...
> Job #42 exited with code 0 (build succeeded).
```

---

### `/investigate`

*Introduced in v0.8.0.*

Inspects another agent's context from the chat, surfacing session state, tool configuration, and runtime diagnostics without leaving the conversation.

**Usage:**
```
/investigate <agent-id> <context>
```

**Parameters:**

| Part | Description |
|------|-------------|
| agent-id | The target agent's slug ID (e.g. bookstore_bot) |
| context | What to inspect (session state, tools, config, etc.) |

**Behavior:**
- Queries the target agent's runtime configuration
- Returns structured diagnostic information
- No modification is made to the target agent

**Example:**
```
/investigate bookstore_bot tools
> Agent: bookstore_bot
> Tools (10):
>   - bash
>   - read
>   - save_artifact
>   ...
```

---

### `/sub`

*Introduced in v0.8.0.*

Spawns a sub-agent directly from chat for parallel work. Sub-agents execute without planning delays and deliver responses via inter-agent forwarding.

**Usage:**
```
/sub <name> --description "<purpose>"
```

**Behavior:**
- Creates a lightweight sub-agent with a descriptive name
- The sub-agent inherits the parent's model, tools, and skills
- Sub-agents skip the planning phase and execute directly
- Replies are automatically forwarded back to your session
- Naming-pattern enforcement prevents invalid sub-agent IDs

**Example:**
```
/sub researcher --description "Research topic X and summarize findings"
> Sub-agent 'researcher' spawned. It will report back when done.
```

See [Sub-Agents](/agents/sub-agents) for the full system documentation.

## Slash Command Controls

*Introduced in v1.1.0.*

Each agent can now be configured with **hidden** and **disabled** slash command lists directly from the agent Settings tab. This gives you precise control over which commands are visible and usable per agent.

| Setting | Description |
|---------|-------------|
| `hidden_slash_commands` | Commands hidden from the `/help` listing but still executable |
| `disabled_slash_commands` | Commands fully blocked — they won't appear and won't execute |

**Behavior:**
- Hidden commands won't show up in `/help` but can still be invoked by name
- Disabled commands return a clear error if someone tries to invoke them
- Configure these per-agent in the Settings tab or via API

**Example — hiding advanced commands from a public-facing agent:**
```
# In the agent's hidden_slash_commands:
/restart, /shutdown

# In the agent's disabled_slash_commands:
/investigate, /sub
```

---

## Guided Slash Commands

*Introduced in v1.1.0.*

Slash commands now support **parameter metadata** that enables live frontend hints and autocomplete as you type. When you start typing a command like `/clear` or `/model`, the UI shows the expected parameters so you never have to guess the syntax.

**How it works:**
- Each command exposes `parameters`, `accepts_args`, and `to_dict` metadata
- The frontend reads this metadata and renders inline hints and autocomplete suggestions
- Supported commands include `/clear`, `/model`, `/sub`, `/investigate`, and more

**Example — typing `/sub` shows inline hints:**
```
/sub <name> --description "<purpose>"
```
The `<name>` and `--description` placeholders appear as grey hints in the input field, and autocomplete fills them as you tab through.

---

## How Commands Are Processed

When a message starts with `/`, the agent runtime intercepts it before sending to the LLM:

1. **Parse** the command name (text after `/`, before any space)
2. **Match** against known commands in the registry
3. **Execute** the corresponding handler and return the response
4. If the command is **unknown**, pass the message to the LLM normally

## Implementation

Slash commands are implemented in `backend/slash_commands.py` using a registry pattern (`SlashCommandRegistry`) and integrated into the agent runtime (`backend/agent_runtime.py`). The command parsing uses regex (`^/(\w+)(?:\s+(.*))?$`) to extract command name and optional arguments.

New commands can be added by registering a handler function with `command_registry.register(name, handler, description)`. Each handler receives `(session_id, agent_id, external_user_id, channel_id, args)` and returns a response string.
