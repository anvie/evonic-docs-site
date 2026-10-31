---
title: DMSS (Decision-Model Safety System)
description: Let a decision model review agent commands before they run, with HMADS as the deterministic fallback.
sidebar:
  order: 3
---

**DMSS** adds a second opinion to Evonic's safety pipeline. Where [HMADS](/security/heuristic-code-safety) scores a command with local rules, DMSS asks a **decision model** whether the command should be allowed, reviewed, or blocked — and records what it said.

It applies to `bash` and Python (`runpy`) tool calls.

:::caution[Changed in v1.6.0]
DMSS no longer takes a raw provider endpoint URL. You now pick a **decision model** from **System › Models**. If you had `decim_safety.provider_endpoint` or `DECIM_SAFETY_SYSTEMONE_ENDPOINT` configured, the upgrade moves that endpoint into a SystemOne provider and selects the built-in LiquidAI d1-3B decision model for you.
:::

## How a command is decided

The [Safety page](#configuring-dmss) shows this flow live as you change the policy:

1. **An agent runs a command** — a `bash` or `runpy` tool call.
2. **HMADS scores it** — always in HMADS-only and shadow modes; only as a fallback in enforce mode.
3. **The DMSS model evaluates it** — skipped entirely while DMSS is off, recorded and compared in shadow mode, decisive in enforce mode.
4. **A verdict is applied** — a command is never left undecided.

There are three policies, picked at the top of the Safety page:

| Policy | What happens |
|---|---|
| **HMADS only** | The model is never called. Only local rules decide. Zero extra latency. |
| **DMSS enabled + Shadow** | The model's verdict is recorded and compared, but HMADS still decides. |
| **DMSS enabled + Enforce** | The model decides first. HMADS runs only when the model's answer is unusable. |

## Choosing the model

DMSS uses a model whose **Type** is **Decision** (see [Models](/system/models)). Its provider supplies the endpoint, credentials, and protocol adapter, so DMSS never stores a URL of its own.

1. Create or check the model in **System › Models**.
2. Open **Safety** and choose **DMSS enabled**.
3. Under **Connection → Decision model**, pick the model. An empty list means no decision model is configured yet.

The same card holds the guardrails around model calls:

| Setting | Default | What it does |
|---|---|---|
| **Timeout** | 1500 ms | How long DMSS waits before falling back to HMADS. |
| **Minimum confidence** | 0.90 | Answers below this abstain, and HMADS decides. |
| **Maximum payload** | 12000 chars | Longest command payload sent to the model. |
| **Circuit failures** | 3 | Consecutive provider failures before the circuit opens. |
| **Circuit cooldown** | 60 s | How long the circuit stays open before one probe call is allowed. |

Settings save automatically as you change them, and a **Diagnostic tester** below the form sends a sample payload through the provider end-to-end. It is diagnostic only — production decisions, telemetry, and the circuit breaker are untouched.

## When HMADS takes over

In enforce mode, a confident DMSS decision is final. HMADS steps in as the fallback when DMSS is unusable:

- the call times out (`request_timeout_ms`)
- the provider returns an error
- the circuit breaker is open
- the answer is malformed
- confidence is below `minimum_confidence`

Identical inputs always produce identical outcomes, so a provider outage never leaves a command undecided.

## Enforce behaviour: two switches

Enforce mode has an **Enforce behaviour** section with two toggles:

### Record allowed decisions

When on, every allowed command is stored in the activity table. **Refusals are always stored**, whatever this switch says.

Turn it off when you only care about what was blocked — but note that it leaves no trace of what the model cleared, which makes later audits harder.

### HMADS safety floor

Off by default, so model-first enforcement really is model-first.

Turn it on when local HMADS rules must still apply — for example `git add -A`, which HMADS wants to review but a model might wave through. With the floor on, every command is scored by HMADS as well, and its verdict can **raise** the DMSS severity, never lower it. The floor only makes a decision stricter.

This is the internal `hmads_floor` setting; it is stored as `decim_safety.hmads_floor`.

```text
DMSS: allow (0.94)   HMADS: requires_approval
Floor off → allow    Floor on → requires_approval
```

## Health and activity

The DMSS tab opens with an overview card showing whether DMSS is enabled, the active mode, the circuit state, and a **recording** indicator when decisions are being written to the activity table.

Below it, the **activity table** lists commands an agent ran side by side:

| Column | Meaning |
|---|---|
| **When** | Timestamp of the check |
| **Agent** | The agent that ran the command |
| **Command** | A redacted command preview |
| **HMADS** | What the deterministic rules said |
| **DMSS** | What the model said, if it was called |

You can filter by agent, by engine (`decided_by`), and by verdict. Click a row for the detail modal: the recorded command preview, how it was detected, and the final decision.

If the store cannot be read, the table says **"activity storage unavailable"** with the reason instead of showing an empty list.

## What leaves the machine

Only a small, versioned policy packet is sent: the command and the tool type. No agent context, environment values, credentials, or conversation history leaves the process.

If a command contains something that looks like a secret (an API key, token, password, or a credential in a URL), the payload is **not** sent at all — redaction could change what the command does — and the command falls back to HMADS.

Every DMSS decision also writes one `[dmss-audit]` log line stating whether it was recorded and why.

## Configuring DMSS

1. Go to **System › Models** and confirm you have a model with **Type = Decision**.
2. Open **System › Safety** and select the **DMSS** tab.
3. Choose **DMSS enabled**, then pick **Shadow** to observe first.
4. Wait a day, then read the activity table: compare the HMADS and DMSS columns.
5. When you are happy with the model's calls, switch to **Enforce**.
6. Decide on **Record allowed decisions** and **HMADS safety floor** for your environment.
7. Run one harmless command and watch the flow diagram and activity table update.

**Example — a cautious rollout:**

- Week one: **Shadow**, with the model recorded but not trusted.
- Week two: **Enforce** with **HMADS safety floor** on, so local rules still catch `git add -A`.
- Week three: keep the floor on; turn **Record allowed decisions** on for a full audit trail.

## Related

- [HMADS](/security/heuristic-code-safety) — the deterministic rules DMSS falls back to
- [Models](/system/models) — creating a decision model
- [Security Hardening](/security/hardening) — the wider security surface
