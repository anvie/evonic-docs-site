---
title: GitHub Webhook Plugin
description: Receive GitHub webhooks and notify agents for automated tasks per event type.
sidebar:
  order: 10
---

## Overview

The **GitHub Webhook** plugin receives incoming webhooks from GitHub and forwards them to Evonic agents for processing. It supports multiple event types with configurable filters, prompt templates, and per-event agent assignments.

## Installation

The plugin is available as a built-in plugin under `plugins/github_webhook/`. Enable it from the **Plugins** page in the Web UI or via the CLI.

## Configuration

### Variables

| Variable | Type | Description |
|----------|------|-------------|
| `WEBHOOK_SECRET` | string | HMAC-SHA256 secret key for verifying incoming webhook signatures |
| `RELEASE_AGENT_ID` | string | Agent to notify on release events (leave empty to ignore) |
| `RELEASE_PROMPT` | textarea | Prompt template for release events |
| `RELEASE_FILTERS` | textarea | JSON filter array for release events |
| `PR_AGENT_ID` | string | Agent to notify on pull request events |
| `PR_PROMPT` | textarea | Prompt template for PR events |
| `PR_FILTERS` | textarea | JSON filter array for PR events |
| `ISSUES_AGENT_ID` | string | Agent to notify on issues events |
| `ISSUES_PROMPT` | textarea | Prompt template for issues events |
| `ISSUES_FILTERS` | textarea | JSON filter array for issues events |
| `PUSH_AGENT_ID` | string | Agent to notify on push events |
| `PUSH_PROMPT` | textarea | Prompt template for push events |
| `PUSH_FILTERS` | textarea | JSON filter array for push events |

## Webhook URL

Once configured, set your GitHub webhook to point to:

```
https://your-evonic-instance.com/webhooks/github
```

Make sure to set the **Content type** to `application/json` and configure the **Secret** to match your `WEBHOOK_SECRET`.

## Event Types

The plugin supports four event groups:

| Event Group | Trigger | Prompt Variables |
|-------------|---------|-----------------|
| **Release** | A release is published | `{{tag_name}}`, `{{name}}`, `{{body}}`, `{{html_url}}`, `{{repository}}`, `{{action}}` |
| **Pull Request** | PR is opened, closed, etc. | `{{title}}`, `{{action}}`, `{{html_url}}`, `{{body}}`, `{{repository}}`, `{{state}}` |
| **Issues** | Issue is opened, closed, etc. | `{{title}}`, `{{action}}`, `{{html_url}}`, `{{body}}`, `{{repository}}`, `{{state}}` |
| **Push** | Code is pushed to a branch | `{{ref}}`, `{{commits_count}}`, `{{repository}}`, `{{compare}}` |

## Input Filter

*Introduced in v0.3.19.*

Each event group supports a **filter configuration** that lets you control which webhook payloads trigger notifications. Filters are defined as a JSON array and are evaluated before notifying the agent.

### Filter Format

```json
[
  {
    "field": "release.prerelease",
    "match": "equals",
    "value": "false"
  },
  {
    "field": "action",
    "match": "equals",
    "value": "opened"
  },
  {
    "field": "ref",
    "match": "regex",
    "value": "^refs/heads/main$"
  }
]
```

### Filter Fields

| Field | Description |
|-------|-------------|
| `field` | The JSON path in the webhook payload (e.g., `release.prerelease`, `action`, `ref`) |
| `match` | Match strategy: `equals` or `regex` |
| `value` | The value to match against |

### How Filters Work

- **All filters must match** for the notification to be sent (AND logic)
- If the filter array is empty, the event always fires
- If no agent is configured for an event type, the event is ignored regardless of filters

### Example: Only Production Releases

Only fire when a release is **not** a prerelease:

```json
[
  {
    "field": "release.prerelease",
    "match": "equals",
    "value": "false"
  }
]
```

### Example: Only Main Branch Pushes

Only fire for pushes to the `main` branch:

```json
[
  {
    "field": "ref",
    "match": "regex",
    "value": "^refs/heads/main$"
  }
]
```

## Prompt Templates

Each event group uses a **prompt template** that defines what the agent receives when a webhook fires. Templates use `{{variable}}` placeholders that are replaced with data from the webhook payload.

### Default Templates

The plugin comes with sensible defaults for each event type. For example, the release template:

> A new release has been published for Evonic. Please create a documentation task for this release.
>
> **Release Details:**
> - Tag: {{tag_name}}
> - Name: {{name}}
> - Repository: {{repository}}
> - URL: {{html_url}}
>
> **Release Notes:**
> {{body}}

You can customize the prompt template for each event type to control how the agent processes the webhook.

## Security

- **Webhook Secret**: All incoming webhooks are verified using HMAC-SHA256 signature matching
- **Secret visibility**: In v0.3.19, the webhook secret is shown as plain text (instead of masked) for easy copy-paste
- **Per-event agent assignment**: Each event type routes to a specific agent, preventing cross-contamination
