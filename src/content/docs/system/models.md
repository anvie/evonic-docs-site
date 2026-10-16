---
title: Models
description: "Model configuration: managing LLM models for agents."
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
- **Web UI**: Manage models from the Models page (`/system/models`)

Each model has a provider (e.g., `openai`, `anthropic`, `llama.cpp`), a base URL, API key, and configuration options like max tokens, timeout, and temperature.

## API Format Translation

*Introduced in v0.7.0.*

The LLM client now supports translating between **OpenAI** and **Anthropic API formats**, configurable per-model via an **API Format** dropdown in the model modal.

| Format | Description |
|--------|-------------|
| **OpenAI** | Standard chat completions format (default for most providers) |
| **Anthropic** | Anthropic's native Messages API format |
| **Claude CLI** | Drives the official `claude` CLI in print mode — use a Claude subscription (Pro/Max) without an API key (v1.5.0) |

### How It Works

When you set a model's API format to **Anthropic**, the LLM client:

1. Takes the internal OpenAI-format request (messages, tools, system prompt)
2. Translates it to Anthropic's Messages API format
3. Sends the translated request to the model's base URL
4. Translates the Anthropic-format response back to the internal format

This means you can connect **Claude and other Anthropic-compatible models natively** without a proxy. Just set the base URL to an Anthropic-compatible endpoint and switch the API format to Anthropic.

### Configuration

1. Go to **System → Models** (`/system/models`)
2. Create a new model or edit an existing one
3. Find the **API Format** dropdown in the model form
4. Select **Anthropic** for Anthropic-compatible models
5. Configure the provider, base URL, and API key as usual

The format is set **per-model**, so you can mix OpenAI-format and Anthropic-format models in the same deployment.

## Claude CLI Subscription Provider

*Introduced in v1.5.0.*

The **Claude CLI** API format lets you use an existing Claude subscription (Pro/Max) through the official `claude` CLI — no Anthropic API key required. Evonic spawns the CLI in print mode for each request, and the Claude Code client talks to Anthropic directly.

**How it works:**

1. Install the official `claude` CLI on the machine running Evonic (it must be on the server's `PATH`).
2. Log in once with `claude auth login` and complete the subscription sign-in.
3. Create a model in **System → Models** and set its API format to **Claude CLI**.

**What to know:**

- **Your tokens stay yours** — Evonic never reads, copies, or refreshes the CLI's OAuth tokens.
- **Plain LLM mode** — the CLI's built-in tools, settings, MCP servers, and session persistence are disabled, so Evonic's own tools, workplaces, and safety checks stay in charge of every action.
- **Native image input** — images sent to a Claude CLI model are passed through as native Claude image blocks (no base64 workaround needed).
- **Model choices** — the CLI's available Claude models are offered in the model form.

### Configuration

1. Go to **System → Models** (`/system/models`)
2. Create a new model (or edit an existing one)
3. Set **API Format** to **Claude CLI**
4. Pick a Claude model and save — no base URL or API key needed

## Duplicating a Model

*Introduced in v0.2.6.*

Instead of creating a new model from scratch, you can **duplicate an existing model** and tweak its settings. This is useful when you want to:

- Create a variant of a model with different parameters (e.g., higher temperature)
- Set up the same model with a different API key or base URL
- Copy a model from one provider setup to another

### Via Web UI

1. Go to **System → Models** (`/system/models`)
2. Find the model you want to duplicate
3. Click the **Duplicate** button (copy icon)
4. A new model form opens pre-filled with the original's settings
5. Adjust the settings as needed (name, provider, parameters, etc.)
6. Click **Save**

### Via CLI

```bash
evonic model clone <source_model_id> --id <new_model_id> [--name "New Name"]
```

**Example:**

```bash
evonic model clone gpt-4 --id gpt-4-hightemp --name "GPT-4 High Temp" --temperature 0.9
```

This clones the `gpt-4` model configuration and creates a new model called `gpt-4-hightemp` with a higher temperature setting.

### Cloning vs Creating

| Aspect | Clone | Create from scratch |
|--------|-------|-------------------|
| Time | Instant — all fields pre-filled | Manual entry of every field |
| Error-prone | Low — settings are copied | High — easy to mistype config |
| Use case | Tweaking parameters | Adding completely new providers |

## New Model Providers

*Introduced in v0.2.0.*

Evonic supports the following additional model providers beyond the standard OpenAI-compatible endpoints:

| Provider | Description | Configuration |
|----------|-------------|---------------|
| **OpenCode Zen** | Optimized for code generation and analysis | Set `provider` to `opencode-zen` in model config |
| **OpenCode Go** | Lightweight code-focused model for edge devices | Set `provider` to `opencode-go` in model config |
| **Ollama Cloud** | Cloud-hosted Ollama models for remote inference | Set `provider` to `ollama-cloud` with your API key |

These providers follow the same configuration structure as other models but may have provider-specific parameters available in the Advanced Settings section.

## Learn More

- [Local Models Overview](/local-models/overview): why local-first and model selection
- [Ollama](/local-models/ollama/): setup and configuration
- [llama.cpp](/local-models/llama-cpp/): setup and configuration
- [vLLM](/local-models/vllm/): setup and configuration
- [Model Selection](/local-models/model-selection/)
- [Quantization](/local-models/quantization/)

