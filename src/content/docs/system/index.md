---
title: System Architecture
description: Overview of the Evonic architecture: agents, skills, plugins, models, and events.
sidebar:
  order: 1
---

This section covers the core architecture of Evonic: the building blocks that power every agent, skill, and plugin.

```
                              ┌──────────────┐
                              │   Frontend   │
                              │   (Vanilla)  │
                              └──────┬───────┘
                                     │ HTTP
                              ┌──────▼───────┐
                              │  Flask App   │
                              │  (app.py)    │
                              └──────┬───────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
    ┌─────────▼─────────┐   ┌───────▼───────┐   ┌─────────▼─────────┐
    │    Agents          │   │    Skills      │   │    Plugins        │
    │                    │   │                │   │                   │
    │ • Agent Runtime    │   │ • Tool Defs    │   │ • Event Handlers  │
    │ • Sessions         │   │ • Backends     │   │ • Flask Routes    │
    │ • Knowledge Base   │   │ • Lifecycle    │   │ • Config Vars     │
    │ • Tools            │   │                │   │                   │
    └────────┬──────────┘   └───────┬────────┘   └────────┬──────────┘
             │                      │                      │
    ┌────────▼──────────────────────▼──────────────────────▼──────────┐
    │                     Agent Runtime Engine                         │
    │                                                                  │
    │  message_received → processing → llm_call → tool_execute →     │
    │  final_answer → message_sent → turn_complete                   │
    │                                                                  │
    │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
    │  │ LLM Client   │    │ Tool Registry│    │ Event Stream │       │
    │  │ (OpenAI API) │    │ (plugins/    │    │ (pub/sub bus)│       │
    │  └──────────────┘    │  skills/)     │    └──────────────┘       │
    │                      └──────────────┘                           │
    └────────────────────────────────────────────────────────────────┘
             │
    ┌────────▼───────────────────────────────────────────────────────┐
    │                     Persistence Layer                          │
    │  SQLite (models/db.py): sessions, messages, agents, models,  │
    │  evaluations, results, and more                               │
    └───────────────────────────────────────────────────────────────┘
```

## Key Components

| Component | Description | Docs |
|-----------|-------------|------|
| [Agents](/system/agents) | Agent runtime, sessions, knowledge bases, tools, and channels | [Overview](/agents/overview) |
| [Skills](/system/skills) | Installable packages that bundle tool definitions with Python backends | [Skills](/skills/skills) |
| [Plugins](/system/plugins) | Event-driven extensions that respond to platform events | [Overview](/plugins) |
| [Models](/system/models) | Model configuration and management | [Local Models](/local-models/overview) |
| [Events](/system/events) | Platform event stream for plugin integration | [Events](/system/events) |

## Next Steps

- Read the [Agents overview](/agents/overview) to understand the core platform
- Explore [Skills](/skills/skills) to extend agent capabilities
- Learn about [Plugins](/plugins) to build custom integrations
- Review [Events](/system/events) to understand the event-driven architecture
