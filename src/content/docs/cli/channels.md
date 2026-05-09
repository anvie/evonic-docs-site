---
title: Channel Management
description: CLI commands for managing channel pairing approvals in Evonic.
---

Commands for approving pending channel pairing requests. Channels let users interact with Evonic agents through external messaging platforms like Telegram and WhatsApp.

When a user connects through a channel for the first time, a **pairing code** is generated. An admin must approve this code to add the user to the channel's allowlist.

## `evonic channel approve <pair_code>`

Approve a pending channel pairing request by its 6-character code.

```bash
evonic channel approve <pair_code>
```

| Argument | Description |
|----------|-------------|
| `pair_code` | 6-character pairing code (e.g. `ABC123`). Accepts both `XXXXXX` and legacy `XXX-XXX` formats. |

The code is case-insensitive — the command uppercases and strips hyphens automatically.

### How Pairing Works

1. A user sends a message to the channel (e.g., your Telegram bot).
2. The channel responds with a 6-character pairing code like `XK4M9Q`.
3. The user shares this code with an admin (via email, chat, or in person).
4. The admin runs `evonic channel approve XK4M9Q` on the server.
5. The user is added to the channel's allowlist and can now interact with the agent.

<Aside type="tip">
  Pairing codes use an unambiguous character set — letters `O`, `I`, and `L` and digits `0` and `1` are excluded to prevent visual confusion.
</Aside>

**Example:**

```bash
evonic channel approve XK4M9Q
```

**Output (success):**

```
✅ User 123456789 berhasil ditambahkan ke allowlist
```

**Output (invalid/expired):**

```
❌ Pairing code invalid or expired.
```

Pairing codes expire after a set period. If a code expires, the user needs to request a new one by sending another message to the channel.

### Code Format

The command accepts these formats:

| Format | Example | Notes |
|--------|---------|-------|
| Bare 6-char | `XK4M9Q` | Preferred format, no hyphen |
| With hyphen | `XK4-M9Q` | Legacy format, hyphen is stripped |

The code is normalised internally — all lowercase letters are uppercased and hyphens are removed before lookup.

## Related Commands

Channel management is handled primarily through the [Web UI](/agents/channels) and [REST API](/agents/channel-approvals). The CLI currently focuses on the approval workflow.

| Action | Method | Where |
|--------|--------|-------|
| Add a channel | Web UI or API | [Channels Guide](/agents/channels) |
| Approve a pairing | CLI | `evonic channel approve <code>` |
| List channels | Web UI or API | [Channels Guide](/agents/channels) |
| Remove a channel | Web UI or API | [Channels Guide](/agents/channels) |
| View pending approvals | API | [Channel Approvals API](/agents/channel-approvals) |

## Next Steps

- [Channels Overview](/agents/channels) — Learn how channels work
- [Channel Approvals](/agents/channel-approvals) — REST API and SSE for channel approvals
- [Creating Channels](/development/creating-channels) — Build custom channel implementations
