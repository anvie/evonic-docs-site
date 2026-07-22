---
title: OpenAI Codex
description: Connect your ChatGPT Plus or Pro subscription to Evonic and use OpenAI models without per-token API fees.
---

If you have a **ChatGPT Plus** or **ChatGPT Pro** subscription, you can connect it directly to Evonic. No API keys, no per-token billing — just your existing subscription.

## How It Works

Instead of the usual API key approach, Codex uses a secure **OAuth 2.0 + PKCE** flow. You'll set up Codex as a provider just like any other model provider — the only difference is that you authorize it through your OpenAI account instead of pasting an API key.

Here's the overall flow:

1. **Create a provider** — add a new provider with API Format set to "Codex (OAuth)"
2. **Connect** — click Connect on the provider card to authorize via your OpenAI account
3. **Fetch models** — after connecting, fetch the list of available models from your subscription

Your data still flows through Evonic — OpenAI never sees it directly. The subscription gives you access to models like `gpt-5.6-sol`, `gpt-5.6-terra`, and `gpt-5.6-luna` with **no per-token charges**.

## Prerequisites

- An active **ChatGPT Plus** ($20/month) or **ChatGPT Pro** ($200/month) subscription
- Evonic running and accessible in your browser
- Internet connection (authentication requires reaching `auth.openai.com`)

## Connecting Your Subscription

Setting up Codex is a three-step process: create the provider, authorize it, then fetch your models.

### Step 1 — Create a Provider

Navigate to **Settings → Models** and click **Add Provider**. Fill in the provider form:

| Field | Value |
|---|---|
| **Display Name** | `OpenAI Codex` (or any name you prefer) |
| **Type** | `Remote` |
| **Base URL** | `https://chatgpt.com/backend-api/codex` |
| **API Key** | Leave empty — OAuth will fill this in |
| **API Format** | **Codex (OAuth)** |

Click **Save Provider**. A new provider card appears in the models grid with **Connect** and **Fetch Models** buttons.

### Step 2 — Connect & Authorize

On the provider card, click the green **Connect** button. A popup window opens, redirecting you to OpenAI's login page. Log in with your OpenAI account and approve the connection. OpenAI will ask you to confirm that Evonic can access your subscription.

Once authorized, Evonic exchanges the authorization code for secure tokens automatically. The provider card shows a green dot when connected.

:::tip[Remote access?]
If you're running Evonic on a remote server, the callback popup may not work. Paste the full callback URL from your browser address bar into the text area in the waiting modal.
:::

### Step 3 — Fetch Models

After connecting, click the **Fetch Models** button on the provider card. Evonic queries the Codex endpoint and lists all models available under your subscription. From the results, you can quickly add any model with one click.

That's it! Your Codex models are now ready to use — assign them to any agent like you would with any other model provider.

## Available Models

The models available depend on your subscription tier. After clicking **Fetch Models**, you'll see a list of what's available:

| Subscription | Typical Models |
|---|---|
| **ChatGPT Plus** | `gpt-5.6-sol`, `gpt-5.6-terra` |
| **ChatGPT Pro** | `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, plus extended context windows |

If the API doesn't return a model list, Evonic falls back to these defaults so you can still add them manually.

## Using Codex with Agents

Once connected and models are fetched, Codex models appear in the model dropdown when you create or edit an agent. Here's how it looks in your configuration:

```yaml
model:
  provider: openai-codex
  model_name: gpt-5.6-sol
```

The `provider` field matches the provider name you chose when creating it. The `model_name` is the model ID shown in the Fetch Models result.

From the CLI, you can verify the connection:

```bash
evonic model list
```

**Example output:**

```
ID                                    Name           Provider       Status
--------------------------------------------------------------------------
a1b2c3d4-...                         GPT-5.6 Sol     openai-codex   enabled
e5f6g7h8-...                         GPT-5.6 Terra   openai-codex   enabled
```

## Managing Your Connection

### Check Connection Status

The Codex card in **Settings → Models** shows a green indicator when connected. Click it to see token expiry details.

### Reconnecting

Tokens expire periodically. Evonic refreshes them automatically in the background. If the refresh fails — for example, if you changed your OpenAI password — just click **Connect** again to re-authorize.

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

- Make sure you clicked **Fetch Models** after connecting — models are not auto-discovered
- Check that your subscription is active at [chatgpt.com/account](https://chatgpt.com/account)
- If the API returns an empty list, try adding models manually using the fallback names (e.g., `gpt-5.6-sol`)

### "Token Expired" warning

- Tokens refresh automatically; the warning appears when the refresh window is closing
- If the warning persists for more than a few minutes, re-authorize by clicking **Connect** again

### Slow responses compared to API

Codex uses WebSocket transport with SSE fallback. If responses feel slow:
- Ensure your network connection is stable
- Check that WebSocket connections aren't blocked by a firewall or proxy
- The first request after a period of inactivity may have slightly higher latency
