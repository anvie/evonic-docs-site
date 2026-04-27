---
title: Local Models Overview
description: Why local-first, benefits, and use cases for running AI models locally.
---

# Local Models Overview

The Evonic AI is designed with a **local-first** philosophy. By running AI models locally, you gain full control over your data, privacy, and inference costs — while still accessing the latest open-source models.

## Why Local-First?

### Privacy & Data Security
- Your data never leaves your infrastructure
- No third-party API calls or data sharing
- Full compliance with data protection regulations

### Cost Efficiency
- No per-token or per-request fees
- Predictable infrastructure costs
- Scale without worrying about API rate limits

### Flexibility & Control
- Choose the model that best fits your use case
- Fine-tune and customize models for your domain
- Run models on your own hardware or cloud instances

### Offline Capability
- Operate without internet connectivity
- Reliable in air-gapped environments
- No dependency on external services

## Supported Local Model Runners

The Evonic AI supports multiple local model runners:

| Runner | Best For | Hardware Requirements |
|--------|----------|----------------------|
| [Ollama](/local-models/ollama/) | Quick setup, multi-model support | Moderate (CPU/GPU) |
| [llama.cpp](/local-models/llama-cpp/) | Maximum portability, edge devices | Low to Moderate |
| [vLLM](/local-models/vllm/) | High-throughput production workloads | High (GPU recommended) |

## Use Cases

- **Internal Knowledge Bots** — Connect your team's documentation to AI agents
- **Customer Support** — Deploy agents on-premise for sensitive customer data
- **Research & Analysis** — Run models on proprietary datasets without sharing
- **Edge Deployment** — Run agents on devices with limited connectivity
- **Development & Testing** — Iterate quickly with local models before production

## Managing Models via CLI

### List Models

View all configured LLM models:

```bash
evonic model list
```

**Output:**

```
ID                                    Name              Provider    Status
--------------------------------------------------------------------------
cf4cbe3b-1e2f-4ce7-811d-bb0a24ac09aa  Gemma4-local      llama.cpp   enabled
e1e18b95-dbe0-4b94-bd1a-39c40ab40268  Grok-4.1-Fast     openrouter  enabled
603b799f-c203-44ad-871a-0bb7394f0aa3  Kimi-K2-Thinking  openrouter  enabled
```

### Get Model Details

View detailed information about a specific model:

```bash
evonic model get 603b799f-c203-44ad-871a-0bb7394f0aa3
```

**Output:**

```
ID:          603b799f-c203-44ad-871a-0bb7394f0aa3
Name:        Kimi-K2-Thinking
Type:        remote
Provider:    openrouter
Model Name:  moonshotai/kimi-k2-thinking
Base URL:    https://openrouter.ai/api/v1
API Key:     ***afb76a
Max Tokens:  32768
Timeout:     60
Temperature: None
Thinking:    yes
Enabled:     yes
Default:     no
```

### Add a Model

Add a new LLM model configuration:

```bash
# Add OpenAI model
evonic model add gpt4o --name "GPT-4o" --provider openai --api-key "sk-..." --base-url "https://api.openai.com/v1"

# Add local llama.cpp model
evonic model add local_llama --name "Local Llama 3" --provider llama.cpp --base-url "http://localhost:8080/v1"
```

**Options:**

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | Yes | Display name for the model |
| `--provider` | Yes | Provider (e.g. `openai`, `anthropic`, `groq`, `openrouter`, `llama.cpp`) |
| `--api-key` | No | API key for the provider |
| `--base-url` | No | Base URL for the API endpoint |

### Remove a Model

Remove a model configuration. Requires interactive confirmation:

```bash
evonic model rm gpt4o
```

**Output:**

```
Model to remove:
  ID:        gpt4o
  Name:      GPT-4o
  Provider:  openai
  Status:    enabled
Are you sure? [y/N]: y
Model removed: gpt4o
```

## Getting Started

1. Choose your model runner (Ollama, llama.cpp, or vLLM)
2. Install and configure the runner
3. Select a model suitable for your hardware
4. Configure the Evonic AI to connect to your local model
5. Start building your agents!

For detailed setup instructions, see the individual runner guides.
