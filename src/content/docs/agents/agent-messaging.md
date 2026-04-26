---
title: Agent Messaging
description: Agent-to-agent messaging, escalation, and approval workflows.
sidebar:
  order: 8
---

## Overview

Agents can communicate with each other directly using the **agent-to-agent messaging system**. This enables delegation, collaboration, and multi-agent workflows — for example, a triage agent forwarding a request to a specialist agent, or a code reviewer requesting approval from a senior agent.

## Core Tools

Four tools power the messaging system:

| Tool | Purpose |
|---|---|
| `send_agent_message` | Send a message to another agent |
| `check_agent_response` | Check for a response from another agent |
| `escalate_to_user` | Forward a message to the user's session |
| `resolve_agent_approval` | Approve or reject an agent's pending approval request |

### `send_agent_message`

Send an asynchronous message to another agent. The target agent processes the message in its own session and can respond at its own pace.

```
send_agent_message(target_agent_id: "reviewer", message: "Please review this code...")
```

### `check_agent_response`

Poll for a response from a previously messaged agent. Returns the latest reply or a "no response yet" indicator.

```
check_agent_response(target_agent_id: "reviewer")
```

### `escalate_to_user`

When an agent needs input it cannot resolve on its own, it can escalate a message to the human user's session. This is useful for approval requests, clarification questions, or any decision requiring human judgment.

```
escalate_to_user(message: "Should I deploy this to production?")
```

The user sees the escalation in their chat and can respond directly. The agent then receives the user's reply and continues.

### `resolve_agent_approval`

When Agent A sends a request to Agent B that requires approval (e.g., a tool call that triggers a safety check), Agent B can approve or reject it:

```
resolve_agent_approval(approval_id: "abc123", decision: "approve")
```

## Approval Escalation Flow

When an agent encounters a tool call that requires approval:

1. Agent executes a tool that triggers the safety checker
2. The safety checker holds the tool call pending user approval
3. The agent calls `escalate_to_user` to notify the human user
4. The user responds in their session
5. The agent resumes based on the user's decision

For agent-to-agent scenarios, Agent B can also call `resolve_agent_approval` to programmatically approve or reject pending requests from Agent A.

## Guard Rails

The messaging system enforces safeguards to prevent abuse:

- **Self-messaging blocked** — An agent cannot send a message to itself
- **Rate limit** — Maximum **10 messages per minute** per sender-target pair
- **Depth limit** — Maximum **5 hops** in a message chain (A→B→C→D→E→stop) to prevent infinite forwarding loops
