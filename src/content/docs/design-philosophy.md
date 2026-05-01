---
title: Design Philosophy
description: The guiding principles behind Evonic's architecture and design decisions.
sidebar:
  order: 0
---

Evonic is built around five core principles that shape every design decision, from the runtime model to the developer experience.

## Open Model First

Evonic is designed and optimized for open-source models, not proprietary APIs. We believe in avoiding vendor lock-in by supporting open model out of the box, giving you the freedom to choose and switch models without rewriting your system.

## Minimal Dependencies

We keep external dependencies to an absolute minimum to reduce supply-chain risk. Every library in the core is evaluated against the principle of simplicity — only what's necessary stays, everything else lives in plugins.

## Agent-to-Agent Protocol

Communication between agents is a first-class concept, not an afterthought. Each agent has its own role, tools, skills, and workplace — making it natural to orchestrate multi-agent swarms where every participant contributes its own capabilities.

## Safety by Design

Safety is built into Evonic's architecture through two complementary layers — not bolted on as an afterthought.

**Isolated Execution.** Every agent runs inside its own sandboxed workspace. File operations, process execution, and network access are strictly confined to the agent's designated environment — no untrusted action can leak into the host system. This isolation is what makes a truly agentic system viable: agents can act freely without compromising the platform's integrity.

**Heuristic Safety System.** Beyond isolation, every command is inspected through a multi-layer heuristic safety system before execution. Dangerous patterns — mass deletion, privilege escalation, or remote code execution — are caught and blocked at checkpoints. When an agent's behavior drifts into unexpected territory, the system escalates to you for approval instead of blindly executing. This means even a misbehaving agent within a swarm can be intercepted and controlled before any real damage occurs.

These two layers together create a safety model where agents operate with real autonomy inside clear boundaries — so you can let AI agents work without constant supervision or worry.

## Fast & Reliable

Performance and reliability aren't luxuries — they're the foundation. Evonic is designed for speed by default, with robust error handling and state management so your agents can execute consistently under load.

## Moving Forward

These principles guide every feature, every API surface, and every architectural choice. As Evonic evolves, these commitments remain our north star — ensuring the system stays open, lean, and dependable.
