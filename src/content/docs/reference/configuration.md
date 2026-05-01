---
title: Configuration Reference
description: Complete reference for all environment variables and configuration options.
sidebar:
  order: 5
---

All configuration is done via environment variables in a `.env` file.

## LLM Endpoint

| Variable | Default | Description |
|---|---|---|
| `LLM_BASE_URL` | `https://openrouter.ai/api/v1` | OpenAI-compatible API base URL |
| `LLM_API_KEY` | *(empty)* | API key. Leave empty for local servers that don't require auth |
| `LLM_MODEL` | `moonshotai/kimi-k2-thinking` | Model identifier sent in API requests |
| `LLM_TIMEOUT` | `120` | Request timeout in seconds |
| `LLM_TIMEOUT_RETRIES` | `1` | Number of times to retry the LLM call if it times out. On timeout, the runtime sends a continue prompt to resume generation |

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
| `SANDBOX_NETWORK` | `none` | Network mode: `none` or `bridge` |
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
| `DEBUG` | `1` | Enable Flask debug mode (`1` or `0`) |
| `SECRET_KEY` | `dev-secret-key-...` | Flask session secret. Change in production |

## Logging

| Variable | Default | Description |
|---|---|---|
| `LOG_FULL_THINKING` | `0` | Include full LLM thinking content in live log output |
| `LOG_FULL_RESPONSE` | `0` | Include full LLM response in live log output |

## Cloud Workplace Connector (Evonet)

Settings for the [Evonet](/agents/evonet) WebSocket relay server that enables Cloud Workplaces.

| Variable | Default | Description |
|---|---|---|
| `CONNECTOR_WS_HOST` | `0.0.0.0` | Bind address for the Evonet relay server |
| `CONNECTOR_WS_PORT` | `8081` | Port for the Evonet relay server |
| `CONNECTOR_PING_INTERVAL` | `30` | WebSocket keepalive ping interval in seconds |
| `CONNECTOR_PING_TIMEOUT` | `10` | Ping timeout in seconds before marking connector offline |
| `CONNECTOR_PAIRING_CODE_TTL` | `300` | Pairing code validity window in seconds (default: 5 minutes) |

The relay server starts automatically on application boot. Ensure port `8081` (or your configured port) is reachable by devices running Evonet.

## Optional Services

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(empty)* | Anthropic API key for the improver module |

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
