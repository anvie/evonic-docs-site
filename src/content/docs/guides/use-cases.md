---
title: Use Cases
description: Explore the wide range of scenarios where Evonic agents excel — from customer service to AI workflow orchestration.
sidebar:
  order: 10
---

Evonic's agentic framework is designed to handle diverse real-world scenarios. Whether you need a single conversational agent for customer support or a multi-agent swarm orchestrating complex enterprise workflows, Evonic provides the building blocks to design, deploy, and manage AI agents at scale.

Below is a curated collection of use cases, organized by domain and complexity level.

---

## 🤝 Customer Service & Support

### Customer Service Agent
Deploy an agent to handle inbound customer inquiries across multiple channels — Telegram, WhatsApp, or web chat.

**Capabilities:**
- Answer FAQs from a knowledge base
- Process refunds and cancellations via tool execution
- Escalate complex issues to human agents
- Maintain conversation context across sessions

```bash
# Example: Create a customer service agent
./evonic agent add support_bot --name "Customer Support"
./evonic agent enable support_bot
```

### Internal Helpdesk
A dedicated agent for IT support, HR policy lookups, and employee onboarding queries.

**Capabilities:**
- Retrieve internal documentation and policies
- Log support tickets via API calls
- Route issues to the appropriate department
- Keep a record of all resolved incidents

### Customer Onboarding
Guide new users through your product's setup workflow step by step.

**Capabilities:**
- Send personalized onboarding sequences
- Validate configuration inputs
- Trigger welcome emails and account provisioning
- Hand off to human support when stuck

---

## 👤 Personal & Productivity

### Personal Companion
A long-running agent that helps with daily tasks, research, and reminders.

**Capabilities:**
- Schedule reminders and recurring tasks via the Scheduler
- Browse and summarize web content
- Maintain long-term memory across sessions
- Manage to-do lists and notes

### Research Assistant
Automate literature reviews, data extraction, and summarization tasks.

**Capabilities:**
- Search and retrieve academic papers or web sources
- Extract structured data from unstructured text
- Generate annotated summaries with citations
- Store findings in the agent's knowledge base

---

## 🤖 Multi-Agent & Orchestration

### Agentic Swarm
Deploy multiple agents with specialized roles that collaborate to achieve a common goal.

**Example swarm configuration:**

| Agent | Role | Tools |
|-------|------|-------|
| `researcher` | Gathers and summarizes information | `web_search`, `read`, `summarize` |
| `analyst` | Validates data and runs calculations | `runpy`, `bash`, `chart` |
| `writer` | Produces the final output | `write_file`, `edit` |
| `reviewer` | Checks quality and consistency | `read`, `diff`, `evaluate` |

Agents communicate natively via Evonic's **agent-to-agent protocol**, making orchestration seamless without custom glue code.

### AI Workflow Orchestration
Orchestrate end-to-end AI pipelines using a coordinating agent.

**Pipeline example — Model Training Pipeline:**

```
data_ingestion → preprocessing → training → evaluation → deployment
```

Each stage can be handled by a dedicated agent or executed sequentially by a single orchestrator agent:

```bash
# An orchestrator agent triggers pipeline stages
./evonic agent add ml_pipeline --name "ML Pipeline Orchestrator"
./evonic agent enable ml_pipeline
```

The orchestrator agent monitors each stage, logs results, and triggers rollback if evaluation thresholds aren't met.

---

## ⚙️ DevOps & Automation

### Automation & DevOps Agent
Monitor infrastructure, trigger deployments, and respond to incidents autonomously.

**Capabilities:**
- Run health checks on servers and services
- Execute deployment scripts via SSH workplaces
- Rollback to previous versions on failure
- Send alerts via primary channel (Telegram, WhatsApp)
- Integrate with monitoring APIs (Prometheus, Datadog, etc.)

### Agentic ERP
Manage enterprise resource planning workflows — supply chain, inventory, procurement, and finance — through purpose-built agents.

**Example multi-agent ERP setup:**

| Agent | Domain | Responsibilities |
|-------|--------|------------------|
| `inventory_agent` | Inventory Management | Tracks stock levels, triggers reorder alerts |
| `procurement_agent` | Procurement | Generates purchase orders, negotiates with suppliers |
| `finance_agent` | Finance | Processes invoices, reconciles payments |
| `supply_chain_agent` | Logistics | Optimizes routing, tracks shipments |
| `erp_orchestrator` | Coordination | Resolves conflicts, prioritizes tasks |

Each agent has its own knowledge base (supplier catalogs, pricing sheets, SLA documents) and communicates with others via the agent-to-agent protocol. The orchestrator ensures decisions are aligned with business rules.

---

## ✅ Quality & Evaluation

### Quality Assurance / Evaluation Agent
Automate LLM evaluation and regression testing.

**Capabilities:**
- Run customizable evaluators (regex, semantic, custom)
- Benchmark model performance across test datasets
- Generate comparison reports between model versions
- Gate deployments based on passing criteria

```bash
# Run an evaluation suite
./evonic eval run my_eval_suite
./evonic eval report my_eval_suite --format html
```

---

## 🛒 E-Commerce

### E-commerce Assistant
Help customers discover products, track orders, and manage their purchases.

**Capabilities:**
- Product recommendations based on preferences
- Order status tracking and delivery updates
- Cancellation and return processing
- Wishlist and cart management

---

## 🏥 Healthcare

### Healthcare Triage Agent
Perform initial symptom assessment and guide patients to appropriate care.

**Capabilities:**
- Structured symptom intake questionnaire
- Escalate urgent cases to human triage
- Schedule appointments via calendar tools
- Retrieve patient history (within compliance boundaries)

---

## 📚 Education

### Education Tutor
Provide personalized learning assistance to students.

**Capabilities:**
- Adapt explanations to the student's level
- Generate practice problems and quizzes
- Track progress across learning modules
- Reference a curriculum knowledge base

---

## 🛡️ Safety & Moderation

### Content Moderation Agent
Automatically detect and handle harmful content across platforms.

**Capabilities:**
- Flag toxic or prohibited content
- Escalate ambiguous cases for human review
- Apply platform-specific moderation policies
- Log moderation decisions for audit

---

## 💰 Financial Services

### Financial Advisory Agent
Provide portfolio analysis, market summaries, and risk assessments.

**Capabilities:**
- Fetch and analyze market data via API tools
- Generate investment summaries and reports
- Assess portfolio risk based on user-defined parameters
- Trigger alerts on significant market movements

---

## Summary

| Category | Use Case | Complexity |
|----------|----------|------------|
| Customer Service | Customer Service Agent | Low |
| Customer Service | Internal Helpdesk | Low |
| Customer Service | Customer Onboarding | Medium |
| Personal | Personal Companion | Low |
| Personal | Research Assistant | Medium |
| Multi-Agent | Agentic Swarm | High |
| Multi-Agent | AI Workflow Orchestration | High |
| DevOps | Automation & DevOps Agent | Medium |
| DevOps | Agentic ERP | High |
| Quality | QA / Evaluation Agent | Medium |
| E-Commerce | E-commerce Assistant | Low |
| Healthcare | Healthcare Triage | Medium |
| Education | Education Tutor | Medium |
| Safety | Content Moderation | Medium |
| Financial | Financial Advisory Agent | High |

---

Start building your first use case with the [Quick Start Guide](/getting-started/installation). To learn more about designing agents, see the [Agents Overview](/agents/overview).
