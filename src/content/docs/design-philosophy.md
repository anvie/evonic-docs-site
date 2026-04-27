---
title: Design Philosophy
description: The guiding principles behind Evonic's architecture and design decisions.
sidebar:
  order: 0
---

Evonic is built around five core principles that shape every design decision, from the runtime model to the developer experience.

## Open Model First

Evonic is designed and optimized for open-source models, not proprietary APIs. We believe in avoiding vendor lock-in by supporting any OpenAI-compatible model out of the box, giving you the freedom to choose and switch models without rewriting your system.

## Minimal Dependencies

We keep external dependencies to an absolute minimum to reduce supply-chain risk. Every library in the core is evaluated against the principle of simplicity — only what's necessary stays, everything else lives in plugins.

## Agent-to-Agent Protocol

Communication between agents is a first-class concept, not an afterthought. Each agent has its own role, tools, skills, and workspace — making it natural to orchestrate multi-agent swarms where every participant contributes its own capabilities.

## Isolated Execution

Safety is non-negotiable. Agent code runs in isolated environments, ensuring that untrusted operations cannot leak into the host system. This isolation is the foundation that makes a truly agentic system viable.

## Fast & Reliable

Performance and reliability aren't luxuries — they're the foundation. Evonic is designed for speed by default, with robust error handling and state management so your agents can execute consistently under load.

## Moving Forward

These principles guide every feature, every API surface, and every architectural choice. As Evonic evolves, these commitments remain our north star — ensuring the system stays open, lean, and dependable.
