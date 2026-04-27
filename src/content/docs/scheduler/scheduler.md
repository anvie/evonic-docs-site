---
title: Scheduler
description: Centralized scheduler for reminders, one-shot schedules, repetitive triggers, and cron-based jobs.
sidebar:
  order: 8
---

## Overview

**Scheduler** is a centralized scheduling system built on top of [APScheduler](https://apscheduler.readthedocs.io/). It provides a unified interface for creating, managing, and executing scheduled tasks across the platform.

Use cases include:
- **Reminders** — send a message to an agent at a specific time
- **One-shot schedules** — trigger an action once at a given date/time
- **Recurring jobs** — run periodically at fixed intervals
- **Cron-based triggers** — execute on complex cron-like schedules
- **Webhook dispatch** — fire HTTP requests on schedule

All schedules are persisted in SQLite and survive application restarts.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                    Your Code / Agent                                                 │
│   create_schedule() / cancel_schedule() / list_schedules() / toggle_schedule() / run_now() │
└───────────────────────────────────────────────────────┬──────────────────────────────┘
                                                        │
                                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│              Scheduler (backend/scheduler.py)                                         │
│                                                                                      │
│  ┌───────────┐  ┌─────────────┐  ┌─────────────┐                                   │
│  │  SQLite DB │  │  EventStream │  │  Job Queue  │                                   │
│  │ (persistence)│  │  (events)    │  │ (APScheduler) │                                   │
│  └───────────┘  └─────────────┘  └─────────────┘                                   │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

The scheduler uses a singleton pattern (`from backend.scheduler import scheduler`). It starts a background thread with APScheduler's `BackgroundScheduler`, loads persisted schedules from the database on boot, and manages job lifecycle (register, execute, remove).

## Getting Started

### Python API

```python
from backend.scheduler import scheduler

# Start the scheduler (call once at app boot)
scheduler.start()

# Create a one-shot reminder
scheduler.create_schedule(
    name='Remind standup',
    owner_type='agent',
    owner_id='agent-1',
    trigger_type='date',
    trigger_config={'run_date': '2026-04-21T09:00:00'},
    action_type='agent_message',
    action_config={'agent_id': 'agent-1', 'message': 'Time for standup!'},
)
```

### REST API

```bash
# Create a schedule
curl -X POST http://localhost:8080/api/schedules \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Daily health check",
    "trigger_type": "interval",
    "trigger_config": {"minutes": 5},
    "action_type": "emit_event",
    "action_config": {"event_name": "health_check", "payload": {}}
  }'

# List schedules
curl http://localhost:8080/api/schedules

# Cancel a schedule
curl -X POST http://localhost:8080/api/schedules/<schedule_id>/cancel

# Toggle enabled/disabled
curl -X POST http://localhost:8080/api/schedules/<schedule_id>/toggle

# Run immediately (out-of-band)
curl -X POST http://localhost:8080/api/schedules/<schedule_id>/run-now
```

### Via CLI

Schedules are created through the scheduler skill's agent tools. Install the scheduler skill with `evonic skill add` if not already installed.

**Create a one-shot schedule (via agent tool):**

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

**Create a recurring schedule (via agent tool):**

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

**Create a cron-like schedule (via agent tool):**

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

## Trigger Types

The scheduler supports three trigger types, each with its own configuration format.

### `date` — One-shot at specific time

Fires once at a specific date and time. `max_runs` is automatically set to `1`.

```python
scheduler.create_schedule(
    name='Send report',
    trigger_type='date',
    trigger_config={'run_date': '2026-05-01T10:00:00'},
    action_type='agent_message',
    action_config={'agent_id': 'agent-1', 'message': 'Here is your daily report.'},
)
```

**Config fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `run_date` | string | Yes | ISO 8601 datetime string (e.g., `2026-05-01T10:00:00`) |

### `interval` — Recurring at fixed intervals

Fires repeatedly at a fixed interval (seconds, minutes, hours, days, weeks, months, or years).

```python
# Every 5 minutes
scheduler.create_schedule(
    name='Health check',
    trigger_type='interval',
    trigger_config={'minutes': 5},
    action_type='emit_event',
    action_config={'event_name': 'health_check', 'payload': {}},
    max_runs=100,  # optional: limit total runs
)
```

**Config fields (pick one):**

| Field | Type | Description |
|-------|------|-------------|
| `seconds` | int | Interval in seconds |
| `minutes` | int | Interval in minutes |
| `hours` | int | Interval in hours |
| `days` | int | Interval in days |
| `weeks` | int | Interval in weeks |
| `months` | int | Interval in months |
| `years` | int | Interval in years |

### `cron` — Cron-like scheduling

Fires on a cron-like schedule with day-of-week, hour, minute, etc.

```python
# Every weekday at 9:00 AM
scheduler.create_schedule(
    name='Daily standup',
    trigger_type='cron',
    trigger_config={'day_of_week': 'mon-fri', 'hour': 9, 'minute': 0},
    action_type='agent_message',
    action_config={'agent_id': 'agent-1', 'message': 'Time for standup!'},
)
```

**Config fields:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `year` | int | None | 4-digit year |
| `month` | int | None | Month (1-12) |
| `day` | int | None | Day of month (1-31) |
| `week` | int | None | ISO week number (1-53) |
| `day_of_week` | int or str | None | Day of week (0-6 or mon-fri) |
| `hour` | int | None | Hour (0-23) |
| `minute` | int | None | Minute (0-59) |
| `second` | int | None | Second (0-59) |
| `start_date` | str | None | Earliest start date (ISO 8601) |
| `end_date` | str | None | Latest end date (ISO 8601) |

See the [APScheduler CronTrigger docs](https://apscheduler.readthedocs.io/en/stable/modules/triggers/cron.html) for full syntax.

## Action Types

When a schedule fires, the scheduler executes an action based on the `action_type` field.

### `agent_message` — Send a message to an agent

Sends a message to a specific agent as if it came from an external user.

```python
scheduler.create_schedule(
    name='Remind user',
    trigger_type='date',
    trigger_config={'run_date': '2026-04-21T09:00:00'},
    action_type='agent_message',
    action_config={
        'agent_id': 'agent-1',
        'message': "Don't forget about your meeting!",
        'channel_id': 'telegram-123',  # optional: target specific channel
    },
)
```

**Config fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agent_id` | string | Yes | Target agent ID |
| `message` | string | Yes | Message content |
| `channel_id` | string | No | Target channel (e.g., telegram, slack) |

### `emit_event` — Emit a system event

Emits an event to the platform's event stream, which can be consumed by plugins, evaluators, or other components.

```python
scheduler.create_schedule(
    name='Periodic cleanup',
    trigger_type='interval',
    trigger_config={'hours': 6},
    action_type='emit_event',
    action_config={
        'event_name': 'cleanup_task',
        'payload': {'target': 'expired_sessions'},
    },
)
```

**Config fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_name` | string | Yes | Name of the event to emit |
| `payload` | dict | No | Arbitrary JSON payload |

### `webhook` — Fire an HTTP request

Sends an HTTP request to an external endpoint.

```python
scheduler.create_schedule(
    name='Notify Slack',
    trigger_type='date',
    trigger_config={'run_date': '2026-04-21T09:00:00'},
    action_type='webhook',
    action_config={
        'method': 'POST',
        'url': 'https://hooks.slack.com/services/...',
        'headers': {'Content-Type': 'application/json'},
        'body': {'text': 'Standup time!'},
        'timeout': 30,
    },
)
```

**Config fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Target URL |
| `method` | string | No | HTTP method (default: `POST`) |
| `headers` | dict | No | Request headers |
| `body` | dict | No | Request body (sent as JSON) |
| `timeout` | int | No | Request timeout in seconds (default: 30) |

## API Reference

### Python API

#### `scheduler.create_schedule()`

Create a new schedule and register it with APScheduler.

```python
result = scheduler.create_schedule(
    name='My Schedule',
    owner_type='agent',
    owner_id='agent-1',
    trigger_type='date',
    trigger_config={'run_date': '2026-04-21T09:00:00'},
    action_type='agent_message',
    action_config={'agent_id': 'agent-1', 'message': 'Hello!'},
    max_runs=1,
    metadata={'source': 'manual'},
)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Human-readable name |
| `owner_type` | string | Yes | Owner type (`agent`, `plugin`, `user`, etc.) |
| `owner_id` | string | Yes | Owner's ID |
| `trigger_type` | string | Yes | One of: `date`, `interval`, `cron` |
| `trigger_config` | dict | Yes | Trigger parameters (see Trigger Types above) |
| `action_type` | string | Yes | One of: `agent_message`, `emit_event`, `webhook` |
| `action_config` | dict | Yes | Action parameters (see Action Types above) |
| `max_runs` | int | No | Maximum number of executions (default: unlimited; auto-set to 1 for `date` triggers) |
| `metadata` | dict | No | Arbitrary metadata stored with the schedule |

**Returns:** dict with schedule details including `id` (UUID).

#### `scheduler.cancel_schedule()`

Cancel and remove a schedule.

```python
success = scheduler.cancel_schedule(schedule_id='uuid-here', owner_id='agent-1')
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `schedule_id` | string | Yes | UUID of the schedule |
| `owner_id` | string | No | Enforce ownership check |

**Returns:** `True` if cancelled, `False` if not found or ownership mismatch.

#### `scheduler.list_schedules()`

List schedules with optional filtering.

```python
schedules = scheduler.list_schedules(
    owner_type='agent',
    owner_id='agent-1',
    enabled_only=True,
)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner_type` | string | No | Filter by owner type |
| `owner_id` | string | No | Filter by owner ID |
| `enabled_only` | bool | No | Only return enabled schedules (default: `True`) |

**Returns:** list of schedule dicts.

#### `scheduler.get_schedule()`

Get a single schedule by ID.

```python
schedule = scheduler.get_schedule('uuid-here')
```

**Returns:** dict with schedule details, or `None` if not found.

#### `scheduler.toggle_schedule()`

Toggle a schedule's enabled/disabled state.

```python
schedule = scheduler.toggle_schedule('uuid-here')
```

**Returns:** dict with updated schedule details, or `None` if not found.

#### `scheduler.run_now()`

Trigger a schedule immediately, regardless of its schedule.

```python
success = scheduler.run_now('uuid-here')
```

**Returns:** `True` if executed, `False` if not found.

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/schedules` | List schedules (supports `owner_type` and `owner_id` query params) |
| `POST` | `/api/schedules` | Create a new schedule |
| `GET` | `/api/schedules/<id>` | Get a single schedule |
| `POST` | `/api/schedules/<id>/cancel` | Cancel a schedule |
| `POST` | `/api/schedules/<id>/toggle` | Toggle enabled/disabled |
| `POST` | `/api/schedules/<id>/run-now` | Execute immediately |
| `GET` | `/scheduler` | Web UI page |

### Agent Tools

When the Scheduler skill is enabled, agents get three tools:

#### `create_schedule`

Create a new scheduled job. Automatically sets `owner_type='agent'` and `owner_id` to the calling agent's ID.

#### `cancel_schedule`

Cancel a scheduled job by ID. Only works for schedules owned by the calling agent.

#### `list_schedules`

List all schedules owned by the calling agent. Supports `include_disabled` parameter.

## Schedule Data Model

Each schedule is stored in the `schedules` table with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID (primary key) |
| `name` | string | Human-readable name |
| `owner_type` | string | Owner type (`agent`, `plugin`, `user`, etc.) |
| `owner_id` | string | Owner's ID |
| `trigger_type` | string | One of: `date`, `interval`, `cron` |
| `trigger_config` | JSON | Trigger parameters |
| `action_type` | string | One of: `agent_message`, `emit_event`, `webhook` |
| `action_config` | JSON | Action parameters |
| `enabled` | int | 1 = enabled, 0 = disabled |
| `created_at` | string | ISO 8601 creation timestamp |
| `next_run_at` | string | Next scheduled run time (ISO 8601) |
| `last_run_at` | string | Last execution time (ISO 8601) |
| `run_count` | int | Number of times the schedule has fired |
| `max_runs` | int | Maximum runs (null = unlimited) |
| `metadata` | JSON | Arbitrary metadata |

## Lifecycle & Persistence

### Startup

When `scheduler.start()` is called:
1. The APScheduler background thread is started
2. All enabled schedules are loaded from the database
3. Each schedule is registered as an APScheduler job
4. Expired `date`-type schedules (past `run_date`) are automatically disabled

### Execution

When a schedule fires:
1. The scheduler checks if the schedule is enabled
2. The appropriate action is executed (`agent_message`, `emit_event`, or `webhook`)
3. Run stats are updated (`last_run_at`, `run_count`)
4. If `max_runs` is reached, the schedule is disabled and the job is removed
5. For recurring schedules, the next run time is computed and stored
6. A `schedule_fired` event is emitted to the event stream

### Shutdown

When `scheduler.shutdown()` is called:
1. All jobs are removed from APScheduler
2. The background thread is stopped
3. All schedule state is already persisted in the database (no data loss)

## Examples

### Daily reminder at 9 AM

```python
scheduler.create_schedule(
    name='Morning reminder',
    owner_type='agent',
    owner_id='agent-1',
    trigger_type='cron',
    trigger_config={'day_of_week': 'mon-fri', 'hour': 9, 'minute': 0},
    action_type='agent_message',
    action_config={
        'agent_id': 'agent-1',
        'message': 'Good morning! Time for your daily standup.',
    },
)
```

### Weekly report every Sunday at midnight

```python
scheduler.create_schedule(
    name='Weekly report',
    owner_type='plugin',
    owner_id='reporter',
    trigger_type='cron',
    trigger_config={'day_of_week': 'sun', 'hour': 0, 'minute': 0},
    action_type='emit_event',
    action_config={
        'event_name': 'weekly_report',
        'payload': {'format': 'pdf'},
    },
)
```

### One-time event in 30 seconds

```python
from datetime import datetime, timedelta

run_at = datetime.now() + timedelta(seconds=30)
scheduler.create_schedule(
    name='Delayed notification',
    owner_type='user',
    owner_id='user-42',
    trigger_type='date',
    trigger_config={'run_date': run_at.isoformat()},
    action_type='agent_message',
    action_config={
        'agent_id': 'agent-1',
        'message': 'Your task is ready!',
    },
)
```

### Cleanup expired sessions every 6 hours

```python
scheduler.create_schedule(
    name='Session cleanup',
    owner_type='plugin',
    owner_id='auth-plugin',
    trigger_type='interval',
    trigger_config={'hours': 6},
    action_type='emit_event',
    action_config={
        'event_name': 'cleanup_sessions',
        'payload': {'max_age_days': 30},
    },
)
```

## Events
