---
title: Installation
description: How to install and set up the Evonic LLM Evaluator.
---

## Prerequisites

- **Python 3.8+**
- **An LLM endpoint** — any OpenAI-compatible API (llama.cpp, Ollama, vLLM, OpenRouter, etc.)

## Clone and Install

```bash
git clone <your-repo-url> evonic-llm-eval
cd evonic-llm-eval
pip install -r requirements.txt
```

### Python Dependencies

| Package | Purpose |
|---|---|
| `flask>=3.0` | Web framework |
| `requests>=2.31` | HTTP client for LLM API |
| `python-dotenv>=1.0.0` | Environment variable loading |
| `anthropic>=0.40.0` | Anthropic API (optional, for improver module) |

### Optional Dependencies

For the Telegram channel integration (agent platform):

```bash
pip install python-telegram-bot
```

## Verify Installation

```bash
python3 -c "import flask; import requests; print('OK')"
```

## Next Steps

- [Configure your LLM endpoint](/getting-started/configuration)
- [Run your first evaluation](/getting-started/quickstart)
