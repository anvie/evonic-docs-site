---
title: Setup Wizard
description: Walkthrough Evonic's first-time setup wizard and Telegram bot binding prompt.
---

When you first access Evonic (either via the web dashboard at `http://localhost:8080` or after running `evonic setup` from the CLI), you'll be greeted by the **Setup Wizard**. This guides you through configuring your LLM provider, creating the Super Agent, and securing your dashboard — all in four steps.

After the wizard completes, you'll land on your Super Agent's detail page, where Evonic prompts you to **bind a Telegram bot** — the easiest way to start chatting with your agent.

---

## Wizard Overview

The setup wizard has four steps, shown in the step indicator at the top:

1. **Provider** — Choose an LLM provider and configure the endpoint
2. **Agent** — Name your Super Agent and set its communication style
3. **Review** — Confirm your selections before creating
4. **Password** — Secure the web dashboard

### Visual Layout

```
┌──────────────────────────────────────────┐
│    ● ── ○ ── ○ ── ○                     │
│    1    2    3    4                      │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │ LLM Provider & Model             │   │
│   │                                  │   │
│   │ ○ OpenRouter (recommended)       │   │
│   │ ○ Together AI                    │   │
│   │ ○ Ollama  (local)                │   │
│   │ ○ llama.cpp (local)              │   │
│   │ ○ Custom                         │   │
│   │                                  │   │
│   │ Base URL:  [__________________]  │   │
│   │ API Key:   [__________________]  │   │
│   │ Model:     [__________________]  │   │
│   │                                  │   │
│   │ [Test Connection]                │   │
│   │                          [Next →]│   │
│   └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

---

## Step 1: LLM Provider & Model

Choose where Evonic sends requests for AI responses. The wizard comes with several built-in providers:

| Provider | Type | API Key Required | Best For |
|---|---|---|---|
| **OpenRouter** | Cloud | ✅ | Getting started fast — one API key, many models |
| **Together AI** | Cloud | ✅ | High-throughput, open models |
| **Ollama Cloud** | Cloud | ✅ | Managed Ollama endpoint |
| **OpenCode Zen** | Cloud | ✅ | Always-thinking models |
| **OpenCode Go** | Cloud | ✅ | Kimi K2, DeepSeek V4, MiniMax M2 |
| **Ollama** | Local | ❌ | Running models on your machine |
| **llama.cpp** | Local | ❌ | CPU-friendly, edge devices |
| **Custom** | Any | Varies | Any OpenAI-compatible endpoint |

### What to fill in

- **Base URL** — Auto-filled for known providers. For custom endpoints, enter your full URL (e.g., `http://localhost:11434/v1`).
- **API Key** — Required for cloud providers. Optional for local ones.
- **Model Name** — The model identifier sent to the API, e.g., `openai/gpt-4o-mini` or `llama3`.

### Test Connection

Click **Test Connection** before proceeding. The wizard pings the `/models` endpoint (or `/tags` for Ollama Cloud) to verify:

- ✅ **Connected** — your endpoint is reachable and responding
- ❌ **Authentication failed** — check your API key
- ❌ **Connection refused** — is the server running?

```bash
# Example: verifying manually via curl
curl -s https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer sk-..." | jq '.data | length'
```

---

## Step 2: Super Agent

Configure the platform administrator — this agent manages everything in Evonic.

### Agent Name & ID

- **Agent Name** — A human-readable display name (e.g., "Siwa Admin")
- **Agent ID** — Auto-derived from the name. Lowercase alphanumeric and underscores only. **Cannot be changed later.**

  ```text
  "My Admin Agent"  →  my_admin_agent
  "Budi Siwa"       →  budi_siwa
  ```

### Communication Style

Choose how your Super Agent communicates:

| Style | Best For |
|---|---|
| **Professional** | Clear, formal, business communication |
| **Friendly** | Warm, approachable, conversational |
| **Concise** | Minimal, to-the-point, no fluff |
| **Technical** | Detailed, precise, assumes technical audience |
| **Custom** | Define your own tone and style instructions |

### Language Preference

- **English** — Always responds in English
- **Bahasa Indonesia** — Always responds in Bahasa Indonesia
- **Adaptive** — Follows the user's language

