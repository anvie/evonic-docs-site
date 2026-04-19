---
title: Installation
description: How to install and set up the Evonic AI Platform.
---

## Prerequisites

- **Python 3.8+**
- **An LLM endpoint** — any OpenAI-compatible API (llama.cpp, Ollama, vLLM, OpenRouter, etc.)
- **Git** — for cloning the repository

## Clone and Install

```bash
git clone <your-repo-url> evonic-ai-platform
cd evonic-ai-platform
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

## Install a Local Model Runner (Optional)

### Ollama (Recommended for Beginners)
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/
```

### llama.cpp (For Edge/CPU-Only)
```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
cmake -B build
cmake --build build --config Release -j $(nproc)
```

### vLLM (For High-Throughput Production)
```bash
pip install vllm
```

## Verify Installation

```bash
python3 -c "import flask; import requests; print('OK')"
```

## Next Steps

- [Configure your LLM endpoint](/getting-started/configuration)
- [Set up a local model](/local-models/overview)
- [Create your first agent](/getting-started/quickstart)
