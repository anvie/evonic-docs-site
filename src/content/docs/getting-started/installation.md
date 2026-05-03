---
title: Installation
description: How to install and set up Evonic.
---

## Prerequisites

- **Python 3.8+**
- **An LLM endpoint**: any OpenAI-compatible API (llama.cpp, Ollama, vLLM, OpenRouter, etc.)
- **Git**: for cloning the repository
- **Docker**: required for isolated `runpy` and `bash` tool execution (see [Docker Setup](#docker-setup))

## Quick Install (Recommended)

Install Evonic in one command:

```bash
curl -fsSL https://evonic.dev/install.sh | bash
```

The installer will:

- Download the latest Evonic release for your platform
- Set up Python dependencies automatically
- Create any necessary directories and config files
- Setup the configuration.
- Print post-install instructions to get you started

> **Note:** If you prefer a manual install, see the [Clone and Install](#clone-and-install) section below.

## Clone and Install

```bash
git clone https://github.com/anvie/evonic.git
cd evonic-ai-platform
pip install -r requirements.txt
```

### Python Dependencies

| Package | Purpose |
|---|---|
| `flask>=3.0` | Web framework |
| `requests>=2.31` | HTTP client for LLM API |
| `python-dotenv>=1.0.0` | Environment variable loading |

### Optional Dependencies

For the Telegram channel integration (agent platform):

```bash
pip install python-telegram-bot
```

## Docker Setup

The agent tools `runpy` and `bash` execute code inside an isolated Docker container by default (via `DockerBackend`). This sandbox provides filesystem isolation, resource limits, and network restrictions, ensuring agent code runs safely without affecting the host system.

**Prerequisites:** Docker must be installed and the daemon running.

**Build the sandbox image:**

```bash
docker build -t evonic-sandbox:latest docker/tools/
```

The image is built from `docker/tools/Dockerfile` and includes Python 3.11, system utilities (`curl`, `git`, `ripgrep`, `sqlite3`, etc.), and a non-root `devuser` matching the host UID/GID. The host workspace is mounted at `/workspace` and the `runpy_helpers` package is automatically available inside the container.

**Configuration** (in `.env`):

```env
# Docker image name (default)
SANDBOX_IMAGE=evonic-sandbox:latest

# Resource limits
SANDBOX_MEMORY_LIMIT=512m
SANDBOX_CPU_LIMIT=1
SANDBOX_NETWORK=none        # or 'bridge'
SANDBOX_MAX_CONTAINERS=10

# Idle timeout in seconds (containers are destroyed after this)
SANDBOX_IDLE_TIMEOUT=1800
```

> **Note:** If Docker is unavailable, set `sandbox_enabled=0` on the agent to fall back to local subprocess execution (less isolated).

## Install a Local Model Runner (Optional)

### Ollama (Recommended for Beginners)
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/
```

### llama.cpp (For Edge/CPU-Only)
```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
cmake -B build
cmake --build build --config Release -j $(nproc)
```

### vLLM (For High-Throughput Production)
```bash
pip install vllm
```

## Verify Installation

```bash
python3 -c "import flask; import requests; print('OK')"
```

## Using the CLI

The `evonic` CLI provides commands for managing the platform. Check available commands with:

```bash
evonic --help
```

The CLI covers server management, agents, skills, skillsets, models, plugins, and schedules. See each section for detailed CLI usage:

- [Plugin Management](/plugins/setup): Install, list, configure plugins
- [Skills](/skills/skills/): Install, enable, and manage skills
- [Creating Agents](/agents/creating-agents): Create and manage agents
- [Local Models](/local-models/overview): Manage LLM model configurations
- [Skillsets](/skills/skillsets): Apply agent templates
- [Scheduler](/guides/scheduler): Create scheduled jobs

## Starting the Server

Start the Evonic Flask server:

```bash
evonic start [--port PORT] [--host HOST] [--debug] [-f]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--port` | No | Port number (default: from config or 8080) |
| `--host` | No | Host to bind (default: `0.0.0.0`) |
| `--debug` | No | Enable debug mode |
| `-f, --foreground` | No | Run server in foreground (blocking mode) |

**Examples:**

```bash
# Start on default port
evonic start

# Start on custom port
evonic start --port 9000

# Start in foreground with debug mode
evonic start -f --debug
```

**Output:**

```
Server started (PID: 12345)
Host: 0.0.0.0
Port: 8080
URL: http://localhost:8080
```

### Stopping the Server

```bash
evonic stop
```

### Checking Status

```bash
evonic status
```

**Output (running):**

```
Server is running (PID: 12345)
Port: 8080
URL: http://localhost:8080
```

### Updating the Server

Check for and apply updates from the Git remote. Requires the [update supervisor](/agents/self-update) to be set up first.

```bash
evonic update [--check] [--tag TAG] [--rollback] [--force]
```

| Flag | Description |
|------|-------------|
| `--check` | Fetch tags and report what is available: no update is applied |
| `--tag TAG` | Update to a specific tag instead of the latest |
| `--rollback` | Roll back to the previous stable release |
| `--force` | Skip SSH signature verification (development only) |

**Examples:**

```bash
# Check what version is available
evonic update --check

# Trigger an immediate update check on the running supervisor
evonic update

# Update to a specific tag
evonic update --tag v1.3.0

# Roll back to the previous release
evonic update --rollback
```

When the update supervisor is running in the background, `evonic update` signals it via `SIGUSR1` to trigger an immediate check. If the supervisor is not running, the update is performed inline in the current process.

**See also:** [Update System guide](/agents/self-update)

## Next Steps

- [Configure your LLM endpoint](/getting-started/configuration)
- [Set up a local model](/local-models/overview)
- [Create your first agent](/getting-started/quickstart)
