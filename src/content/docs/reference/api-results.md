---
title: "API: Results & History"
description: Endpoints for viewing evaluation results and managing history.
sidebar:
  order: 2
---

## Run Matrix

```http
GET /api/run/<run_id>/matrix
```

Returns the full result matrix for a completed run (same format as the live `/api/test_matrix`).

## Per-Cell Test Results

```http
GET /api/run/<run_id>/tests/<domain>/<level>
```

Returns individual test results for a specific domain/level cell.

**Response:**
```json
{
  "run_id": "a1b2c3d4-...",
  "domain": "math",
  "level": 1,
  "tests": [
    {
      "test_id": "math_add_1",
      "prompt": "Berapa 5 + 3?",
      "response": "Jawabannya adalah 8.",
      "expected": {"answer": "8", "type": "numeric"},
      "score": 1.0,
      "status": "passed",
      "details": {"extracted_answer": "8", "pass2_used": true},
      "duration_ms": 1234,
      "model_name": "default",
      "system_prompt": "You are a math tutor..."
    }
  ]
}
```

## Run Details

```http
GET /api/run/<run_id>
```

Returns run metadata, all test results, and statistics.

```json
{
  "run_info": {
    "run_id": "a1b2c3d4-...",
    "started_at": "2026-04-07 10:00:00",
    "completed_at": "2026-04-07 10:05:00",
    "model_name": "default",
    "overall_score": 0.82,
    "total_tokens": 15000,
    "total_duration_ms": 300000
  },
  "test_results": [...],
  "stats": {
    "status_counts": {"passed": 45, "failed": 20},
    "avg_score": 0.82,
    "total_tests": 65
  }
}
```

## Delete Run

```http
DELETE /api/history/<run_id>
```

Deletes an evaluation run and all related data (test results, level scores, log files).

```json
{"success": true}
```

## V1 History API

### Last Run ID

```http
GET /api/v1/history/last/id
```

Returns the most recent run's metadata.

```json
{
  "run_id": "a1b2c3d4-...",
  "model_name": "default",
  "started_at": "2026-04-07 10:00:00",
  "completed_at": "2026-04-07 10:05:00",
  "status": "completed"
}
```

### Last Run: Domain/Level Results

```http
GET /api/v1/history/last/<domain>/<level>
```

Returns test results from the most recent run for a specific domain/level.

### Specific Run: Domain/Level Results

```http
GET /api/v1/history/<run_id>/<domain>/<level>
```

Returns test results for a specific run/domain/level combination. Includes full prompt, response, expected, score, and details for each test.
