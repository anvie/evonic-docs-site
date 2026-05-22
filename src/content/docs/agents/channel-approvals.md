---
title: Channel Approvals
description: Manage pending channel connections — approve or reject external channel requests via API, SSE, and UI.
sidebar:
  order: 6
---

<Aside type="note">
  Channel approvals were introduced in **v0.2.0**. This feature adds a security layer for channel connections, requiring explicit approval before a channel can start processing messages.
</Aside>

## Overview

Channel approvals give you control over which channel connections are allowed to run. When a channel is created or reconnected, it enters a **pending** state instead of starting immediately. An admin or agent owner must explicitly approve it before the channel becomes active.

This is useful for:

- **Security**: Prevent unauthorised bots from connecting to your agent
- **Review workflow**: Let ops teams review channel config before activation
- **Audit trail**: Keep a log of who approved what and when

### Approval Flow

```
1. Channel Created → Status: pending
2. Approval Request Sent (SSE) → Notify admins
3. Approve via API or UI → Channel starts
   └─ or Reject → Channel is deactivated
```

---

## Database Schema

### `channel_pending_approvals`

Pending approval records live in their own table so the approval queue is independent of the channel lifecycle.

| Column | Type | Description |
|---|---|---|
| `id` | TEXT PK | UUID identifier |
| `channel_id` | TEXT FK | References `channels.id` |
| `agent_id` | TEXT FK | References `agents.id` |
| `requested_by` | TEXT | Who initiated the channel connection |
| `status` | TEXT | `pending`, `approved`, `rejected` |
| `approved_by` | TEXT | Admin/owner who approved (null if pending/rejected) |
| `rejected_by` | TEXT | Admin/owner who rejected (null if pending/approved) |
| `reason` | TEXT | Optional reason for rejection |
| `created_at` | TIMESTAMP | When the approval request was created |
| `updated_at` | TIMESTAMP | Last status update time |

The `status` field drives the channel lifecycle:

- **`pending`** — Channel is waiting for approval, not yet active
- **`approved`** — Channel was approved and can start
- **`rejected`** — Channel was rejected and won't start

---

## REST API Endpoints

All approval endpoints are under `/api/agents/<agent_id>/channels/approvals`.

### List Pending Approvals

```http
GET /api/agents/<agent_id>/channels/approvals
```

Returns all approval requests for a given agent, ordered newest first.

**Response:**

```json
{
  "approvals": [
    {
      "id": "a1b2c3d4-...",
      "channel_id": "ch-001",
      "channel_type": "telegram",
      "channel_name": "Support Bot",
      "requested_by": "admin@evonic.dev",
      "status": "pending",
      "created_at": "2026-05-09 10:00:00"
    },
    {
      "id": "e5f6g7h8-...",
      "channel_id": "ch-002",
      "channel_type": "whatsapp",
      "channel_name": "Sales Bot",
      "requested_by": "ops@evonic.dev",
      "status": "approved",
      "approved_by": "admin@evonic.dev",
      "created_at": "2026-05-08 14:30:00",
      "updated_at": "2026-05-08 14:35:00"
    }
  ]
}
```

### List All Agents' Pending Approvals

```http
GET /api/agents/channels/approvals/pending
```

Returns pending approvals across **all agents**. Useful for admin dashboards or ops views.

**Response:**

```json
{
  "approvals": [
    {
      "id": "a1b2c3d4-...",
      "channel_id": "ch-001",
      "agent_id": "bookstore_bot",
      "agent_name": "Bookstore Assistant",
      "channel_type": "telegram",
      "channel_name": "Support Bot",
      "requested_by": "admin@evonic.dev",
      "created_at": "2026-05-09 10:00:00"
    }
  ]
}
```

### Approve a Channel

```http
POST /api/agents/<agent_id>/channels/approvals/<approval_id>/approve
```

Approves a pending channel. Once approved, the channel automatically starts.

**Response:**

```json
{
  "success": true,
  "message": "Channel approved and started",
  "channel_id": "ch-001",
  "status": "approved"
}
```

### Reject a Channel

```http
POST /api/agents/<agent_id>/channels/approvals/<approval_id>/reject
```

Rejects a pending channel with an optional reason.

**Request:**

```json
{
  "reason": "Bot token belongs to a deactivated account"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Channel rejected",
  "channel_id": "ch-001",
  "status": "rejected"
}
```

### Get Approval Status

```http
GET /api/agents/<agent_id>/channels/approvals/<approval_id>
```

Returns the full details of a single approval request.

### Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents/<agent_id>/channels/approvals` | List approvals for an agent |
| `GET` | `/api/agents/channels/approvals/pending` | List all pending approvals across agents |
| `GET` | `/api/agents/<agent_id>/channels/approvals/<id>` | Get single approval details |
| `POST` | `/api/agents/<agent_id>/channels/approvals/<id>/approve` | Approve a pending channel |
| `POST` | `/api/agents/<agent_id>/channels/approvals/<id>/reject` | Reject a pending channel |

## Approve / Reject from the UI

### Agent Detail Page

When a channel has a pending approval, it appears in the **Channels** tab on the agent detail page with a clear status indicator.

**Steps:**

<Steps>

1. **Navigate** to the **Agents** page and select your agent.
2. Go to the **Channels** tab.
3. Channels with pending approvals show a **"Pending Approval"** badge and an orange status indicator.
4. Click **Review** to open the approval dialog.
5. Choose one of:
   - **Approve** — The channel starts immediately
   - **Reject** — Optionally provide a reason, and the channel stays inactive
6. The channel status updates in real time via SSE — no page refresh needed.

</Steps>

### Dashboard View

On the main dashboard, a **Pending Approvals** widget shows a count of all approvals across agents. Clicking it opens a quick-review panel where you can approve or reject without navigating to each agent.

---

## Best Practices

<Steps>

1. **Review channel config before approving** — Check the bot token, channel type, and name to make sure it's legitimate.

2. **Use the SSE endpoint for live dashboards** — Instead of polling the API every few seconds, subscribe to `GET /api/events?stream=approvals` and react to events as they come in.

3. **Set up notification alerts** — Forward `approval.pending` SSE events to your team's Slack or Discord using a webhook bridge so nobody misses a pending request.

4. **Reject with a reason** — Providing a rejection reason helps the requester understand what went wrong and fix the configuration.

5. **Periodic cleanup** — Rejected approvals that are months old can be safely archived. The system does not auto-delete them, but they don't affect performance.

</Steps>

---

## See Also

- [Channels](/agents/channels) — Channel configuration and management
- [Creating Channels](/development/creating-channels) — Implementing new channel types
- [API: Agents](/reference/api-agents) — Agent management API reference
- [Database Schema](/reference/database-schema) — Full database reference
