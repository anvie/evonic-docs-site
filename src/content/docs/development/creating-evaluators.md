---
title: Creating Evaluators
description: How to create custom evaluator strategies.
sidebar:
  order: 2
---

## Custom Evaluator Modes

Custom evaluators are defined as JSON files in `test_definitions/evaluators/` and support three modes.

### Regex-Only

Matches a regex pattern against the LLM response:

```json
{
  "id": "my_percentage_extractor",
  "name": "Percentage Extractor",
  "type": "regex",
  "description": "Extracts a percentage value from the response",
  "extraction_regex": "(\\d+(?:\\.\\d+)?)\\s*%",
  "uses_pass2": false,
  "config": {}
}
```

The first capture group is extracted and scored:
- If numeric: normalized to 0.0-1.0 scale
- If string: compared against expected value

### LLM-Prompt

Uses a second LLM call to evaluate the response:

```json
{
  "id": "my_quality_judge",
  "name": "Quality Judge",
  "type": "custom",
  "description": "LLM evaluates response quality",
  "eval_prompt": "Compare these two texts:\n\nExpected: {expected}\nActual: {response}\n\nRate similarity 1-3:\n1 = Wrong\n2 = Partial\n3 = Correct\n\nScore:",
  "uses_pass2": false,
  "config": {}
}
```

Available template variables in `eval_prompt`:
- `{response}`: the LLM's response
- `{expected}`: the expected output from the test definition
- `{prompt}`: the original prompt

### Hybrid

Combines LLM evaluation with regex score extraction:

```json
{
  "id": "my_hybrid_rater",
  "name": "Hybrid Quality Rater",
  "type": "hybrid",
  "description": "LLM rates quality, regex extracts score",
  "eval_prompt": "Evaluate this response from 0 to 100:\n\nResponse: {response}\nExpected: {expected}\n\nProvide reasoning, then end with: SCORE: <number>",
  "extraction_regex": "SCORE:\\s*(\\d+)",
  "uses_pass2": false,
  "config": {}
}
```

The LLM generates an evaluation, then the regex extracts the score.

## Creating via the UI

1. Go to **Settings** → **Evaluators** tab
2. Click **+ Add Custom Evaluator**
3. Fill in:
   - **ID**: unique identifier
   - **Name**: display name
   - **Type**: regex, custom, or hybrid
   - **Extraction Regex**: pattern (for regex/hybrid types)
   - **Eval Prompt**: LLM prompt template (for custom/hybrid types)
4. Save

## Using in Tests

Reference your evaluator by ID in any test definition:

```json
{
  "id": "my_test",
  "prompt": "What percentage of Earth is water?",
  "expected": "71",
  "evaluator_id": "my_percentage_extractor"
}
```

## Implementation Details

Custom evaluators are handled by `evaluator/custom_evaluator.py`:

1. Loads the evaluator config from the registry
2. For `custom`/`hybrid`: calls LLM with the eval prompt
3. For `regex`/`hybrid`: applies regex to extract a value
4. Normalizes the extracted value to a 0.0-1.0 score
5. Returns `EvaluationResult` with score, status, and details

## Tips

- Test regex patterns at [regex101.com](https://regex101.com) before using
- Keep eval prompts clear and specific: ambiguous prompts produce inconsistent scores
- Use hybrid mode when you want both LLM reasoning and reliable numeric extraction
- Set `uses_pass2: true` if you want the evaluator to work on an extracted answer rather than the raw response
