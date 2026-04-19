---
title: Database Schema
description: Complete SQLite database schema reference.
sidebar:
  order: 6
---

The application uses a single SQLite database (`evonic.db`) with tables for evaluation results, test definitions, and the agent platform.

## Evaluation Tables

### `evaluation_runs`

Top-level table for each evaluation run.

| Column | Type | Description |
|---|---|---|
| `run_id` | TEXT PK | UUID identifier |
| `started_at` | DATETIME | When the run started |
| `completed_at` | DATETIME | When the run finished (null if in progress) |
| `model_name` | TEXT | Model label for this run |
| `summary` | TEXT | Run summary text |
| `overall_score` | REAL | Aggregate score (0.0-1.0) |
| `total_tokens` | INTEGER | Total tokens consumed |
| `total_duration_ms` | INTEGER | Total wall-clock time |

### `test_results`

Aggregated results per domain/level.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `run_id` | TEXT FK | References `evaluation_runs` |
| `domain` | TEXT | Domain identifier |
| `level` | INTEGER | Complexity level (1-5) |
| `score` | REAL | Aggregate score for this cell |
| `status` | TEXT | `passed`, `failed`, `running`, `pending` |
| `prompt` | TEXT | Last prompt (legacy) |
| `response` | TEXT | Last response (legacy) |

### `individual_test_results`

Per-test results with full details.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `run_id` | TEXT FK | References `evaluation_runs` |
| `test_id` | TEXT FK | References `tests` |
| `domain` | TEXT | Domain identifier |
| `level` | INTEGER | Level number |
| `prompt` | TEXT | Full prompt sent to LLM |
| `response` | TEXT | Full LLM response |
| `expected` | TEXT (JSON) | Expected output |
| `score` | REAL | Score (0.0-1.0) |
| `status` | TEXT | `passed` or `failed` |
| `details` | TEXT (JSON) | Evaluator-specific details |
| `duration_ms` | INTEGER | Response time |
| `model_name` | TEXT | Model used |
| `system_prompt` | TEXT | Resolved system prompt |

### `level_scores`

Aggregated scores per domain/level.

| Column | Type | Description |
|---|---|---|
| `run_id` | TEXT FK | References `evaluation_runs` |
| `domain` | TEXT | Domain identifier |
| `level` | INTEGER | Level number |
| `average_score` | REAL | Average score across tests |
| `total_tests` | INTEGER | Number of tests |
| `passed_tests` | INTEGER | Number of passed tests |

---

## Test Definition Tables

### `domains`

Cached domain metadata from `domain.json` files.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Domain identifier |
| `name` | TEXT | Display name |
| `evaluator_id` | TEXT | Default evaluator |
| `system_prompt` | TEXT | Domain system prompt |
| `system_prompt_mode` | TEXT | `overwrite` or `append` |
| `enabled` | BOOLEAN | Include in evaluations |
| `tool_ids` | TEXT | JSON array of tool IDs |

### `levels`

Per-level configuration.

| Column | Type | Description |
|---|---|---|
| `domain_id` | TEXT PK | References `domains` |
| `level` | INTEGER PK | Level number |
| `system_prompt` | TEXT | Level system prompt |
| `system_prompt_mode` | TEXT | `overwrite` or `append` |

### `tests`

Individual test definitions.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Test identifier |
| `domain_id` | TEXT FK | References `domains` |
| `level` | INTEGER | Level number |
| `prompt` | TEXT | User prompt |
| `expected` | TEXT (JSON) | Expected output |
| `evaluator_id` | TEXT | Override evaluator |
| `system_prompt` | TEXT | Test system prompt |
| `weight` | REAL | Score weight (default: 1.0) |
| `enabled` | BOOLEAN | Include in evaluations |

### `evaluators`

Evaluator configuration registry.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Evaluator identifier |
| `type` | TEXT | `regex`, `custom`, `hybrid` |
| `eval_prompt` | TEXT | LLM evaluation prompt template |
| `extraction_regex` | TEXT | Regex pattern for score extraction |
| `uses_pass2` | BOOLEAN | Whether to use two-pass extraction |
| `config` | TEXT (JSON) | Additional configuration |

### `tools`

Tool definition registry.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Tool identifier |
| `name` | TEXT | Display name |
| `function_def` | TEXT (JSON) | OpenAI function schema |
| `mock_response` | TEXT | Mock response for evaluation |
| `mock_response_type` | TEXT | `json` or `javascript` |

---

## Agent Platform Tables

### `agents`

Agent definitions.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | Slug identifier (e.g., `bookstore_bot`) |
| `name` | TEXT | Display name |
| `description` | TEXT | Short description |
| `system_prompt` | TEXT | Agent persona and instructions |
| `model` | TEXT | Model override (null = use default) |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

### `agent_tools`

Many-to-many mapping of agents to tools.

| Column | Type | Description |
|---|---|---|
| `agent_id` | TEXT PK, FK | References `agents` |
| `tool_id` | TEXT PK | Tool identifier |

### `channels`

Per-agent channel configurations.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | UUID identifier |
| `agent_id` | TEXT FK | References `agents` |
| `type` | TEXT | `telegram`, `whatsapp`, `discord` |
| `name` | TEXT | Display name |
| `config` | TEXT (JSON) | Channel-specific config (e.g., bot token) |
| `enabled` | BOOLEAN | Whether the channel is active |

### `chat_sessions`

Per-user conversation sessions.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | UUID identifier |
| `agent_id` | TEXT FK | References `agents` |
| `channel_id` | TEXT FK | References `channels` (nullable for web chat) |
| `external_user_id` | TEXT | User identifier from the channel |

Sessions are uniquely identified by the tuple `(agent_id, channel_id, external_user_id)`.

### `chat_messages`

Conversation message history.

| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `session_id` | TEXT FK | References `chat_sessions` |
| `role` | TEXT | `user`, `assistant`, `tool`, `system` |
| `content` | TEXT | Message content |
| `tool_calls` | TEXT (JSON) | Tool call objects (for assistant messages) |
| `tool_call_id` | TEXT | Tool call ID (for tool result messages) |
| `created_at` | TIMESTAMP | Message timestamp |
