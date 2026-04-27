---
title: Events
description: Platform events — the event-driven communication layer for plugins.
sidebar:
  order: 6
---

# Events

Events form the backbone of Evonic AI's event-driven architecture. Every significant moment in a message turn emits a named event that any plugin can react to without coupling into the core pipeline.

## Event Flow

Events are emitted in a specific order during a conversation turn:

```
message_received → processing_started → llm_thinking? →
llm_response_chunk → tool_executed* → final_answer →
turn_complete → message_sent
```

Events are logged to `logs/events.log` with UTC timestamps.

## Supported Events

| Event | Description | Event Data |
|-------|-------------|------------|
| `message_received` | User sends a message to an agent | `session_id`, `user_id`, `message`, `channel_id`, `agent_id` |
| `message_sent` | Agent sends a message to a user | `session_id`, `user_id`, `message`, `channel_id`, `agent_id` |
| `session_created` | A new session is created | `session_id`, `agent_id`, `user_id`, `channel_id` |
| `processing_started` | Agent starts processing a message | `session_id`, `user_id`, `message`, `agent_id` |
| `llm_thinking` | LLM is generating a response | `session_id`, `message`, `agent_id` |
| `llm_response_chunk` | A chunk of LLM response is received | `session_id`, `chunk`, `agent_id` |
| `tool_executed` | A tool is executed by the agent | `session_id`, `tool_name`, `tool_args`, `tool_result`, `agent_id` |
| `final_answer` | Agent produces a final answer | `session_id`, `answer`, `agent_id` |
| `turn_complete` | A full conversation turn finishes | `session_id`, `agent_id`, `user_id` |
| `summary_updated` | Session summary is updated | `session_id`, `summary`, `message_count`, `agent_id` |

## Subscribing to Events

Subscribe to events by listing them in your `plugin.json`:

```json
{
  "id": "my_plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "events": [
    "message_received",
    "turn_complete"
  ]
}
```

Each event maps to a handler function `on_<event_name>` in `handler.py`. See [Plugin SDK](/plugins/sdk) for details.

## Learn More

- [Plugins Overview](/system/plugins) — how events fit into the plugin system
- [Plugin SDK](/plugins/sdk) — available SDK methods for event handlers
