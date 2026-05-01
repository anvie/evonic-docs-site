---
title: Agent Messaging
description: Agent-to-agent messaging, escalation, and approval workflows.
sidebar:
  order: 8
---

## Overview

Agents can communicate with each other directly using the **agent-to-agent messaging system**. This enables delegation, collaboration, and multi-agent workflows: for example, a triage agent forwarding a request to a specialist agent, or a code reviewer requesting approval from a senior agent.

## Core Tools

Three tools power the messaging system:

| Tool | Purpose |
|---|---|
| `send_agent_message` | Send a message to another agent (fire-and-forget: replies are auto-delivered) |
| `escalate_to_user` | Forward a message to the user's session |
| `resolve_agent_approval` | Approve or reject an agent's pending approval request |

### `send_agent_message`

Send an asynchronous message to another agent. The target agent processes the message in its own session. When the target finishes, their reply is **automatically forwarded** back to your user session: no polling required.

```
send_agent_message(target_agent_id: "reviewer", message: "Please review this code...")
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

The messaging system enforces several layers of protection against abuse and infinite loops.

### Rate and scale limits

- **Self-messaging blocked**: An agent cannot send a message to itself
- **Per-pair rate limit**: Maximum **10 messages per minute** per sender→target pair
- **Global rate limit**: Maximum **30 messages per minute** per sender across all targets
- **Fan-out limit**: Maximum **5 unique targets** per 5-second window (one LLM turn)
- **Depth limit**: Maximum **3 hops** in a chain (A→B→C→stop) to prevent cascading loops

### Loop prevention: passive reply pattern

The most dangerous failure mode in multi-agent systems is a **ping-pong loop**: where two agents keep messaging each other indefinitely:

```
A → B  (asks B to do task)
B → A  (B has a question)
A → B  (A replies)
B → A  (B has another question)
...    (infinite)
```

To prevent this, the system enforces a **passive reply rule**:

> **An agent that received a task cannot use `send_agent_message` to reply back to the agent that sent it.** Instead, it must end its turn with a final answer.

When agent B finishes its turn, the system automatically forwards B's reply to A's session: no active send required. This auto-forwarding is handled by an internal `_on_final_answer` event listener that routes B's response back through the original message chain.

**Correct pattern:**

```
User (Y) → Agent A  (asks A to delegate task 123)
Agent A  → Agent B  (delegates task 123)

Agent B needs clarification:
  ✗ B.send_agent_message(A, "need clarification")  ← BLOCKED
  ✓ B ends turn: "I need clarification about X before I can proceed"
    → auto-forwarded to A's session

Agent A reads B's response:
  → A.escalate_to_user("B needs clarification about X")
  → User Y answers
  → A sends updated task to B (depth increments, still within limit)

Agent B completes task:
  → B ends turn with final answer
  → auto-forwarded to A
  → A relays result to User Y
```

This means **all escalation paths always flow upward** (toward the user), never sideways between peer agents.

### If you need human input from within a sub-task

Use `escalate_to_user` instead. This forwards the message to the agent's own human session. If agent B has no direct user channel, it should surface the question in its final answer: the calling agent A (which does have a user channel) will receive it and can escalate.
