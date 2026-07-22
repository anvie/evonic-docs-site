---
title: OpenAI Codex
description: Connect your ChatGPT Plus or Pro subscription to Evonic and use OpenAI models without per-token API fees.
---

If you have a **ChatGPT Plus** or **ChatGPT Pro** subscription, you can connect it directly to Evonic. No API keys, no per-token billing — just your existing subscription.

## How It Works

Instead of the usual API key approach, Codex uses a secure **OAuth 2.0** login flow:

1. You click **Connect Codex** in the Evonic settings
2. Evonic redirects you to OpenAI's login page
3. You authorize Evonic to use your subscription
4. Tokens are securely stored, and your available models are discovered automatically

Your data still flows through Evonic — OpenAI never sees it directly. The subscription gives you access to models like `gpt-5.4`, `gpt-5.5`, and `gpt-5.6` with **no per-token charges**.

## Prerequisites

- An active **ChatGPT Plus** ($20/month) or **ChatGPT Pro** ($200/month) subscription
- Evonic running and accessible in your browser
- Internet connection (authentication requires reaching `auth.openai.com`)

## Connecting Your Subscription

### Step 1 — Open Model Settings

Navigate to **Settings → Models** in the Evonic web UI. Look for the **OpenAI Codex** section at the top of the models grid.

### Step 2 — Click Connect

Click the **Connect Codex** button. A popup window opens, taking you to OpenAI's authorization page.

### Step 3 — Authorize

Log in with your OpenAI account and approve the connection. OpenAI will ask you to confirm that Evonic can access your subscription.

### Step 4 — Wait for Model Discovery

Once authorized, Evonic automatically exchanges the authorization code for secure tokens and discovers all available models in your subscription. You'll see them appear as model cards in the settings page.

### Step 5 — Done!

The Codex indicator turns green. Your models are ready to use — just assign them to any agent like you would with any other model provider.

## Available Models

The models available depend on your subscription tier:

| Subscription | Typical Models |
|---|---|
| **ChatGPT Plus** | `gpt-5.4`, `gpt-5.5` |
| **ChatGPT Pro** | `gpt-5.4`, `gpt-5.5`, `gpt-5.6`, plus extended context windows |

After connecting, Evonic automatically detects which models are available to your account and displays them in the settings panel.

## Using Codex with Agents

Once connected, Codex models appear in the model dropdown when you create or edit an agent. Here's how it looks in your configuration:

```yaml
model:
  provider: codex
  model_name: gpt-5.4
```

From the CLI, you can verify the connection:

```bash
evonic model list
```

**Example output:**

```
ID                                    Name         Provider    Status
--------------------------------------------------------------------------
a1b2c3d4-...                         GPT-5.4       codex       enabled
e5f6g7h8-...                         GPT-5.5       codex       enabled
```

## Managing Your Connection

### Check Connection Status

The Codex card in **Settings → Models** shows a green indicator when connected. Click it to see token expiry details.

### Reconnecting

Tokens expire periodically. Evonic refreshes them automatically in the background. If the refresh fails — for example, if you changed your OpenAI password — just click **Connect Codex** again to re-authorize.

### Disconnecting

To remove the connection, click **Disconnect** on the Codex card. This deletes all stored tokens and removes Codex models from your agent configuration. You can reconnect at any time.

## How It Differs from Standard OpenAI API

| Feature | Standard API | Codex (Subscription) |
|---|---|---|
| Authentication | API key (`sk-...`) | OAuth 2.0 login |
| Billing | Per-token | Included in subscription |
| Endpoint | `api.openai.com/v1` | `chatgpt.com/backend-api/codex` |
| API format | Chat Completions | Responses API |
| Streaming | SSE | WebSocket (SSE fallback) |
| Setup | Paste API key | One-click OAuth |

For most users, Codex is the simpler option — no need to manage API keys or monitor token usage.

## Troubleshooting

### "Connection Failed" after clicking Connect

- Make sure your browser allows popups from Evonic
- Check that `auth.openai.com` is reachable from your network
- Verify your ChatGPT subscription is active at [chatgpt.com/account](https://chatgpt.com/account)

### Models not appearing after authorization

- Wait a few seconds — model discovery runs automatically after the OAuth callback
- Try refreshing the settings page
- If the issue persists, disconnect and reconnect

### "Token Expired" warning

- Tokens refresh automatically; the warning appears when the refresh window is closing
- If the warning persists for more than a few minutes, re-authorize by clicking **Connect Codex** again

### Slow responses compared to API

Codex uses WebSocket transport with SSE fallback. If responses feel slow:
- Ensure your network connection is stable
- Check that WebSocket connections aren't blocked by a firewall or proxy
- The first request after a period of inactivity may have slightly higher latency
