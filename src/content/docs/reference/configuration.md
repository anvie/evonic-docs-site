---
title: Configuration Reference
description: Complete reference for all environment variables and configuration options, including v0.2.0 additions for channels, allowlists, WhatsApp, and approval settings.
sidebar:
  order: 5
---

Configuration comes in three layers:

- **Environment variables** (`.env`) — server-wide settings for LLM, sandbox, auth, and logging.
- **Agent settings** (database) — per-agent config like vision, buffering, and safety checks.
- **Channel config** (JSON in database) — per-channel settings for mode, allowlists, and WhatsApp.

---

## LLM Endpoint

| Variable | Default | Description |
|---|---|---|
| `LLM_BASE_URL` | `https://openrouter.ai/api/v1` | OpenAI-compatible API base URL |
| `LLM_API_KEY` | *(empty)* | API key. Leave empty for local servers that don't require auth |
| `LLM_MODEL` | `moonshotai/kimi-k2-thinking` | Model identifier sent in API requests |
| `LLM_MAX_TOKENS` | `32768` | Maximum tokens in the LLM response |
| `LLM_CONTEXT_LENGTH` | `0` | Context window size. `0` = use model default |
| `LLM_PROMPT_BUFFER` | `2048` | Tokens reserved for the response when calculating context |
| `LLM_TIMEOUT` | `120` | Request timeout in seconds |
| `LLM_TIMEOUT_RETRIES` | `1` | Number of times to retry the LLM call if it times out |

### Compatible Endpoints

| Provider | Base URL |
|---|---|
| llama.cpp | `http://localhost:8080/v1` |
| Ollama | `http://localhost:11434/v1` |
| vLLM | `http://localhost:8000/v1` |
| OpenRouter | `https://openrouter.ai/api/v1` |
| OpenAI | `https://api.openai.com/v1` |

## Docker Sandbox

