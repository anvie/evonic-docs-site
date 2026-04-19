---
title: "API: Test Management"
description: CRUD endpoints for managing domains, tests, evaluators, and tools.
sidebar:
  order: 3
---

All test management endpoints are under `/api/settings/`.

## Domains

### List Domains

```http
GET /api/settings/domains
```

```json
{
  "domains": [
    {
      "id": "math",
      "name": "Mathematics",
      "description": "...",
      "evaluator_id": "two_pass",
      "enabled": true
    }
  ]
}
```

### Get Domain

```http
GET /api/settings/domains/<domain_id>
```

### Create Domain

```http
POST /api/settings/domains
Content-Type: application/json

{
  "id": "my_domain",
  "name": "My Domain",
  "description": "Custom evaluation domain",
  "evaluator_id": "keyword",
  "system_prompt": "You are a helpful assistant.",
  "icon": "brain",
  "color": "#3B82F6"
}
```

### Update Domain

```http
PUT /api/settings/domains/<domain_id>
```

### Delete Domain

```http
DELETE /api/settings/domains/<domain_id>
```

Deletes the domain and all its tests and level configs.

---

## Levels

### Get Level Config

```http
GET /api/settings/levels/<domain_id>/<level>
```

### Update Level Config

```http
PUT /api/settings/levels/<domain_id>/<level>
Content-Type: application/json

{
  "system_prompt": "Level-specific instructions...",
  "system_prompt_mode": "append"
}
```

---

## Tests

### List Tests

```http
GET /api/settings/tests?domain=math&level=1
```

Both `domain` and `level` are optional query parameters.

### Get Test

```http
GET /api/settings/tests/<test_id>
```

### Create Test

```http
POST /api/settings/tests
Content-Type: application/json

{
  "domain_id": "math",
  "level": 1,
  "name": "Addition Test",
  "prompt": "What is 2 + 2?",
  "expected": {"answer": "4", "type": "numeric"},
  "evaluator_id": "two_pass"
}
```

### Update Test

```http
PUT /api/settings/tests/<test_id>
```

### Delete Test

```http
DELETE /api/settings/tests/<test_id>
```

### Move Test

```http
POST /api/settings/tests/<test_id>/move
Content-Type: application/json

{"domain_id": "reasoning", "level": 3}
```

---

## Evaluators

### List Evaluators

```http
GET /api/settings/evaluators
```

### Get Evaluator

```http
GET /api/settings/evaluators/<evaluator_id>
```

### Create Evaluator

```http
POST /api/settings/evaluators
Content-Type: application/json

{
  "id": "my_regex",
  "name": "My Regex Evaluator",
  "type": "regex",
  "extraction_regex": "(\\d+)",
  "uses_pass2": false
}
```

### Update / Delete Evaluator

```http
PUT /api/settings/evaluators/<evaluator_id>
DELETE /api/settings/evaluators/<evaluator_id>
```

---

## Tools

### List Tools

```http
GET /api/settings/tools
```

### Get Tool

```http
GET /api/settings/tools/<tool_id>
```

### Create Tool

```http
POST /api/settings/tools
Content-Type: application/json

{
  "id": "my_tool",
  "name": "My Tool",
  "description": "Does something useful",
  "function": {
    "name": "my_tool",
    "description": "Does something useful",
    "parameters": {
      "type": "object",
      "properties": {
        "input": {"type": "string"}
      },
      "required": ["input"]
    }
  },
  "mock_response": {"result": "mock output"}
}
```

### Update / Delete Tool

```http
PUT /api/settings/tools/<tool_id>
DELETE /api/settings/tools/<tool_id>
```

---

## Import / Export

### Export All Definitions

```http
GET /api/settings/export
```

Returns a JSON dump of all domains, tests, evaluators, and tools.

### Import Definitions

```http
POST /api/settings/import
Content-Type: application/json

{ "merge": true, "domains": [...], "tests": [...] }
```

Set `merge: false` to overwrite instead of merging.

### Sync to Database

```http
POST /api/settings/sync
```

Re-syncs JSON files on disk to the database cache.
