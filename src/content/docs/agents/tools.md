---
title: Tools
description: "Runpy and Bash: tools for executing code and shell commands in an isolated environment."
---

Runpy and Bash are tools that allow agents to execute Python code and shell commands. They're designed to be safe and isolated, with multiple layers of protection against dangerous operations.

## Prerequisites

The `runpy` and `bash` tools run inside an isolated Docker container by default. Before using these tools, build the sandbox image:

```bash
docker build -t evonic-sandbox:latest docker/tools/
```

If Docker is unavailable, set `sandbox_enabled=0` on the agent to fall back to local subprocess execution (less isolated). See the [Docker Setup guide](/getting-started/installation#docker-setup) for full configuration options.

## Runpy Tool

The Runpy tool executes Python code in an isolated environment. It provides a sandboxed Python interpreter where agents can run scripts, test code, and perform computations.

## Bash Tool

The Bash tool executes shell commands in an isolated container. It allows agents to run any shell command, but with safety restrictions to prevent damage.

### Safety

The `runpy`, `bash`, `read_file`, and `write_file` tools are protected by a **multi-layer HMADS (Heuristic Mal-Activity Detection System)** that uses a scoring-based approach:

1. **Pattern Matching** — scans commands against categorized regex patterns (destructive commands, sensitive files, SQLite access, etc.), each with a weight score
2. **AST Analysis** (Python only) — parses code into an Abstract Syntax Tree to detect dangerous calls like `exec()`, `os.system()`, `socket.socket()`
3. **Scoring & Decision** — combines all scores with contextual modifiers, then classifies as `safe`, `warning`, `requires_approval`, or `dangerous`

Additionally, `read_file` and `write_file` have a **dedicated SQLite path checker** that detects database file access and requires approval.

See [HMADS](/security/heuristic-code-safety) for full details.

## Usage

### Runpy

```python
runpy(code="print('Hello, World!')")
```

### Bash

```bash
bash(command="ls -la")
```

## Output

Both tools return structured output with:
- `stdout`: Standard output
- `stderr`: Standard error (if any)
- `exit_code`: Return code
- `error`: Error message (if the command was blocked)

## Additional Built-in Tools

### `save_artifact`

*Introduced in v0.5.0.*

Save a file to the agent's persistent artifacts directory. Use this to store reports, summaries, generated files, or any output you want to keep beyond the current session.

```python
save_artifact(filename="report.md", content="# Analysis Report...", mime_type="text/markdown", mode="text")
```

See the [Artifacts](/agents/artifacts) page for full details on saving, accessing, and managing artifacts.

### `forget_memory`

*Introduced in v0.5.0.*

Soft-delete a long-term memory by its ID. Use this when a stored memory is stale, incorrect, or no longer relevant.

```python
forget_memory(memory_id=42)
```

The memory is marked as expired and will no longer appear in recall results. Only super agents can delete another agent's memories.

### `portal_copy`

*Introduced in v0.5.0.*

Copy files between workspaces, portals, or across different paths using a single tool. This is useful for transferring files between different execution environments without manual staging.

```python
portal_copy(src="/_portal/shared_docs/report.md", dst="/workspace/report.md")
```

The source and destination paths accept any file tool path including `/_self/`, `/_portal/`, and regular workspace paths.

### `resolve_agent_approval`

*Introduced in v0.6.78.*

Approve or reject a pending tool-call approval from another agent. This is used in inter-agent workflows where one agent requests permission from another to execute a tool.

```python
resolve_agent_approval(approval_id="abc-123", decision="approve")
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `approval_id` | string | The approval ID from the notification message |
| `decision` | string | `"approve"` or `"reject"` |

The `approval_id` is included in the notification message when you receive an approval request from another agent.

## Write-vs-Edit Guard

*Introduced in v0.5.0.*

The `write_file` tool now **refuses to overwrite** an existing file. If the target file already exists, the tool returns an error message guiding the agent to use `str_replace` or `patch` for surgical edits instead. This prevents accidental data loss and encourages precise editing.

The error message dynamically suggests the best edit tool based on the agent's assigned tools.

## Improved `patch` Tool

*Introduced in v0.5.0.*

The `patch` tool now uses **tiered fuzzy matching** with three fallback levels:
1. **Exact match** — fast, precise matching of the provided diff
2. **Indent-tolerant** — matches even if indentation differs slightly
3. **Unescape-tolerant** — handles JSON `\\uXXXX` escapes and smart quotes

This makes the `patch` tool more reliable, especially when the LLM produces diffs with minor formatting inconsistencies.

## The `/_self/` Virtual Path

All file tools (`read_file`, `write_file`, `str_replace`, `patch`) support a special `/_self/` path prefix that always resolves to the agent's own directory on the Evonic server (`agents/<agent_id>/`), regardless of the agent's workspace location.

This is essential because an agent's workspace can be:
- A local directory outside the project root
- `/workspace` inside a Docker sandbox
- A remote directory on an SSH server or Tunnel Workplace

In all these cases, the agent cannot reach its own configuration files using normal paths. The `/_self/` prefix bridges this gap.

### What's accessible via `/_self/`

| Path | Maps to | Description |
|------|---------|-------------|
| `/_self/SYSTEM.md` | `agents/<id>/SYSTEM.md` | The agent's system prompt |
| `/_self/kb/` | `agents/<id>/kb/` | Knowledge base files |
| `/_self/sessions/` | `agents/<id>/sessions/` | Session data |
| `/_self/artifacts/` | `agents/<id>/artifacts/` | Saved artifacts (via `save_artifact`) |

### Examples

```python
# Read the agent's own system prompt
read_file(file_path="/_self/SYSTEM.md")

# Save a new KB file
write_file(file_path="/_self/kb/notes.md", content="...")

# Edit the system prompt
str_replace(file_path="/_self/SYSTEM.md", old_str="...", new_str="...")
```

### Security

- `/_self/` always resolves on the **Evonic host**, even when the agent runs in a sandbox or remote workplace
- Path traversal is blocked: `/_self/../../etc/passwd` is rejected
- Symlink attacks are prevented: the resolved path must stay within `agents/<agent_id>/`
- The resolution happens **before** sandbox/workspace routing, so it works identically in all execution environments

## Best Practices

- Always handle errors gracefully
- Use timeouts for long-running commands
- Avoid running untrusted code
- Keep commands focused and specific
