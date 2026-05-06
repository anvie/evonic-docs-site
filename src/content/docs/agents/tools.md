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

## The `/_self/` Virtual Path

All file tools (`read_file`, `write_file`, `str_replace`, `patch`) support a special `/_self/` path prefix that always resolves to the agent's own directory on the Evonic server (`agents/<agent_id>/`), regardless of the agent's workspace location.

This is essential because an agent's workspace can be:
- A local directory outside the project root
- `/workspace` inside a Docker sandbox
- A remote directory on an SSH server or Cloud Workplace

In all these cases, the agent cannot reach its own configuration files using normal paths. The `/_self/` prefix bridges this gap.

### What's accessible via `/_self/`

| Path | Maps to | Description |
|------|---------|-------------|
| `/_self/SYSTEM.md` | `agents/<id>/SYSTEM.md` | The agent's system prompt |
| `/_self/kb/` | `agents/<id>/kb/` | Knowledge base files |
| `/_self/sessions/` | `agents/<id>/sessions/` | Session data |

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
