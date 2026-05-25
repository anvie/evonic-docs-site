---
title: Injection Guard
description: Tool-level prompt injection detection that scans tool arguments before execution.
sidebar:
  order: 2
---

**Injection Guard** is a pre-execution safety layer that scans tool arguments for prompt injection patterns before the tool runs. It protects guarded tools from instruction hijacking, system prompt extraction, obfuscated payloads, and other injection techniques.

Injection Guard is separate from [HMADS](/security/heuristic-code-safety). HMADS protects against dangerous operations like file deletion and privilege escalation. Injection Guard protects against prompt injection in tool arguments.

---

## How It Works

When an agent calls a guarded tool, Injection Guard scans its text arguments against a set of detection rules. Each rule has a severity level and a category. If a match is found, the guard compares the severity against the agent's minimum severity threshold and responds according to the agent's configured mode.

### Guarded Tools

These tools have their arguments scanned for injection:

- `write_file` — content and file_path
- `str_replace` — old_str, new_str, file_path
- `patch` — patch content and file_path
- `read_file` — file_path
- `bash` — script content
- `runpy` — script and code content
- `send_agent_message` — message content

### Super Agent Bypass

Super agents bypass Injection Guard entirely, just as they bypass HMADS.

---

## Severity Levels

Each detection rule has a severity level that determines how it is handled:

| Level | Score | Description |
|-------|-------|-------------|
| LOW | 0.2 | Minor suspicion, such as token mentioned with extraction verb |
| WARNING | 0.3 | Credential-related probes |
| MEDIUM | 0.4 | Context manipulation, obfuscation attempts |
| HIGH | 0.7 | Direct instructions to change behavior, payload splitting |
| CRITICAL | 1.0 | Instruction hijacking, system prompt leaking, tool hijacking |

Rules below the agent's minimum severity threshold are skipped. The default threshold is MEDIUM.

---

## Detection Categories

Injection Guard covers 15 categories of injection techniques:

| Category | Examples |
|----------|----------|
| **Direct Override** | Phrases telling the agent to reject its original system prompt |
| **Prompt Leaking** | Requests to copy the full system prompt text |
| **Context Manipulation** | Hypothetical framing, indirect references, few-shot manipulation |
| **Obfuscation** | Base64, hex, unicode escapes, leetspeak, spaced characters, ROT13 |
| **Payload Splitting** | Token concatenation, comment injection |
| **HTML/Markdown Injection** | Suspicious markdown link protocols such as javascript: or data: |
| **Reasoning Hijack** | Distorting chain-of-thought, reward hacking |
| **Indirect Injection** | Second-order injection, document-embedded code |
| **Data Extraction** | Credential and token extraction attempts |
| **Function Call Hijacking** | Tool call injection, output format hijacking |
| **Multilingual Attack** | Attacks using non-English language phrasing |

---

## Configuration

Injection Guard is configured per-agent in the **Advanced Settings** section of the agent detail page.

### Toggle

The **Injection Guard** toggle enables or disables scanning for the agent. It is enabled by default.

### Agent Variables

For programmatic configuration, Injection Guard supports three agent variables:

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `injection_guard_enabled` | `1`, `0` | `1` | Enable or disable the guard |
| `injection_guard_min_severity` | `LOW`, `WARNING`, `MEDIUM`, `HIGH`, `CRITICAL` | `MEDIUM` | Minimum severity to act on |
| `injection_guard_mode` | `block`, `warn`, `log` | `block` | Response mode when injection is detected |

### Response Modes

| Mode | Behavior |
|------|----------|
| **block** | Blocks the tool call and returns a clear error with severity and score |
| **warn** | Blocks the tool call with a warning message advising admin contact |
| **log** | Logs the detection but allows the tool call to proceed |

---

## When to Disable

Injection Guard uses regex-based pattern matching, which can sometimes trigger on legitimate code. Consider disabling it if you experience false positives in:

- Code generation that includes security-related terms
- File operations with paths matching sensitive patterns
- Scripts that construct commands dynamically

The toggle is located in **Advanced Settings** under the agent's General tab, alongside the Safety Checker toggle.
