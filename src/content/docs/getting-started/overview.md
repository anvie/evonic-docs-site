---
title: Overview
description: Welcome to Evonic — a local-first agentic AI platform for open models.
---

# Getting Started with Evonic

Welcome to Evonic — a powerful, local-first platform for building and deploying AI agents. Whether you're running a personal assistant, a multi-agent workflow, or a production deployment, Evonic gives you the tools to design, orchestrate, and manage agents at scale.

![Evonic mascot](/img/mascot.png)

---

## What is Evonic?

Evonic is an **agentic AI platform** built for open models. It lets you create AI agents powered by any OpenAI-compatible LLM — local, cloud, or anything in between. Agents can use tools, access knowledge bases, communicate across channels, and collaborate with each other.

### Key Features

- **Agent platform** — design and deploy AI agents with custom models, tools, and knowledge bases
- **Multi-channel** — connect agents to Telegram, WhatsApp, Discord, and the web
- **Tool system** — extend agent capabilities with tools, skills, and plugins
- **Evaluation** — test and benchmark agent performance
- **Isolated sandbox** — safe execution of agent code in Docker containers
- **Evonet** — mesh network for multi-device agent deployment

---

## Quick Start

1. [Install Evonic](/getting-started/installation) — one-command install or manual setup
2. [Configure](/getting-started/configuration) — set up your environment and model endpoints
3. [Create a Super Agent](/getting-started/quickstart) — set up the platform administrator
4. [Build your first agent](/getting-started/quickstart#create-your-first-agent) — test it right away

---

## What's New in v0.3.19

### New Branding

The Evonic mascot has been updated! The new **mascot.png** logo appears in the navigation bar and throughout the UI, giving the platform a fresh, modern look.

### Portal Feature

Agents can now access external directories through virtual path mapping — the **Portal** system. This allows agents to read and write files on local, SSH, or Evonet-connected remote filesystems using `/_portal/` paths.

### Improved Sandbox

Sandbox containers now use the `evonic-<session-id>` naming pattern, include automatic stale container cleanup, and offer the new `evonic clear-sandbox` CLI command for manual cleanup.

---

## Next Steps

- [Installation](/getting-started/installation) — full install guide
- [Configuration](/getting-started/configuration) — environment setup
- [Quick Start](/getting-started/quickstart) — create your first agent
- [Setup Wizard](/getting-started/setup-wizard) — guided first-time setup
