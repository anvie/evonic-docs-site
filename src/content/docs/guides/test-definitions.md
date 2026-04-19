---
title: Test Definitions
description: How to author and organize test definition JSON files.
sidebar:
  order: 2
---

## Directory Structure

```
test_definitions/
├── conversation/
│   ├── domain.json              # Domain metadata
│   ├── level_1/
│   │   ├── test_greeting.json
│   │   └── test_weather.json
│   ├── level_2/
│   │   └── test_geography.json
│   └── ...
├── math/
├── sql/
├── tool_calling/
├── evaluators/                  # Evaluator configs
└── tools/                       # Tool definitions
```

## Domain Configuration

Each domain has a `domain.json` file:

```json
{
  "id": "conversation",
  "name": "Conversation",
  "description": "Tests Indonesian language conversation abilities",
  "icon": "chat",
  "color": "#3B82F6",
  "evaluator_id": "keyword",
  "system_prompt": "Kamu adalah asisten yang ramah dan helpful.",
  "system_prompt_mode": "overwrite",
  "enabled": true
}
```

| Field | Required | Description |
|---|---|---|
| `id` | Yes | Unique domain identifier (matches directory name) |
| `name` | Yes | Display name |
| `description` | No | Description shown in UI |
| `evaluator_id` | No | Default evaluator for tests in this domain |
| `system_prompt` | No | Default system prompt for all tests |
| `system_prompt_mode` | No | `overwrite` (default) or `append` |
| `tool_ids` | No | Array of tool IDs available in this domain |
| `enabled` | No | Whether to include in evaluations (default: true) |

## Test Definition Format

Individual test files in `level_<n>/test_*.json`:

```json
{
  "id": "math_multiply_1",
  "name": "Simple Multiplication",
  "description": "Tests basic multiplication",
  "prompt": "Berapa hasil dari 15 dikali 7?",
  "expected": {
    "answer": "105",
    "type": "numeric"
  },
  "evaluator_id": "two_pass",
  "system_prompt": null,
  "system_prompt_mode": "overwrite",
  "tool_ids": [],
  "timeout_ms": 30000,
  "weight": 1.0,
  "enabled": true
}
```

| Field | Required | Description |
|---|---|---|
| `id` | Yes | Unique test identifier |
| `name` | Yes | Display name |
| `prompt` | Yes | The user message sent to the LLM |
| `expected` | Depends | Expected output (format varies by evaluator) |
| `evaluator_id` | No | Override domain's default evaluator |
| `system_prompt` | No | Override or extend the domain system prompt |
| `system_prompt_mode` | No | `overwrite` or `append` |
| `tool_ids` | No | Tools available for this specific test |
| `timeout_ms` | No | Per-test timeout (default: 30000) |
| `weight` | No | Score weight within the level (default: 1.0) |
| `enabled` | No | Include in evaluation (default: true) |

## Expected Formats by Evaluator

### Keyword Evaluator
```json
{
  "expected": {
    "keywords": ["halo", "selamat"],
    "forbidden": ["error", "maaf"]
  }
}
```

### Two-Pass Evaluator
```json
{
  "expected": {
    "answer": "105",
    "type": "numeric"
  }
}
```

### SQL Executor
```json
{
  "expected": {
    "query_type": "SELECT",
    "expected_columns": ["name", "price"],
    "min_rows": 1
  }
}
```

### Tool Call Evaluator
```json
{
  "expected": {
    "tools": ["get_weather"],
    "chain": false
  }
}
```

For chained tool calls (multi-step):
```json
{
  "expected": {
    "tools": ["get_order", "send_notification"],
    "chain": true
  }
}
```

## Managing Tests

### Via the Settings UI

1. Navigate to `/settings`
2. Select a domain from the sidebar
3. Click a level to view its tests
4. Use **+ Add Test** to create new tests
5. Click a test to edit its prompt, expected output, and evaluator

### Via the API

```bash
# List tests for a domain/level
curl http://localhost:8080/api/settings/tests?domain=math&level=1

# Create a test
curl -X POST http://localhost:8080/api/settings/tests \
  -H 'Content-Type: application/json' \
  -d '{
    "domain_id": "math",
    "level": 1,
    "name": "Addition Test",
    "prompt": "What is 2 + 2?",
    "expected": {"answer": "4", "type": "numeric"},
    "evaluator_id": "two_pass"
  }'
```

### Import / Export

Export all test definitions:
```bash
curl http://localhost:8080/api/settings/export > tests_backup.json
```

Import:
```bash
curl -X POST http://localhost:8080/api/settings/import \
  -H 'Content-Type: application/json' \
  -d @tests_backup.json
```
