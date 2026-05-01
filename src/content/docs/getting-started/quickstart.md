---
title: Quick Start
description: Create your first AI agent in minutes.
---

## Start the Server

```bash
./evonic start
```

Open `http://localhost:8080` in your browser.

## Create the Super Agent (First-Time Setup)

On a fresh Evonic installation, you must create the **Super Agent** first. This is the platform administrator — it manages other agents, applies skillsets, and orchestrates your entire AI workflow.

1. Navigate to the **Agent Platform** section at `/agents`
2. Click **+ New Agent**
3. Fill in:
   - **Agent ID**: a short slug (e.g., `siwa`)
   - **Name**: your Super Agent's display name (e.g., "Siwa Miwa")
   - **Description**: e.g., "Super agent — platform administrator"
4. Click **Create** — the first agent is automatically designated as the Super Agent

:::tip[Why a Super Agent?]
The Super Agent has elevated privileges: it can't be disabled, it creates and manages other agents, and it handles platform-level operations. [Read more about the Super Agent →](/agents/creating-agents/#super-agent)
:::

## Create Your First Agent

1. Navigate to the **Agent Platform** section
2. Click **Create Agent**
3. Configure your agent:
   - Name and description
   - System prompt
   - Model endpoint (local or remote)
   - Knowledge base (optional)
4. Click **Save** to create your agent

## Connect to a Channel

Choose a channel to deploy your agent:

- **Telegram**: Set up a Telegram bot and connect it
- **WhatsApp**: Connect via WhatsApp Business API
- **Discord**: Add your agent to a Discord server

## Test Your Agent

Send a message through your connected channel or use the web interface to test your agent's responses.

## What You Can Do

With your agent, you can:

- Answer questions using your knowledge base
- Execute tools (calculator, file operations, API calls)
- Perform multi-step reasoning tasks
- Handle conversations across multiple channels

## Next Steps

- [Install and configure local models](/local-models/overview)
- [Create more agents](/agents/creating-agents)
- [Add custom skills](/skills/skills)
- [Explore model evaluation](/evaluation/overview)
