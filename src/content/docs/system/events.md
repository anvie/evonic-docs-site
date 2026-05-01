---
title: Events
description: The event-driven architecture of Evonic: pub/sub bus, event reference, SSE features, and plugin integration.
sidebar:
  order: 6
---

Events form the backbone of Evonic's event-driven architecture. Every significant moment in a message turn emits a named event that any plugin can react to without coupling into the core pipeline.

`backend/event_stream.py` is a lightweight pub/sub event bus that decouples event producers (agent runtime, channels) from consumers (plugins, internal components).

## Event Flow

Events are emitted in a specific order during a conversation turn:

```
message_received
  └─ processing_started         ← typing indicator sent here
       └─ [per LLM call]
            ├─ llm_thinking?
            ├─ llm_response_chunk
            └─ [per tool call]
                 └─ tool_executed
       └─ final_answer
  └─ turn_complete
  └─ message_sent               ← after channel delivery

(background, separate thread)
summary_updated                 ← if summarization threshold reached
```

## API

```python
from backend.event_stream import event_stream

# Subscribe
event_stream.on('processing_started', my_handler)

# Unsubscribe
event_stream.off('processing_started', my_handler)

# Emit (non-blocking)
event_stream.emit('processing_started', {'agent_id': ..., ...})
```

Handlers are called asynchronously in a `ThreadPoolExecutor` (4 workers). Exceptions inside handlers are caught and logged; they never block the caller.

## Events Reference

### `message_received`

Emitted in `handle_message()` after the user message is saved to DB, before any LLM work begins.

| Field | Type | Description |
|---|---|---|
| `agent_id` | str | Agent handling the message |
| `agent_name` | str | Human-readable agent name |
| `session_id` | str | Session UUID |
| `external_user_id` | str | Platform user ID (e.g. Telegram chat ID) |
| `channel_id` | str | Channel UUID |
| `message` | str | User message text |
| `image_url` | str \| None | Base64 data URL for vision messages |

---

### `processing_started`

Emitted at the top of `_do_process()`, before the system prompt is built. The typing indicator is sent to the channel at this exact point.

| Field | Type | Description |
|---|---|---|
| `agent_id` | str | |
| `agent_name` | str | |
| `session_id` | str | |
| `external_user_id` | str | |
| `channel_id` | str | |

---

### `llm_thinking`

Emitted when the LLM response contains a reasoning block: either via the `reasoning_content` field (llama.cpp reasoning mode) or thinking tags (`<think>` / Gemma 4 `<|channel>thought`).

| Field | Type | Description |
|---|---|---|
| `agent_id` | str | |
| `session_id` | str | |
| `external_user_id` | str | |
| `channel_id` | str | |
| `thinking` | str | Extracted thinking content |

---

### `llm_response_chunk`

Emitted for every content block from an LLM response, including intermediate text produced before tool calls.

| Field | Type | Description |
|---|---|---|
| `agent_id` | str | |
| `session_id` | str | |
| `external_user_id` | str | |
| `channel_id` | str | |
| `content` | str | LLM text output |
| `is_final` | bool | `true` when no tool calls follow (final turn) |

---

### `tool_executed`

Emitted after each tool call in the tool loop, once the result is available.

| Field | Type | Description |
|---|---|---|
| `agent_id` | str | |
| `session_id` | str | |
| `external_user_id` | str | |
| `channel_id` | str | |
| `tool_name` | str | Function name |
| `tool_args` | dict | Arguments passed |
| `tool_result` | dict | Result returned |
| `has_error` | bool | `true` if result contains an `error` key |

---

### `final_answer`

Emitted inside `_run_tool_loop()` immediately before returning the final response. The answer is already saved to DB at this point.

| Field | Type | Description |
|---|---|---|
| `agent_id` | str | |
| `session_id` | str | |
| `external_user_id` | str | |
| `channel_id` | str | |
| `answer` | str | Final text sent to the user |
| `tool_trace` | list | `[{tool, args, result}]` for the full turn |
| `timeline` | list | Chronological thinking/tool/response events |