Settings for the isolated Docker container used by the `runpy` and `bash` tools. The sandbox image is built from `docker/tools/Dockerfile`. See [Docker Setup](/getting-started/installation#docker-setup) for build instructions.

| Variable | Default | Description |
|---|---|---|
| `SANDBOX_IMAGE` | `evonic-sandbox:latest` | Docker image used for the sandbox container |
| `SANDBOX_MEMORY_LIMIT` | `512m` | Memory limit per container |
| `SANDBOX_CPU_LIMIT` | `1` | CPU limit per container |
| `SANDBOX_NETWORK` | `bridge` | Network mode: `none` or `bridge` |
| `SANDBOX_MAX_CONTAINERS` | `10` | Maximum number of containers in the pool (LRU eviction) |
| `SANDBOX_IDLE_TIMEOUT` | `1800` | Idle timeout in seconds before container is destroyed (30 min) |
| `SANDBOX_WORKSPACE` | *(project root)* | Host path mounted at `/workspace` inside the container |

## Two-Pass Extraction

| Variable | Default | Description |
|---|---|---|
| `TWO_PASS_ENABLED` | `1` | Enable two-pass answer extraction (`1` or `0`) |
| `TWO_PASS_TEMPERATURE` | `0.0` | Temperature for the extraction pass. Low values improve consistency |

## Flask Server

| Variable | Default | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8080` | Server port |
| `DEBUG` | `0` | Enable Flask debug mode (`1` or `0`). Disabled by default — only enable in development. |
| `SECRET_KEY` | `dev-secret-key-...` | Flask session secret. Auto-generated and persisted to `.env` on first boot. Change in production. |

## Authentication

| Variable | Default | Description |
|---|---|---|
| `ADMIN_PASSWORD_HASH` | *(empty)* | Password hash for web dashboard login. Use `./evonic pass` to set. |
| `TURNSTILE_SITE_KEY` | *(empty)* | Cloudflare Turnstile site key — shows CAPTCHA on login when set |
| `TURNSTILE_SECRET_KEY` | *(empty)* | Cloudflare Turnstile secret key for server-side verification |

## Logging

These variables control the live evaluation log display. For the full logging system — file output, rotation, per-module routing, and the web UI log viewer — see the [Logging guide](/development/logging).

| Variable | Default | Description |
|---|---|---|
| `LOG_FULL_THINKING` | `0` | Include full LLM thinking content in live log output |
| `LOG_FULL_RESPONSE` | `0` | Include full LLM response in live log output |
| `LLM_API_LOG_ENABLED` | `0` | Log every LLM request/response to a markdown file |
| `LLM_API_LOG_FILE` | `logs/llm_api_calls.md` | Path for LLM API call logs |
| `EVENT_LOG_FILE` | `logs/events.log` | Path for agent runtime event logs (processing, tool execution, etc.) |
| `EVONIC_LOG_CONSOLE_QUIET` | `apscheduler.*` | Comma-separated fnmatch patterns to suppress from console output |

## Tunnel Workplace Connector (Evonet)

Settings for the [Evonet](/evonet) WebSocket relay server that enables Tunnel Workplaces.

| Variable | Default | Description |
|---|---|---|
| `CONNECTOR_WS_HOST` | `0.0.0.0` | Bind address for the Evonet relay server |
| `CONNECTOR_WS_PORT` | `8081` | Port for the Evonet relay server |
| `CONNECTOR_PING_INTERVAL` | `30` | WebSocket keepalive ping interval in seconds |
| `CONNECTOR_PING_TIMEOUT` | `10` | Ping timeout in seconds before marking connector offline |
| `CONNECTOR_PAIRING_CODE_TTL` | `300` | Pairing code validity window in seconds (default: 5 minutes) |

The relay server starts automatically on application boot. Ensure port `8081` (or your configured port) is reachable by devices running Evonet.

## Agent Configuration

*Introduced in v0.2.0.* These settings are stored per-agent in the database and can be edited via the Web UI or API.

| Setting | Default | Description |
|---|---|---|
| `vision_enabled` | `0` | Allow agent to receive and analyze images from channel (Telegram / WhatsApp) |
| `send_intermediate_responses` | `0` | Forward intermediate tool-call text to channels during processing |
| `outbound_buffer_seconds` | `1.5` | Coalescing delay in seconds before flushing intermediate output to channel |
| `enable_agent_state` | `0` | Enable structured agent state tracking (busy, waiting_for_tool, etc.) |
| `inject_agent_id` | `1` | Include the agent's identifier in system instructions |
| `inject_datetime` | `1` | Include the current date/time in system instructions |
| `safety_checker_enabled` | `1` | Enable HMADS heuristic safety checks for tool execution (`1` or `0`) |
| `disable_parallel_tool_execution` | `0` | Execute tools sequentially instead of in parallel (`1` or `0`) |
| `summarize_threshold` | `3` | Number of conversation turns before summarization triggers |
| `summarize_tail` | `5` | Number of most recent messages to keep after summarization |
| `message_buffer_seconds` | `2` | Inbound message buffering window in seconds |
| `primary_channel_id` | *(none)* | Channel ID used for agent-to-agent communication routing |

### Agent Queue Workers

*Introduced in v0.2.6.*

Controls how many agent conversations can be processed concurrently. This is a server-wide setting in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_QUEUE_MAX_WORKERS` | `5` | Maximum number of agent conversations processed in parallel. Higher values increase throughput but also increase CPU/memory usage. |

When the number of active conversations exceeds `AGENT_QUEUE_MAX_WORKERS`, additional messages are queued and processed as workers become available.

### Max Tool Iterations

*Introduced in v0.2.6.*

Controls how many tool calls an agent can make in a single conversation turn before the runtime forces a response. This prevents infinite tool-calling loops.

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_MAX_TOOL_ITERATIONS` | `15` | Maximum tool calls per turn. If the agent exceeds this limit, the runtime interrupts and generates a response with whatever results are available. |

This is a per-agent setting configurable in the **General** tab:

```bash
evonic agent update my_agent --max-tool-iterations 25
```

**When to adjust:**

| Scenario | Recommended Value | Reason |
|----------|------------------|--------|
| Simple Q&A | `10` | Most queries need 1-3 tool calls |
| Complex multi-step tasks | `20` | Research, data analysis pipelines |
| Agent-to-agent delegation | `25` | Messaging adds extra rounds |
| Debugging tool-calling agents | `30` | Allow exploration without interruption |

## Channel Configuration

*Introduced in v0.2.0.* Each channel stores its configuration as a JSON object in the database. You can edit these via the **Channel Detail Modal** in the Web UI or through the API.

### Channel Mode

New channels default to **restricted** mode. You can toggle between open and restricted at any time.

```json
{
  "mode": "restricted"
}
```

| Mode | Description |
|---|---|
| `open` | Everyone is allowed to chat. No allowlist check. |
| `restricted` | Only users in the allowlist can chat. New users receive a **pairing code** that an admin must approve. |

### Allowlists

In **restricted** mode, only users whose `external_user_id` is in the allowlist can interact with the agent:

```json
{
  "mode": "restricted",
  "allowed_users": ["123456789", "987654321"],
  "user_names": {
    "123456789": "Alice",
    "987654321": "Bob"
  },
  "names_needed": []
}
```

| Config Key | Type | Description |
|---|---|---|
| `allowed_users` | `string[]` | List of approved `external_user_id` values |
| `user_names` | `object` | Map of `external_user_id` to display name |
| `names_needed` | `string[]` | Users who have been approved but still need to provide their name |

### Pairing Codes & Pending Approvals

When an unregistered user sends a message to a restricted channel, the system generates a **pairing code** and creates a pending approval record. An admin must approve the code before the user can interact.

Pairing codes are **6-character alphanumeric** codes using an unambiguous character set (excludes `0`, `O`, `1`, `I`, `L` to prevent visual confusion).

- **Format**: `XXXXXX` — 6 uppercase alphanumeric, no hyphen.
- **Expiry**: Codes expire after **5 minutes**.
- **Legacy support**: `XXX-XXX` format (e.g., `XK4-M9Q`) is accepted for backward compatibility.

```json
// Example: valid pairing codes
"XK4M9Q"  // ✅ Standard format
"ABC123"  // ✅
"XK4-M9Q" // ✅ Legacy format (hyphen stripped)

// Example: invalid codes
"abc123"  // ❌ Lowercase
"0O1L"    // ❌ Contains ambiguous characters
```

#### Approval Flow

1. User sends a message to a restricted channel
2. System generates a pair code and replies with it
3. User shares the code with an admin
4. Admin approves via CLI (`evonic channel approve XK4M9Q`) or Web UI
5. User is added to the allowlist and can now interact

### WhatsApp Bridge Configuration

*Introduced in v0.2.0.* The WhatsApp channel uses a **Node.js sidecar** (Baileys bridge) that runs alongside the Evonic server. Configuration is stored per-channel in the database.

```json
{
  "mode": "restricted",
  "bridge_port": 3001
}
```

| Config Key | Default | Description |
|---|---|---|
| `bridge_port` | `3001` | Port for the WhatsApp Baileys sidecar process |
| `mode` | `restricted` | Channel access mode (`open` or `restricted`) |

The bridge is a Node.js process launched automatically when the WhatsApp channel starts. It:

- Listens for incoming WhatsApp messages and forwards them to Evonic via HTTP callback
- Handles QR code pairing with WhatsApp Web
- Manages authentication sessions in `data/whatsapp-sessions/{channel_id}/`

**Requirements:**

- Node.js must be installed on the server
- npm dependencies are auto-installed on first start
- The bridge uses the Baileys library (unofficial WhatsApp Web API)

#### Bridge Callback URL

The bridge posts incoming messages to:

```
POST /api/channels/whatsapp-bridge/{channel_id}/callback
```

This URL is auto-configured — no manual setup needed.

## Evaluator Overrides

Override the default evaluator strategy for specific domains:

```env
EVALUATOR_MATH=keyword
EVALUATOR_CONVERSATION=two_pass
EVALUATOR_SQL=sql_executor
```

The environment variable format is `EVALUATOR_<DOMAIN_UPPERCASE>`. Available types: `two_pass`, `keyword`, `sql_executor`, `tool_call`.

## Database Paths

These are configured in `config.py` (not via `.env`):

| Setting | Default | Description |
|---|---|---|
| `DB_PATH` | `evonic.db` | Main SQLite database |
| `TEST_DB_PATH` | `seed/test_db.sqlite` | SQLite database used for SQL evaluation tests |
