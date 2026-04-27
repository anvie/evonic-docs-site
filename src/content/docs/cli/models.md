---
title: Model Management
description: CLI commands for managing LLM models in Evonic.
---

Commands for listing, inspecting, adding, and removing LLM model configurations.

## `evonic model list`

List all configured LLM models.

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

## `evonic model get <model_id>`

Show detailed information about a specific model.

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

## `evonic model add <model_id>`

Add a new LLM model configuration.

```bash
evonic model add <model_id> --name <name> --provider <provider> [--api-key <key>] [--base-url <url>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--name` | Yes | Display name for the model |
| `--provider` | Yes | Provider (e.g. `openai`, `anthropic`, `groq`, `openrouter`, `llama.cpp`) |
| `--api-key` | No | API key for the provider |
| `--base-url` | No | Base URL for the API endpoint |

**Example:**

```bash
# Add OpenAI model
evonic model add gpt4o --name "GPT-4o" --provider openai --api-key "sk-..." --base-url "https://api.openai.com/v1"

# Add local llama.cpp model
evonic model add local_llama --name "Local Llama 3" --provider llama.cpp --base-url "http://localhost:8080/v1"
```

**Output:**

```
Model added: GPT-4o (gpt4o)
```

## `evonic model rm <model_id>`

Remove a model configuration. Requires interactive confirmation.

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

## Next Steps

- [Skill Management](/cli/skills)
- [Skillset Management](/cli/skillsets)
