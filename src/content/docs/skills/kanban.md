---
title: Kanban
description: "Kanban plugin for task management: permissions, skill-based notifications, comment monitoring, and task workflows."
sidebar:
  order: 9
---

## Overview

The **Kanban plugin** provides a Kanban board for organizing work as tasks with statuses like *Todo*, *In Progress*, and *Done*. It integrates with the agent system so agents can manage tasks directly from chat, and the platform automatically monitors task activity for follow-up alerts.

## Installation

The Kanban plugin is installed and managed through the **Skills** page (`/skills` in the web UI). Once installed, the Kanban skill appears in the skill registry and can be enabled for any agent.

## Permission Settings

The Kanban plugin supports fine-grained permission controls. For each agent, you can toggle the following permissions:

| Permission | Description |
|---|---|
| **Create** | Whether the agent can create new tasks on the board |
| **Edit** | Whether the agent can modify existing tasks (title, description, priority, status) |
| **Delete** | Whether the agent can delete tasks from the board |

These permissions are configured per-agent in the agent's **Tools** tab (or equivalent skill assignment interface). A disabled permission prevents the agent from performing the corresponding action.

## Skill-Based Notifications

:::note[Changed in v0.2.0]
Previously, notifications were configured via a manual `ELIGIBLE_AGENTS` list in the plugin config. Starting from v0.2.0, eligibility is **automatically determined by the kanban skill**.
:::

Agent notifications (stale task reminders, follow-up alerts, new task assignments) are now sent to agents that **have the Kanban skill assigned**. No manual configuration needed:

- **Kanban skill assigned** → agent receives notifications
- **Kanban skill removed** → agent stops receiving notifications
- **Super agent** → always eligible regardless of skill assignment

This replaces the old `ELIGIBLE_AGENTS` config field, which is now deprecated and kept only for backward compatibility.

## Comment Follow-up Monitor

When the Kanban plugin is active, the platform automatically monitors comments on tasks for follow-up activity:

- **Auto-clear on task pick**: When a task is moved to *In Progress*, its prior comment context is automatically cleared so the agent starts fresh when picking up the task.
- **Follow-up alerts**: If a task receives a new comment after being picked up, the monitor detects the follow-up and triggers a notification to eligible agents (those with the kanban skill).

This ensures agents don't get stale context when starting work on a task, and that new discussion on tasks doesn't go unnoticed.

## Kanban Tools

Agents with the Kanban skill can use the following tools to interact with the board programmatically:

### Task Management Tools

| Tool | Description |
|------|-------------|
| `kanban_search_tasks` | Search and list tasks with filters (assignee, status, query) |
| `kanban_get_task` | Retrieve a single task by its ID |
| `kanban_create_task` | Create a new task on the board |
| `kanban_update_task` | Update a task's status, assignee, title, description, or priority |
| `kanban_delete_task` | Delete a task (super agents can delete directly; regular agents need approval) |

### Comment Tools

| Tool | Description |
|------|-------------|
| `kanban_add_comment` | Add a progress note or comment to a task |
| `kanban_get_comments` | Retrieve paginated comments from a task |

#### `kanban_add_comment`

Adds a progress note, sub-step result, or finding to a Kanban task. Comments are visible on the board and can trigger follow-up notifications.

```
kanban_add_comment(task_id: "183", content: "Started data collection phase")
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `task_id` | Yes | The ID of the task to comment on |
| `content` | Yes | The comment content (text) |

#### `kanban_get_comments`

*Introduced in v0.2.6.*

Retrieves comments from a Kanban task with pagination support. Comments are ordered newest first.

```
kanban_get_comments(task_id: "183", limit: 10, offset: 0)
```

**Parameters:**

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `task_id` | Yes | — | The ID of the task to retrieve comments from |
| `limit` | No | `10` | Maximum number of comments to return (max: `100`) |
| `offset` | No | `0` | Number of comments to skip (for pagination) |

**Example — first page:**

```
kanban_get_comments(task_id: "183", limit: 5, offset: 0)
```

**Returns:**

```json
{
  "comments": [
    {
      "id": 441,
      "task_id": 183,
      "content": "Started data collection phase",
      "author": "adit",
      "created_at": "2026-05-11T10:00:00Z"
    },
    {
      "id": 440,
      "task_id": 183,
      "content": "Task assigned for review",
      "author": "system",
      "created_at": "2026-05-11T09:55:00Z"
    }
  ],
  "total": 12,
  "limit": 5,
  "offset": 0
}
```

**Example — next page:**

```
kanban_get_comments(task_id: "183", limit: 5, offset: 5)
```

## API Endpoints

The Kanban plugin exposes REST endpoints for programmatic access. See the [Plugin SDK](/plugins/sdk) for details on available endpoints and request/response formats.
