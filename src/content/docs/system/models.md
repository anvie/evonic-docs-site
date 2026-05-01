---
title: Models
description: Model configuration: managing LLM models for agents.
sidebar:
  order: 5
---

Models define the language models that power agent conversations. Evonic supports multiple model providers and local inference engines.

## Supported Runners

| Runner | Best For | Hardware Requirements |
|--------|----------|----------------------|
| [Ollama](/local-models/ollama/) | Quick setup, multi-model support | Moderate (CPU/GPU) |
| [llama.cpp](/local-models/llama-cpp/) | Maximum portability, edge devices | Low to Moderate |
| [vLLM](/local-models/vllm/) | High-throughput production workloads | High (GPU recommended) |

## Model Configuration

Models are managed via:

- **CLI**: `evonic model list`, `evonic model add`, `evonic model rm`
- **API**: REST endpoints for programmatic management

Each model has a provider (e.g., `openai`, `anthropic`, `llama.cpp`), a base URL, API key, and configuration options like max tokens, timeout, and temperature.

## Learn More

- [Local Models Overview](/local-models/overview): why local-first and model selection
- [Ollama](/local-models/ollama/): setup and configuration
- [llama.cpp](/local-models/llama-cpp/): setup and configuration
- [vLLM](/local-models/vllm/): setup and configuration
- [Model Selection](/local-models/model-selection/)
- [Quantization](/local-models/quantization/)
