---
title: "API: Agents"
description: CRUD endpoints for agent management, knowledge base, tools, channels, and chat.
sidebar:
  order: 4
---

## Agent CRUD

### List Agents

```http
GET /api/agents
```

```json
{
  "agents": [
    {
      "id": "bookstore_bot",
      "name": "Bookstore Assistant",
      "description": "Book recommendation assistant",
      "system_prompt": "...",
      "model": null,
      "created_at": "2026-04-07 10:00:00"
    }
  ]
}
```

### Get Agent

```http
GET /api/agents/<agent_id>
```

Returns the agent with its assigned `tools` (array of tool IDs) and `channels`.

### Create Agent

```http
POST /api/agents
Content-Type: application/json

{
  "id": "bookstore_bot",
  "name": "Bookstore Assistant",
  "description": "Book recommendation assistant"
}
```

The `id` must match `^[a-zA-Z0-9_]+$`.

### Update Agent

```http
PUT /api/agents/<agent_id>
Content-Type: application/json

{
  "name": "Updated Name",
  "system_prompt": "New system prompt...",
  "model": "gpt-4"
}
```

Updatable fields: `name`, `description`, `system_prompt`, `model`.

### Delete Agent

```http
DELETE /api/agents/<agent_id>
```

Removes the agent, its channels, sessions, messages, and KB directory.

---

## Agent Tools

### Get Assigned Tools

```http
GET /api/agents/<agent_id>/tools
```

```json
{"tools": ["get_weather", "calculator"]}
```

### Set Assigned Tools

```http
PUT /api/agents/<agent_id>/tools
Content-Type: application/json

{"tools": ["get_weather", "calculator", "search_restaurants"]}
```

Replaces the entire tool assignment list.

---

## Knowledge Base

### List KB Files

```http
GET /api/agents/<agent_id>/kb
```

```json
{
  "files": [
    {"filename": "facilities.md", "size": 2345, "modified": 1712500000.0}
  ]
}
```

### Read KB File

```http
GET /api/agents/<agent_id>/kb/<filename>
```

```json
{"filename": "facilities.md", "content": "# Facilities\n\n..."}
```

### Upload KB File (multipart)

```http
POST /api/agents/<agent_id>/kb
Content-Type: multipart/form-data

file=@facilities.md
```

### Create KB File (JSON)

```http
POST /api/agents/<agent_id>/kb
Content-Type: application/json

{"filename": "faq.md", "content": "# FAQ\n\n..."}
```

### Update KB File

```http
PUT /api/agents/<agent_id>/kb/<filename>
Content-Type: application/json

{"content": "Updated content..."}
```

### Delete KB File

```http
DELETE /api/agents/<agent_id>/kb/<filename>
```

---

## Channels

### List Channels

```http
GET /api/agents/<agent_id>/channels
```

### Create Channel

```http
POST /api/agents/<agent_id>/channels
Content-Type: application/json

{
  "type": "telegram",
  "name": "Main Bot",
  "config": {"bot_token": "123456:ABC..."}
}
```

### Update Channel

```http
PUT /api/agents/<agent_id>/channels/<channel_id>
```

### Delete Channel

```http
DELETE /api/agents/<agent_id>/channels/<channel_id>
```

### Start Channel

```http
POST /api/agents/<agent_id>/channels/<channel_id>/start
```

### Stop Channel

```http
POST /api/agents/<agent_id>/channels/<channel_id>/stop
```

---

## Chat

### Send Message

```http
POST /api/agents/<agent_id>/chat
Content-Type: application/json

{
  "message": "Apakah kamar Bismo tersedia?",
  "user_id": "web_test"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Selamat datang! Kamar Bismo tersedia untuk tanggal tersebut..."
}
```

The `user_id` is used as the external user identifier for session management. Each unique `user_id` gets a separate conversation history.

### Clear Chat History

```http
POST /api/agents/<agent_id>/chat/clear
Content-Type: application/json

{"user_id": "web_test"}
```
