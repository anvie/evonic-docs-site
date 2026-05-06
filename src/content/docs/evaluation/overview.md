---
title: Overview
description: Overview of the Evonic evaluation system — how it works and what's in this section.
sidebar:
  order: 0
---

The Evonic evaluation engine lets you test LLM performance across multiple domains with structured, repeatable, and scoring-based evaluations. Each test goes through a multi-pass pipeline that produces a normalized score from 0.0 to 1.0.

## What You'll Find Here

This section covers everything you need to know about evaluation in Evonic:

| Page | What It Covers |
|---|---|
| [Evaluation Workflow](/evaluation/evaluation-workflow) | The complete end-to-end pipeline: test loading, prompt resolution, LLM passes, scoring, and persistence |
| [Test Definitions](/evaluation/test-definitions) | How to author and organize test definition JSON files — domain configs, test format, expected outputs |
| [System Prompt Hierarchy](/evaluation/system-prompt-hierarchy) | How the 3-layer prompt resolution works (Domain → Level → Test), with overwrite vs append modes |
| [Evaluator Types](/evaluation/evaluator-types) | All built-in evaluator strategies: Keyword, Two-Pass, SQL Executor, Tool Call, and Custom evaluators |
| [Regex Evaluators](/evaluation/regex-evaluators) | Built-in regex patterns, scoring modes, and how to create custom regex evaluators |
| [Headless Mode](/evaluation/headless-mode) | Run evaluations from the command line without the web UI |

## Quick Summary

**The pipeline works like this:**

1. **Test Loading** — loads test definitions organized by domain and difficulty level (1–5)
2. **System Prompt Resolution** — resolves prompts through a 3-layer hierarchy
3. **PASS 1** — sends the full prompt to the LLM and receives a response
4. **Evaluator Routing** — routes the response to the right evaluator strategy
5. **PASS 2 (optional)** — extracts the final answer in a strict format for certain evaluators
6. **Scoring** — produces a score (0.0–1.0) and pass/fail status
7. **Aggregation** — computes weighted scores per domain/level
8. **Persistence** — saves everything to SQLite

See [Evaluation Workflow](/evaluation/evaluation-workflow) for the full breakdown, or jump straight to [Test Definitions](/evaluation/test-definitions) to start writing your own tests.
