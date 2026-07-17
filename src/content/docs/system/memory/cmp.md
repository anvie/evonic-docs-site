---
title: Context Memory Protocol (CMP)
description: Understanding the standardization of agent memory state.
---

# Context Memory Protocol (CMP)

The **Context Memory Protocol (CMP)** is Evonic's standardized approach to managing agent memory. It ensures that no matter which LLM provider is used, the way context is injected, stored, and recalled remains consistent.

## Why CMP?

In earlier versions, memory management was often tied to the specific prompt format of the model. CMP abstracts this, creating a universal layer between the agent's "brain" and its "memory bank."

### Key Objectives
- **Consistency**: Every agent handles "remembering" and "forgetting" the same way.
- **Portability**: Memory states can be migrated between different models without losing context.
- **Structure**: Moves away from monolithic context windows toward structured, addressable memory blocks.

## How it Works

CMP divides memory into three primary tiers:

### 1. Short-Term (Working) Memory
This is the immediate conversation history. CMP manages the "sliding window" of the current session, ensuring that the most relevant recent turns are preserved while older ones are compressed or archived.

### 2. Episodic Memory
Structured logs of past interactions. When an agent needs to recall a specific event from two weeks ago, CMP queries the episodic store to inject that specific "episode" back into the working memory.

### 3. Semantic Memory (Knowledge Graph)
The highest level of abstraction. Fact-based knowledge (e.g., *"User prefers Python over JavaScript"*) is stored as entities and relations. CMP allows the agent to traverse this graph to find connected facts.

## CMP Integration Flow

When an agent processes a request:
1. **Analyze**: The system identifies key entities in the user request.
2. **Fetch**: CMP retrieves relevant semantic facts and recent episodic events.
3. **Inject**: These are formatted into a standardized `[MEMORY]` block at the top of the system prompt.
4. **Update**: After the response, any new facts discovered are committed back to the memory store via CMP.

## Developer Note
If you are building custom plugins that interact with memory, use the `cmp_get_context()` and `cmp_update_state()` internal APIs rather than modifying the prompt directly.
