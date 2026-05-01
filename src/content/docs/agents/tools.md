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

The `runpy` and `bash` tools are protected by a **3-layer heuristic safety system** that prevents dangerous operations:

1. **Pattern Matching**: blocks dangerous regex patterns like `rm -rf /`, `dd if=`, etc.
2. **Path Validation**: ensures file operations stay within the workspace directory
3. **Command Whitelisting**: restricts allowed commands and flags

See [Heuristic Code Safety](/security/heuristic-code-safety) for full details.

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

## Best Practices

- Always handle errors gracefully
- Use timeouts for long-running commands
- Avoid running untrusted code
- Keep commands focused and specific
