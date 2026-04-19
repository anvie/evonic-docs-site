---
title: Quick Start
description: Run your first LLM evaluation in minutes.
---

## Start the Server

```bash
python3 app.py
```

Open `http://localhost:8080` in your browser.

## Run an Evaluation

1. Click **Start Evaluation** on the dashboard
2. Watch the real-time progress matrix fill in as each domain/level is tested
3. Results are color-coded: green (passed), red (failed), yellow (partial)
4. Click any cell to see the full prompt, response, and scoring details

## What Gets Tested

The evaluator runs through all enabled domains and their 5 complexity levels:

| Domain | What it Tests |
|---|---|
| `conversation` | Indonesian language fluency, keyword understanding |
| `math` | Arithmetic to multi-step word problems |
| `sql` | SQL generation against a real SQLite database |
| `tool_calling` | Function calling with OpenAI tool format |
| `reasoning` | Logical deduction and problem solving |
| `health` | Medical/health knowledge questions |
| `needle_in_haystack` | Finding specific info in long contexts |

Each domain has up to 5 levels of increasing difficulty. Tests are defined as JSON files in `test_definitions/`.

## Headless Mode (CLI)

Run evaluations without the web UI:

```bash
python3 run_headless.py --endpoint http://localhost:8080/v1 --model default
```

## View History

All evaluation runs are saved automatically. Visit `/history` to browse past results, compare runs, and review per-test details.

## Next Steps

- [Understand the evaluation workflow](/guides/evaluation-workflow)
- [Create custom test definitions](/guides/test-definitions)
- [Set up an agent for production serving](/agents/overview)
