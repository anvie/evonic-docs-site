---
title: Schedule Management
description: CLI commands for managing scheduled jobs.
---

# Schedule Management

The `evonic` CLI integrates with the scheduler skill for creating, listing, and cancelling scheduled jobs.

> Note: Schedule commands are available through the scheduler skill. Install it first with `evonic skill add` if not already installed.

## Schedule Types

| Trigger Type | Description |
|--------------|-------------|
| `date` | One-shot execution at a specific date/time |
| `interval` | Repeating job at fixed intervals (seconds/minutes/hours) |
| `cron` | Cron-like pattern (hour, minute, day_of_week) |

## Actions

| Action Type | Description |
|-------------|-------------|
| `agent_message` | Send a message to an agent |
| `emit_event` | Emit a system event with a payload |

## Creating a Schedule

Use the scheduler skill tools to create schedules:

### One-Shot (Date)

Run once at a specific time:

```json
{
  "trigger_type": "date",
  "trigger_config": {
    "run_date": "2026-05-01T09:00:00"
  },
  "action_type": "agent_message",
  "action_config": {
    "message": "Daily reminder: check deploy status"
  }
}
```

### Recurring (Interval)

Run every N minutes/hours:

```json
{
  "trigger_type": "interval",
  "trigger_config": {
    "minutes": 30
  },
  "action_type": "emit_event",
  "action_config": {
    "event_name": "health_check"
  }
}
```

### Cron-Like

Run at specific times (e.g., every weekday at 9 AM):

```json
{
  "trigger_type": "cron",
  "trigger_config": {
    "day_of_week": "mon-fri",
    "hour": 9,
    "minute": 0
  },
  "action_type": "agent_message",
  "action_config": {
    "agent_id": "siwa",
    "message": "Morning standup reminder"
  }
}
```

## Next Steps

- [Scheduler Overview](/scheduler/scheduler)
- [Server Management](/cli/server)
- [Overview](/cli)
