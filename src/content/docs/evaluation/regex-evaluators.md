---
title: Regex Evaluators
description: Built-in regex evaluator types and how to create custom patterns.
sidebar:
  order: 5
---

## Overview

Regex evaluators match patterns in LLM responses to extract and score answers. Three modes are available: regex-only, LLM-prompt, and hybrid.

## Built-in Evaluators

### `regex_number_extractor`

Extracts numeric answers from responses.

```json
{
  "id": "regex_number_extractor",
  "type": "regex",
  "extraction_regex": "(?:Jawaban|Score|Answer|Nilai):?\\s*(\\d+(?:\\.\\d+)?)"
}
```

Matches: `Jawaban: 42`, `Score: 85.5`, `Answer: 100`

### `regex_exact_match`

Matches entire response against expected string (case-insensitive).

```json
{
  "id": "regex_exact_match",
  "type": "regex",
  "extraction_regex": "^(.+)$"
}
```

### `regex_multiple_choice`

Extracts A/B/C/D answers.

```json
{
  "id": "regex_multiple_choice",
  "type": "regex",
  "extraction_regex": "(?:Jawaban|Answer):?\\s*([ABCDabcd])"
}
```

### `regex_date_extractor`

Validates YYYY-MM-DD date format.

```json
{
  "id": "regex_date_extractor",
  "type": "regex",
  "extraction_regex": "(\\d{4}-\\d{2}-\\d{2})"
}
```

### `regex_sql_validator`

Checks for SELECT...FROM...WHERE structure.

```json
{
  "id": "regex_sql_validator",
  "type": "regex",
  "extraction_regex": "(?i)\\b(SELECT)\\b.*\\b(FROM)\\b.*\\b(WHERE)\\b"
}
```

### `hybrid_quality_rater`

LLM evaluates quality, regex extracts the score.

```json
{
  "id": "hybrid_quality_rater",
  "type": "hybrid",
  "eval_prompt": "Evaluate response quality 0-100:\n\nResponse: {response}\nExpected: {expected}\n\nEnd with: SCORE: <number>",
  "extraction_regex": "SCORE:\\s*(\\d+)"
}
```

## How Scoring Works

### Mode 1: Score Extraction (captures a number)
1. Extract value from first capture group
2. Normalize: >100 → divide by 100; >5 → assume 0-100 scale
3. Status: `passed` if score >= 0.7

### Mode 2: String Matching (captures text + expected exists)
1. Extract from first capture group
2. Compare with expected (case-insensitive)
3. Score: 1.0 if match, 0.0 if not

### Mode 3: Full Match (no capture groups)
1. Check if pattern matches anywhere in response
2. Score: 1.0 if found, 0.0 if not

## Creating Custom Regex Evaluators

### Via the Settings UI

1. Go to **Settings** → **Evaluators** tab
2. Click **+ Add Custom Evaluator**
3. Select type: Regex Pattern Matcher
4. Enter your extraction regex pattern

### Via JSON File

Create a file in `test_definitions/evaluators/`:

```json
{
  "id": "my_custom_regex",
  "name": "My Custom Evaluator",
  "type": "regex",
  "description": "What it evaluates",
  "extraction_regex": "your-regex-here",
  "uses_pass2": false,
  "config": {}
}
```

## Common Patterns

| Pattern | Purpose |
|---|---|
| `(?:Answer):?\s*(\d+)` | Extract number after "Answer:" |
| `(\d+(?:\.\d+)?)\s*%` | Extract percentage |
| `([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})` | Extract email |
| `(https?:\/\/[^\s]+)` | Extract URL |
| `(\d{4}-\d{2}-\d{2})` | Extract date (YYYY-MM-DD) |
| `(\d{2}:\d{2})` | Extract time (HH:MM) |
| `[Jj]awaban:\s*([ABCD])` | Multiple choice answer |
| `(?i)\b(SELECT)\b.*\b(FROM)\b` | SQL keyword validation |

## Tips

- Always use capture groups `(...)` to extract specific values
- Use `(?i)` for case-insensitive matching
- Test patterns at [regex101.com](https://regex101.com) before deploying
- Remember JSON requires double backslashes (`\\d` not `\d`)
