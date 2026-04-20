---
title: Events
description: All supported platform events that plugins can subscribe to.
---

# Plugin Events

Plugins respond to platform events. Here are all supported events:

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

## Event Flow

Events are emitted in a specific order during a conversation turn:

1. `message_received` — User sends a message
2. `processing_started` — Agent begins processing
3. `llm_thinking` — LLM starts generating
4. `llm_response_chunk` — Response chunks arrive
5. `tool_executed` — (if tools are used)
6. `final_answer` — Agent produces final answer
7. `message_sent` — Agent sends response to user
8. `turn_complete` — Turn finishes
9. `summary_updated` — Session summary updated

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

Each event maps to a handler function `on_<event_name>` in `handler.py`.
