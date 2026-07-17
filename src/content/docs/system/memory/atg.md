---
title: Atomic Task Graph (ATG)
description: Complex goal decomposition and execution tracking.
---

# Atomic Task Graph (ATG)

The **Atomic Task Graph (ATG)** is the engine behind Evonic's advanced planning capabilities. Instead of agents attempting to solve complex goals as a single monolithic prompt, ATG decomposes goals into a Directed Acyclic Graph (DAG) of "atomic" tasks.

## The Concept of Atomicity

An **Atomic Task** is the smallest unit of work that can be independently executed and verified. For example, "Build a website" is not atomic, but "Create index.html with basic boilerplate" is.

## How the Graph Works

When a high-level goal is set, the agent's planner generates an ATG:

1. **Decomposition**: The goal is broken down into sub-tasks.
2. **Dependency Mapping**: The planner identifies which tasks must finish before others can start (e.g., *Install Dependencies* $\rightarrow$ *Run Build* $\rightarrow$ *Deploy*).
3. **Parallelization**: Tasks with no mutual dependencies are flagged for parallel execution (via sub-agents).
4. **Verification**: Each node in the graph has a "done" condition. The graph only progresses when the atomic task is verified as complete.

## Advantages of ATG

### 1. Granular Progress Tracking
Users no longer see a generic "Thinking..." state. The UI can now display a checklist of the exact atomic tasks currently being processed.

### 2. Robust Error Recovery
If a task fails, the agent doesn't have to restart the entire goal. It can simply retry the failed node or recalculate the remaining graph based on the current state.

### 3. Predictable Execution
By forcing the agent to define a graph before acting, "hallucinated" progress is minimized. The agent must commit to a plan and check off items one by one.

## Example ATG Flow

**Goal**: *"Audit the security of the /api/user endpoint"*

- **Task A**: Retrieve API specification for `/api/user`
- **Task B**: List all middleware applied to the route
- **Task C**: (Depends on A) Identify potential input vectors
- **Task D**: (Depends on B & C) Test for SQL injection via identified vectors
- **Task E**: (Depends on D) Summarize findings and suggest fixes

In this graph, **Task A** and **Task B** can run in parallel, while **Task D** waits for both the vectors and the middleware context to be ready.