---

### `turn_complete`

Emitted at the end of `_do_process()`, after everything is done for the turn. This is the canonical "the bot finished responding" signal and the trigger for plugins like `session-recap`.

| Field | Type | Description |
|---|---|---|
| `agent_id` | str | |
| `agent_name` | str | |
| `session_id` | str | |
| `external_user_id` | str | |
| `channel_id` | str | |
| `response` | str | Final response text |
| `tool_trace` | list | |
| `is_error` | bool | `true` if the turn ended in an LLM error |

---

### `message_sent`

Emitted by `TelegramChannel` after the message is successfully delivered. Fires in both the direct reply path and the buffered `send_message()` path.

| Field | Type | Description |
|---|---|---|
| `channel_type` | str | e.g. `telegram` |
| `channel_id` | str | |
| `external_user_id` | str | |
| `message` | str | Exact text delivered |

---

### `summary_updated`

Emitted by `_do_summarize()` when a session summary is written to DB.

| Field | Type | Description |
|---|---|---|
| `agent_id` | str | |
| `agent_name` | str | |
| `session_id` | str | |
| `summary` | str | Full summary text |
| `last_message_id` | int | DB ID of the last summarized message |
| `message_count` | int | Total messages covered |
| `tail_messages` | list | Unsummarized recent messages `[{role, content}]` |

## Event Logging

Every `emit()` call writes a timestamped line to the event log file:

```
[2026-04-12 10:23:01.432] processing_started | agent_id=bookstore_bot, channel_id=telegram, ...
[2026-04-12 10:23:03.812] llm_thinking | thinking=The user is asking about...
[2026-04-12 10:23:04.210] final_answer | answer=Hello! I can help you with...
[2026-04-12 10:23:04.410] message_sent | channel_type=telegram, external_user_id=76639539
```

Configure the path with `EVENT_LOG_FILE` in `.env` (default: `logs/events.log`). Follow live: `tail -f logs/events.log`

## SSE Improvements

### Replay Gap-Filling

When a client reconnects to the SSE stream (e.g., after a page refresh), the server detects the gap by comparing sequence numbers and replays any missed events. This ensures no events are lost during brief disconnections.

### Reasoning State Recovery

If the LLM was in the middle of generating reasoning content when a disconnection occurs, the server recovers the reasoning state and resumes the stream from where it left off. The client receives the complete reasoning content without gaps.

### Intermediate Response Bubbles

When `send_intermediate_responses` is enabled, the agent produces intermediate text responses during the tool loop (e.g., partial answers before executing a tool). These are emitted as `llm_response_chunk` events with `is_final=false` and are rendered as separate bubbles in the chat UI, interleaved with thinking bubbles.

## Plugin Integration

Plugins do **not** call `event_stream` directly. They declare subscriptions in `plugin.json`:

```json
{
  "events": ["turn_complete", "summary_updated"]
}
```

When a plugin is loaded, `PluginManager` registers a bridge closure on `event_stream` for each declared event. The bridge handles the kill switch check, plugin log buffering, and `PluginSDK` creation transparently.

`plugin_manager.dispatch()` is kept for backwards compatibility: it now delegates to `event_stream.emit()` internally.

To expose a new event to plugins, add its name to `VALID_EVENTS` in `backend/plugin_manager.py`.

## Adding a Subscriber

Any module can subscribe without being a plugin:

```python
from backend.event_stream import event_stream

def on_tool_executed(data: dict):
    print(f"Tool {data['tool_name']} ran for session {data['session_id']}")

event_stream.on('tool_executed', on_tool_executed)
```

Keep handlers fast and non-blocking: they run in a shared thread pool. For long-running work, spawn your own thread or use a queue inside the handler.

## Learn More

- [Plugins Overview](/system/plugins): how events fit into the plugin system
- [Plugin SDK](/plugins/sdk): available SDK methods for event handlers
- [Architecture](/development/architecture): how events are used across the codebase
