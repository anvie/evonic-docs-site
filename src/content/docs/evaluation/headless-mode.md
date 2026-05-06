---
title: Headless Mode
description: Run evaluations from the command line without the web UI.
sidebar:
  order: 6
---

## Usage

```bash
python3 run_headless.py --endpoint http://localhost:8080/v1 --model default
```

## Options

| Flag | Description |
|---|---|
| `--endpoint` | LLM API base URL (e.g., `http://localhost:8080/v1`) |
| `--model` | Model name to use for evaluation |
| `--domains` | Comma-separated list of domains to test (default: all) |

## Example

Run only math and SQL domains:

```bash
python3 run_headless.py \
  --endpoint https://openrouter.ai/api/v1 \
  --model moonshotai/kimi-k2-thinking \
  --domains math,sql
```

## Output

Results are saved to the same SQLite database as the web UI. After a headless run, you can view the results in the web interface at `/history`.

The CLI outputs a summary to stdout with overall scores per domain.
