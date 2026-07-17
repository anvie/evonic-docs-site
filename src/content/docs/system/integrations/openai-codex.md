---
title: OpenAI Codex & Reasoning
description: Advanced coding workflows and Chain-of-Thought visualization.
---

# OpenAI Codex & Reasoning

Evonic integrates deeply with OpenAI's Codex models to provide an optimized experience for technical tasks, software engineering, and complex reasoning.

## Chain-of-Thought (CoT) Thinking Bubbles

One of the most significant additions to the v1.0.0 release is the visualization of the agent's internal reasoning process, known as **Thinking Bubbles**.

### What are Thinking Bubbles?
Instead of jumping straight from a prompt to a final answer, Codex-powered agents now surface their "scratchpad" or internal monologue. These bubbles appear as collapsible blocks before the final response.

### Why this matters
- **Transparency**: You can see *how* the agent arrived at a solution, making it easier to spot logic errors.
- **Debugging**: When an agent fails a task, the thinking bubble often reveals the exact misunderstanding or missing piece of context.
- **Verification**: For complex math or architectural decisions, you can verify the step-by-step reasoning before trusting the code.

## Codex-Optimized Workflows

The system leverages Codex's strengths in structural understanding and code generation:

### 1. Boilerplate Acceleration
Agents can now generate entire project scaffolds based on a single architectural description, utilizing ATG to ensure all files are created in the correct dependency order.

### 2. Context-Aware Refactoring
By combining the **Context Memory Protocol (CMP)** with Codex, agents can refactor code across multiple files while maintaining a consistent understanding of the project's global state.

### 3. Automated Test Generation
Codex agents can analyze existing implementation files and automatically generate corresponding test suites in the `evaluation/` directory, ensuring the "Definition of Done" is numerically verified.

## Tips for Better Reasoning
To get the most out of the reasoning bubbles, try these prompting techniques:
- **"Think step-by-step"**: Explicitly asking the agent to reason will often produce more detailed and accurate thinking bubbles.
- **"Challenge your assumptions"**: Encourage the agent to play devil's advocate in its internal monologue to find edge cases.
- **"Verify before answering"**: Ask the agent to double-check its logic in the thinking block before printing the final code.
