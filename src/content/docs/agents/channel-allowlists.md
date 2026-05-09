---
title: Channel Allowlists
description: Control who can interact with your agent through each channel by managing allowed users.
sidebar:
  order: 7
---

## Overview

Every channel in Evonic has an **allowlist** (`allowed_users`) — a list of `external_user_id` values that are permitted to interact with the agent through that channel. Think of it as a **guest list**: only people on the list get in.

When a channel is in **restricted mode** (the default for new channels), the system checks every incoming message against the allowlist before routing it to the agent. Users not on the list are turned away with a pairing code they can give to an admin for approval.

<Aside type="tip">
  In **open mode**, the allowlist is ignored — everyone can chat freely. See [Channel Modes](/agents/channels/#channel-modes) for the full comparison.
</Aside>

### How It Works Under the Hood

The allowlist is stored in the channel's `config` as a simple JSON array:

```json
{
  "mode": "restricted",
  "allowed_users": ["123456789", "987654321"]
}
```

The check happens at the channel level (before anything reaches the agent runtime) via `is_user_allowed()`:

```
Message arrives → Channel mode is restricted?
  ├─ Yes → external_user_id in allowed_users?
  │     ├─ Yes ✅ → Route to agent
  │     └─ No  ❌ → Generate pairing code → wait for admin approval
  └─ No  → Route to agent (open mode)
```

This means **unauthorised users never touch the agent runtime** — no context waste, no hallucination risk, no security surface.

---

## Managing the Allowlist

### Via the Web UI

The **Channel Detail Modal** gives you a full view of who has access:

1. Navigate to the **Agents** page and select your agent.
2. Click on the **Channels** tab.
3. Click on a channel card to open the detail modal.
4. Scroll to the **Allowed Users** section.

![Channel Detail Modal — Allowed Users section](/img/channel-detail-modal.jpg)

From here you can:

| Action | How |
|--------|-----|
| **View** the current allowlist | See all `external_user_id` entries with display names |
| **Add** a user | Type an `external_user_id` in the input field and hit enter |
| **Remove** a user | Click the **Remove** button next to their entry |
| **Approve** a pending request | Click **Approve** on any pending pairing code — the user is automatically added to the allowlist |

<Aside type="note">
  The Channel Detail Modal auto-refresh every 30 seconds, so pending approvals from other admins show up without a manual reload.
</Aside>

### Via the REST API

You can manage the allowlist programmatically by updating the channel config:

```bash
curl -X PUT http://localhost:8080/api/agents/<agent_id>/channels/<ch_id> \
  -H 'Content-Type: application/json' \
  -d '{
    "config": {
      "allowed_users": ["alice_telegram", "bob_discord", "charlie_wa"]
    }
  }'
```

This **replaces** the entire allowlist. To add a single user without touching the rest, first `GET` the current config, append the new user, then `PUT` the full list.

**Approve a pending pairing request via API:**

```bash
POST /api/agents/<agent_id>/channels/approvals/<approval_id>/approve
```

This automatically adds the user to the allowlist and removes the pending record. See the [Channel Approvals API](/agents/channel-approvals) for the full reference.

### Via the CLI

The CLI currently supports the **approval flow** through pairing codes:

```bash
evonic channel approve <pair_code>
```

When a user shares their pairing code with you, this command adds them to the allowlist automatically. See the [CLI Channel Management](/cli/channels) page for details.

For direct allowlist CRUD (add/remove users without a pairing code), use the Web UI or REST API.

---

## Onboarding Users: The Pairing Code Flow

When an unregistered user sends a message to a restricted channel, this is what happens:

```
User sends: "Hello bot!"
       │
       ▼
Channel checks allowlist → User not found
       │
       ▼
Channel generates 6-char pairing code (e.g. XK4M9Q)
       │
       ▼
User receives: "🔑 Pairing code: XK4M9Q — share this with an admin"
       │
       ▼
User shares code with admin (via email, chat, in person)
       │
       ▼
Admin approves via CLI → `evonic channel approve XK4M9Q`
  OR via UI → Channel Detail Modal → Approve
       │
       ▼
User added to allowlist → User can now chat with the agent
```

The pairing code is **6 characters**, uses an unambiguous character set (no `0`, `O`, `1`, `I`, `L`), and expires after **5 minutes**. If it expires, the user just sends another message to get a fresh one.

---

## Use Cases

### 1. Customer Support Bot (Telegram)

You run a Telegram bot for your SaaS product. Only paying customers should be able to reach the support agent.

**Setup:**
- Create a Telegram channel in **restricted** mode
- Onboard each new customer by giving them a pairing code
- Once approved, only that customer can chat with the support agent

**Result:** Random Telegram users who find your bot can't spam the agent. Only your customers get through.

### 2. Internal Team Channel (Discord)

You have a Discord channel connected to an agent that can query internal databases. Only team members should have access.

**Setup:**
- Create a Discord channel in **restricted** mode
- Add each team member's Discord user ID directly via the Web UI
- No pairing codes needed — you know who your team is

**Result:** Only approved team members can query internal data through the agent.

### 3. Multi-Tenant WhatsApp Bot

You operate a WhatsApp bot that serves multiple clients. Each client should only interact with their own agent.

**Setup:**
- Create separate WhatsApp channels per client, each in **restricted** mode
- Add only that client's phone numbers to each channel's allowlist
- Each client never sees another client's conversations

**Result:** Clean isolation between tenants using the same Evonic instance.

### 4. Public Demo + Admin Channel

You want anyone to try your agent on a public Telegram bot, but the admin-only management channel stays locked down.

**Setup:**
- **Demo channel**: Set mode to **open** — everyone can chat
- **Admin channel**: Set mode to **restricted** — only admin user IDs allowed

**Result:** The public gets a hands-on demo, but admin operations stay protected.

---

## Best Practices

- **Start restricted.** You can always switch to open later. Starting in restricted mode ensures no unexpected access.
- **Use descriptive `external_user_id` values.** If your platform supports usernames, use those (e.g., `alice_telegram`) instead of numeric IDs — makes the allowlist readable at a glance.
- **Clean up stale entries.** Periodically review your allowlist and remove users who no longer need access. The Web UI makes removal a single click.
- **Pairing codes for external users, direct add for internal.** Let external users self-request access via pairing codes; add internal team members directly through the UI or API.
- **Combine with channel approvals.** Channel approvals (v0.2.0+) add a layer of protection before a channel even starts — use both for defense in depth. See [Channel Approvals](/agents/channel-approvals).

---

## Related Pages

- [Channels Overview](/agents/channels) — Channel modes, architecture, and setup guides
- [Channel Approvals API](/agents/channel-approvals) — REST API and SSE for channel approvals
- [CLI Channel Management](/cli/channels) — Approve pairing codes via the CLI
- [Creating Channels](/development/creating-channels) — Build custom channel implementations
