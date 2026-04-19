---
title: Configuration
description: All configuration options for the Evonic LLM Evaluator.
---

All configuration is done via environment variables in a `.env` file at the project root.

## Setup

```bash
cp .env.example .env
```

## LLM Endpoint

```env
# For local LLM (llama.cpp, Ollama)
LLM_BASE_URL=http://localhost:8080/v1
LLM_API_KEY=
LLM_MODEL=default

# For OpenRouter / cloud providers
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=your-api-key-here
LLM_MODEL=moonshotai/kimi-k2-thinking
```

| Variable | Default | Description |
|---|---|---|
| `LLM_BASE_URL` | `https://openrouter.ai/api/v1` | OpenAI-compatible API base URL |
| `LLM_API_KEY` | *(empty)* | API key (leave empty for local servers) |
| `LLM_MODEL` | `moonshotai/kimi-k2-thinking` | Model identifier |
| `LLM_TIMEOUT` | `120` | Request timeout in seconds |

## Two-Pass Extraction

The two-pass system first asks the LLM to reason about a problem, then makes a second call to extract just the final answer in a strict format.

| Variable | Default | Description |
|---|---|---|
| `TWO_PASS_ENABLED` | `1` | Enable two-pass answer extraction |
| `TWO_PASS_TEMPERATURE` | `0.0` | Temperature for the extraction pass |

## Flask Server

| Variable | Default | Description |
|---|---|---|
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8080` | Server port |
| `DEBUG` | `1` | Enable Flask debug mode |
| `SECRET_KEY` | `dev-secret-key-...` | Flask secret key (change in production) |

## Logging

| Variable | Default | Description |
|---|---|---|
| `LOG_FULL_THINKING` | `0` | Include full thinking content in live logs |
| `LOG_FULL_RESPONSE` | `0` | Include full LLM response in live logs |

## Optional

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(empty)* | For the improver module (analysis & training data generation) |

## Evaluator Overrides

Override the default evaluator for specific domains via environment variables:

```env
EVALUATOR_MATH=keyword        # Use keyword evaluator for math domain
EVALUATOR_CONVERSATION=two_pass  # Use two-pass for conversation
```

Available evaluator types: `two_pass`, `keyword`, `sql_executor`, `tool_call`.
