---
title: Kanban
description: "Kanban plugin for task management: permissions, comment monitoring, and task workflows."
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

## Comment Follow-up Monitor

When the Kanban plugin is active, the platform automatically monitors comments on tasks for follow-up activity:

- **Auto-clear on task pick**: When a task is moved to *In Progress*, its prior comment context is automatically cleared so the agent starts fresh when picking up the task.
- **Follow-up alerts**: If a task receives a new comment after being picked up, the monitor detects the follow-up and can trigger an alert or notification to relevant agents or users.

This ensures agents don't get stale context when starting work on a task, and that new discussion on tasks doesn't go unnoticed.

## API Endpoints

The Kanban plugin exposes REST endpoints for programmatic access. See the [Plugin SDK](/plugins/sdk) for details on available endpoints and request/response formats.