---

## Step 3: Review & Create

A summary screen shows all your selections before anything is created. Double-check:

- Provider, model, and base URL
- Agent name and ID
- Communication style and language

Click **Next** when everything looks correct.

---

## Step 4: Password

Set a password to secure your web dashboard. This is used for logging in at `/login`.

- Minimum **6 characters**
- Enter the password twice for confirmation

Click **Create Platform** to finish the setup.

---

## What Happens After Setup

Once you click **Create Platform**, Evonic:

1. Creates the LLM model entry in the database and sets it as default
2. Builds the system prompt with your chosen tone and language
3. Creates the Super Agent with default tools (`bash`, `runpy`, `patch`, `write_file`, `read_file`)
4. Writes the system prompt to `agents/{agent_id}/SYSTEM.md`
5. Copies the default knowledge base file
6. Enables all installed plugins and skills
7. Saves your admin password to `.env`
8. Redirects you to the agent detail page at `/agents/{agent_id}`

---

## Telegram Bot Binding Prompt

After the wizard redirects you to your Super Agent's page, you'll see a prompt to **connect a Telegram bot** — this is the fastest way to start interacting with your agent.

### What You'll See

On the agent detail page, click the **Channels** tab, then click **+ Add Channel**:

```
┌─────────────────────────────────────────────┐
│  + Add Channel                              │
├─────────────────────────────────────────────┤
│  Channel Type:  [Telegram ▼]                │
│                                              │
│  Channel Name:  [My Telegram Bot        ]   │
│                                              │
│  Bot Token:     [_______________________]   │
│                 (paste your bot token here)  │
│                                              │
│  [Cancel]                    [Add]           │
└─────────────────────────────────────────────┘
```

### Getting Your Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the prompts to create a new bot
3. BotFather will give you an **HTTP API token** that looks like:

   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-ABCDEF
   ```

4. Copy this token and paste it into the **Bot Token** field in Evonic

:::tip
Keep your bot token secret. Anyone with the token can control your bot. If it's ever compromised, use `@BotFather`'s `/revoke` command immediately.
:::

### Verification

After pasting the token and clicking **Add**, Evonic will:

1. Validate the token format (must match `^\d+:[\w-]+$`)
2. Attempt to connect to the Telegram API using the token
3. If successful, the channel card appears in your Channels tab with a green **Running** status:

   ```
   ┌──────────────────────────────────┐
   │  📱 Telegram                     │
   │  My Telegram Bot                 │
   │  ● Running                       │
   │                                  │
   │  [Detail]  [Disconnect]          │
   └──────────────────────────────────┘
   ```

4. If the token is invalid or already in use, an error message appears:
   - **"Conflict: terminated by other getUpdates request"** — another bot instance is using this token
   - **"Bot token is missing"** — the token field was left empty

### Common Token Issues

| Error | Cause | Fix |
|---|---|---|
| `Conflict` | Another instance is using the same bot token | Stop the other instance or create a new bot |
| `Not Found` | Token is incorrect or doesn't belong to any bot | Double-check the token from BotFather |
| `Missing` | Token field left empty | Paste a valid bot token |
| `Invalid format` | Token doesn't match expected pattern | Ensure full token was copied (no spaces) |

---

## Next Steps After Binding

Once your Telegram bot is connected and running:

1. **Send a message to your bot** — open Telegram, find your bot, and send `/start`
2. **If the channel is restricted** (default), you'll receive a **pairing code** — a 6-character code like `XK4M9Q`
3. **Approve the pairing code** — in the Evonic UI, open the Channel Detail Modal for your Telegram channel and approve the pending request
4. **Start chatting** — your agent is now accessible via Telegram

:::tip[Pairing codes expire after 5 minutes]
If the code expires, just send another message to the bot to get a fresh one.
:::

For more details on channel modes, allowlists, and pairing codes, see the [Channels guide](/agents/channels).

---

## What's Next

- [Manage your agent's channels](/agents/channels)
- [Configure more agents](/agents/creating-agents)
- [Add custom skills](/skills/skills)
- [Explore model evaluation](/evaluation/overview)
