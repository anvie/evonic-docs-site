---
title: Evaluation Workflow
description: How the multi-pass LLM evaluation pipeline works end-to-end.
sidebar:
  order: 1
---

## Overview

The evaluation engine tests LLMs across multiple domains with increasing complexity. Each test goes through a structured pipeline that produces a normalized score.

## Pipeline Steps

### 1. Test Loading

The engine loads test definitions from `test_definitions/<domain>/level_<n>/test_*.json`. Tests are organized by domain and level (1-5), with level weights matching the level number (level 3 tests count 3x).

### 2. System Prompt Resolution

System prompts are resolved using a 3-layer hierarchy:

```
Domain prompt → Level prompt → Test prompt
```

Each layer can either **overwrite** (replace) or **append** (concatenate) the prompt from the layer above. See [System Prompt Hierarchy](/guides/system-prompt-hierarchy) for details.

### 3. PASS 1: Full LLM Response

The engine sends the resolved system prompt + user prompt to the LLM and receives a complete response with reasoning.

```
System: "You are a math tutor..."
User: "What is 15 * 7?"
→ LLM: "Let me calculate: 15 * 7 = 105. The answer is 105."
```

Thinking tags (`<think>...</think>` or Gemma 4 format) are automatically stripped from the response.

### 4. Evaluator Routing

Based on the test's `evaluator_id`, the response is routed to the appropriate evaluator strategy:

| Evaluator | When Used |
|---|---|
| `KeywordEvaluator` | Conversation, fluency tests |
| `TwoPassEvaluator` | Math, reasoning, health |
| `SQLExecutorEvaluator` | SQL generation tests |
| `ToolCallEvaluator` | Tool/function calling tests |
| `CustomEvaluator` | Regex, LLM-judge, or hybrid |

### 5. PASS 2: Answer Extraction (Optional)

For evaluators that use PASS 2 (math, SQL, tool calling), a second LLM call extracts just the final answer in a strict format:

```
System: "Extract ONLY the numeric answer from this response."
User: "Let me calculate: 15 * 7 = 105. The answer is 105."
→ LLM: "105"
```

This separated extraction improves scoring accuracy by removing reasoning noise.

### 6. Scoring

Each evaluator produces an `EvaluationResult`:
- **score**: float from 0.0 to 1.0
- **status**: `passed` (score >= 0.7) or `failed`
- **details**: evaluator-specific metadata
- **extracted_answer**: the clean answer after extraction
- **pass2_used**: whether PASS 2 was used

### 7. Aggregation

Scores are aggregated per domain/level with weighted scoring:

```
Weighted Score = Sum(level_score * level_number) / Sum(level_number)
```

Level 5 tests count 5x more than level 1, rewarding performance on harder problems.

### 8. Persistence

All results are saved to SQLite:
- `evaluation_runs`: run metadata and overall score
- `test_results`: per-domain/level aggregate
- `individual_test_results`: every test with full prompt, response, and details
- `level_scores`: aggregated per domain/level

## Tool Calling Flow

For tool-calling tests, the engine runs a multi-turn loop:

1. Send prompt with tool definitions to LLM
2. LLM responds with `tool_calls` in its message
3. Engine executes tools using mock responses (from `test_definitions/tools/*.json`)
4. Tool results are sent back to LLM
5. Repeat until LLM gives a final text response (max 5 iterations)

The evaluator then checks if the correct tools were called with appropriate arguments.

## Real-Time Updates

During evaluation, the engine pushes log messages to a queue. The frontend polls `/api/log_poll` to display live progress, including:
- Current domain and level being tested
- Per-test pass/fail status
- Token usage and timing
- A color-coded progress matrix
