---
title: Evaluator Types
description: All built-in evaluator strategies and when to use each one.
sidebar:
  order: 4
---

The evaluator system uses the Strategy Pattern: each evaluator inherits from `BaseEvaluator` and returns an `EvaluationResult` with a score (0.0-1.0), status, and details.

## Keyword Evaluator

**Domains:** conversation

**PASS 2:** No

Scores responses based on keyword presence, relevance, and Indonesian language fluency.

```json
{
  "evaluator_id": "keyword",
  "expected": {
    "keywords": ["halo", "selamat", "pagi"],
    "forbidden": ["error"]
  }
}
```

**Scoring breakdown:**
- Keyword match ratio (what percentage of expected keywords appear)
- Forbidden word penalty
- Indonesian fluency bonus (checks for natural Indonesian phrasing)

## Two-Pass Evaluator

**Domains:** math, reasoning, health

**PASS 2:** Yes

First pass gets the full response with reasoning. Second pass extracts just the final answer in a strict format, then compares against expected.

```json
{
  "evaluator_id": "two_pass",
  "expected": {
    "answer": "105",
    "type": "numeric"
  }
}
```

**Expected types:**
- `numeric`: numeric comparison with tolerance
- `string`: exact string match (case-insensitive)
- `contains`: checks if expected appears in extracted answer

## SQL Executor Evaluator

**Domains:** sql

**PASS 2:** Yes

Extracts SQL from the LLM response, executes it against a real SQLite database (`seed/test_db.sqlite`), and validates the results.

```json
{
  "evaluator_id": "sql_executor",
  "expected": {
    "query_type": "SELECT",
    "expected_columns": ["name", "price"],
    "min_rows": 1,
    "max_rows": 100
  }
}
```

**Validation checks:**
- SQL syntax (does it execute without error?)
- Column presence (are expected columns in the result?)
- Row count (within expected range?)
- Data quality (are values non-null, reasonable?)

Supports multi-statement SQL (separated by `;`), executing each sequentially.

## Tool Call Evaluator

**Domains:** tool_calling

**PASS 2:** Yes

Validates that the LLM correctly invokes function tools with appropriate arguments. Supports both single-tool and chained multi-step tool calls.

```json
{
  "evaluator_id": "tool_call",
  "expected": {
    "tools": ["get_order", "send_notification"],
    "chain": true
  }
}
```

**Scoring:**
- Did the LLM call the expected tools?
- Were arguments present and reasonable?
- For chained calls: did it use output from tool A as input to tool B?
- Partial credit for calling some but not all expected tools

## Custom Evaluators

Custom evaluators support three modes:

### Regex-Only (`type: "regex"`)

Matches response against a regex pattern. See [Regex Evaluators](/guides/regex-evaluators) for details.

### LLM-Prompt (`type: "custom"`)

Uses a second LLM call to evaluate quality:

```json
{
  "id": "natural_text_compare",
  "type": "custom",
  "eval_prompt": "Compare these two texts and rate similarity 1-3:\n\nExpected: {expected}\nActual: {response}\n\nRate: 1=wrong, 2=partial, 3=correct\nScore:",
  "uses_pass2": false
}
```

### Hybrid (`type: "hybrid"`)

Combines LLM evaluation with regex score extraction:

```json
{
  "id": "hybrid_quality_rater",
  "type": "hybrid",
  "eval_prompt": "Rate response quality 0-100...\nSCORE: <number>",
  "extraction_regex": "SCORE:\\s*(\\d+)"
}
```

## Creating Custom Evaluators

Via the Settings UI or by creating JSON files in `test_definitions/evaluators/`:

```json
{
  "id": "my_evaluator",
  "name": "My Custom Evaluator",
  "type": "regex",
  "description": "Extracts and validates date format",
  "extraction_regex": "(\\d{4}-\\d{2}-\\d{2})",
  "uses_pass2": false,
  "config": {}
}
```

See [Creating Evaluators](/development/creating-evaluators) for the full development guide.
