---
title: "API: Evaluation"
description: Endpoints for starting, stopping, and monitoring evaluations.
sidebar:
  order: 1
---

## Start Evaluation

```http
POST /api/start
```

**Request:**
```json
{
  "model_name": "default",
  "domains": ["math", "sql"]
}
```

| Field | Type | Description |
|---|---|---|
| `model_name` | string | Label for this run (default: `"default"`) |
| `domains` | string[] | Optional: limit to specific domains (null = all) |

**Response:**
```json
{
  "success": true,
  "run_id": "a1b2c3d4-...",
  "message": "Evaluation started"
}
```

## Stop Evaluation

```http
POST /api/stop
```

Stops the currently running evaluation. Results collected so far are preserved.

**Response:**
```json
{
  "success": true,
  "message": "Evaluation stopped"
}
```

## Reset State

```http
POST /api/reset
```

Resets the engine to idle state (use if the engine is stuck).

## Get Status

```http
GET /api/status
```

Returns the current engine state, including progress information during an active run.

**Response:**
```json
{
  "status": "running",
  "run_id": "a1b2c3d4-...",
  "current_domain": "math",
  "current_level": 3,
  "progress": 45,
  "total_tests": 65
}
```

## Get Test Matrix

```http
GET /api/test_matrix
```

Returns the live result matrix for the current run. The frontend polls this endpoint for real-time updates.

**Response:**
```json
{
  "domains": {
    "math": {
      "1": {"status": "passed", "score": 1.0, "duration_ms": 2340},
      "2": {"status": "running", "score": null},
      "3": {"status": "pending", "score": null}
    }
  },
  "run_id": "a1b2c3d4-...",
  "model_name": "default",
  "status": "running"
}
```

## Poll Logs

```http
GET /api/log_poll
```

Returns a batch of pending log messages (up to 100 per poll). The frontend uses this for the real-time log display.

**Response:**
```json
{
  "messages": [
    "[math][L1] Testing: Simple Addition...",
    "[math][L1] PASS (score: 1.0, 1.2s)"
  ],
  "is_running": true
}
```

The special message `"EVAL_COMPLETE"` signals that the evaluation has finished.

## Get Configuration

```http
GET /api/config
```

Returns safe configuration values (no secrets).

```json
{
  "llm_base_url": "https://openrouter.ai/api/v1",
  "llm_model": "moonshotai/kimi-k2-thinking",
  "debug": true
}
```

## Get Model Name

```http
GET /api/config/model
```

Returns the actual model name from the remote LLM endpoint.

```json
{
  "model": "kimi-k2-thinking",
  "config_model": "moonshotai/kimi-k2-thinking"
}
```
