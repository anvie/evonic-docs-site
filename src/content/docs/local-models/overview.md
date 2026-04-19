---
title: Local Models Overview
description: Why local-first, benefits, and use cases for running AI models locally.
---

# Local Models Overview

The Evonic AI Platform is designed with a **local-first** philosophy. By running AI models locally, you gain full control over your data, privacy, and inference costs — while still accessing the latest open-source models.

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

The Evonic AI Platform supports multiple local model runners:

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

## Getting Started

1. Choose your model runner (Ollama, llama.cpp, or vLLM)
2. Install and configure the runner
3. Select a model suitable for your hardware
4. Configure the Evonic AI Platform to connect to your local model
5. Start building your agents!

For detailed setup instructions, see the individual runner guides.
