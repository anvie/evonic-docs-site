---
title: Native Decision Model
description: Evonic's built-in decision model feature — Decision Profiles, the Bounded Playground, and integrating decisions into skills and plugins.
sidebar:
  order: 6
---

# Native Decision Model

We call it the **Native Decision Model**. The best part? You don't need to install anything extra or wire up a separate service. Evonic supports decision models natively — you can just start using it.

A decision model is a model that answers structured, yes-or-no-or-review questions: *"Should this command run?"*, *"Does this text match the pattern?"*, *"What category does this belong to?"* — and it does it fast, consistently, and with a confidence score.

## Decision Profiles

To make decision models easy to reuse, Evonic wraps them in something we call a **Decision Profile**.

A decision profile is a **named, versioned bundle** that ties together:

- A **decision type** (what question you're answering)
- A **schema** (the shape of the answer the model should return)
- A **primary model** (the decision model that will answer)
- **Fallback behavior** (what happens if the model is slow, down, or unsure)

Profiles are created, edited, and validated from the administration UI before they go live. This means you can tweak a profile, test it, and version it — without touching any code.

### A concrete example

Imagine you want an agent to route incoming messages into categories like *"billing"*, *"technical"*, or *"general"*. Instead of writing routing logic in Python, you:

1. Define a decision type: `message_category`
2. Write a schema that asks the model to return one of those categories plus a confidence score
3. Point the profile at a decision model (like the built-in LiquidAI d1-3B)
4. Set a fallback (e.g., default to *"general"* if the model times out)

Now any skill or plugin can ask *"what category is this message?"* using the profile name — no model details, no schema parsing, no provider URLs.

## Testing in the Bounded Playground

Before you wire a profile into production, you can test it in the **Bounded Playground**.

It's a safe, inference-only space where you feed sample payloads to a profile and see how it responds. The key thing to know: **playground runs never touch production activity or state**. You can experiment freely, break things, and delete samples — all without risking your real data.

**Example workflow:**

- Create a profile for `message_category`.
- Open the Playground and send a few sample messages.
- Check the returned category and confidence score.
- If confidence is too low, adjust the schema or the model, then test again.

Once you're happy, the profile is ready to ship.

## Integrating Decisions into Skills and Plugins

Because decision models are native to Evonic, integrating them into your own skills and plugins is straightforward. You don't need to manage endpoints, credentials, or protocol adapters — Evonic handles all of that behind the scenes through a stable routing contract (`decision-models/v1`).

### From a skill or plugin

When you build a skill or plugin that needs a decision, you reference the **profile name** rather than a model. Evonic routes the request to the right model, applies the schema, and returns a consistent result format — no matter which model or provider is behind it.

This means:

- **Swapping providers is a no-code change.** If you want to move from SystemOne to LiquidAI, you just update the profile in the UI. Your skill or plugin code stays exactly the same.
- **Consistent results.** Consumers always get the same invocation and result format, so you can write your logic once and trust it across models.

### Example: a skill that routes messages

Here's the idea in plain terms (illustrative pseudo-code):

```python
# Inside a skill handler — ask by profile, get a structured decision back
decision = sdk.call_decision_profile(
    profile="message_category",
    payload={"text": incoming_message}
)

if decision.category == "billing" and decision.confidence >= 0.90:
    # route to billing agent
    ...
else:
    # fallback handling
    ...
```

The exact SDK method name and shape depend on your skill/plugin framework, but the principle is the same: **ask by profile, get a structured decision back.**

## Related

- [Models](/system/models) — creating a decision model and understanding LLM vs. Decision types
- [DMSS](/security/dmss) — how Evonic uses a decision model to review commands before they run
