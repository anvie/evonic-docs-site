---
title: HMADS (Heuristic Mal-Activity Detection System)
description: Multi-layer HMADS protecting runpy, bash, and file tools from dangerous operations.
---

## Overview

The `runpy`, `bash`, `read_file`, and `write_file` tools are protected by a **3-layer HMADS (Heuristic Mal-Activity Detection System)** that detects and prevents dangerous operations. The system is implemented in `backend/tools/lib/heuristic_safety.py` and `backend/tools/safety_checker.py`, and is applied before any command is executed.

HMADS uses a **scoring-based** approach — instead of simple allow/block, it evaluates risk on a sliding scale and determines the appropriate response:

| Output Level | Score Range | Action |
|---|---|---|
| `safe` | 0–3 | Execute normally |
| `warning` | 4–7 | Execute + log warning |
| `requires_approval` | 8–14 | Halt, request user confirmation |
| `dangerous` | 15+ | Reject immediately (no override) |

---

## Layer 1: Pattern Matching

The first layer scans the command string using regex patterns. It checks against multiple categorized pattern lists, each with its own weight.

### Pattern Categories

| Pattern List | Targets | Score Range |
|---|---|---|
| `DESTRUCTIVE_PATTERNS` | File deletion, disk ops, privilege escalation, remote code execution, package uninstall | 5–13 |
| `DANGEROUS_PATTERNS` | Sandbox bypass, command execution, network access, sensitive files, SSH access, Docker escape, obfuscation | 6–15 |
| `BASH_DANGEROUS_PATTERNS` | Bash-specific dangerous patterns (rm -rf, docker, nc, sudo, etc.) | 5–15 |
| `NETWORK_PATTERNS` | Python network libraries (urllib, requests, http) | 3–5 |
| `SENSITIVE_FILE_PATTERNS` | Password/secret references | 6 |
| `SQLITE_ACCESS_PATTERNS` | SQLite database access (cli, imports, file access) | 4–8 |

### Example Matches

```python
# This would trigger DANGEROUS_PATTERNS (score: 10)
"import ctypes"        # sandbox_bypass (weight: 12) → dangerous

# This would trigger DANGEROUS_PATTERNS (score: 6)
"open('/etc/passwd')"  # sensitive_file (weight: 6) → warning

# This would trigger SQLITE_ACCESS_PATTERNS (score: 8)
"import sqlite3"       # sqlite_access (weight: 8) → requires_approval
```

### Deduplication

If the same category appears in multiple pattern lists (e.g., `/etc/shadow` matching both `DANGEROUS_PATTERNS` and `SENSITIVE_FILE_PATTERNS`), only the **highest-weight** match per category is kept through deduplication.

---

## Layer 2: AST Analysis (Python only)

The second layer parses Python code into an **Abstract Syntax Tree (AST)** and analyzes it structurally. This catches dangerous patterns that regex alone might miss.

### What It Checks

- **Import tracking** — logs all imported modules
- **Function call analysis** — detects dangerous calls like `exec()`, `compile()`, `os.system()`, `os.popen()`, `socket.socket()`
- **Attribute chain resolution** — resolves nested calls like `os.path.join()`

### Example

```python
# AST analysis catches this even though it's across multiple lines
code = """
import os
cmd = 'rm -rf /'
os.system(cmd)
"""
```

AST analysis would flag:
- `import os` → import tracked
- `os.system()` → dangerous call (weight: 10)

Combined with Layer 1 pattern matching, this would likely push the score into `dangerous` territory.

---

## Layer 3: Scoring & Decision

The third layer combines results from Layers 1 and 2, applies **contextual modifiers**, and determines the final output level.

### Modifiers

| Condition | Score Bonus |
|---|---|
| Multiple dangerous imports (e.g., `ctypes` + `socket`) | +5 |
| Obfuscation patterns detected | +5 |
| Network + command execution combined | +3 |

### Final Decision

```
Score 0–3:   safe          → Execute without restriction
Score 4–7:   warning       → Execute with warning log
Score 8–14:  requires_approval → Request user confirmation
Score 15+:   dangerous     → Reject immediately
```

### Approval Info

When a command hits `requires_approval`, the system generates an `approval_info` payload with:

```json
{
  "risk_level": "medium",
  "description": "This action accesses local SQLite database files which may contain sensitive data.",
  "categories": ["sqlite_access"],
  "pattern_count": 2
}
```

Risk levels: `critical`, `high`, `medium`.

---

## SQLite Database Safety

In addition to the 3-layer command safety, there's a **dedicated SQLite path checker** in `backend/tools/safety_checker.py` that protects file read/write operations.

The `check_sqlite_path()` function uses **3 layers of defense**:

### Layer 1: Extension Matching

Checks if the file path has a `.db`, `.sqlite`, or `.sqlite3` extension.

### Layer 2: Path Component Analysis

Splits the path by separators and checks each component for database extensions.

### Layer 3: Canonical Path Resolution

Resolves symlinks and relative paths to their canonical form, then re-checks.

### Integration Points

- **`read_file.py`** — calls `check_sqlite_path()` before reading a file
- **`write_file.py`** — calls `check_sqlite_path()` before writing to a file

Both tools return a `requires_approval` response if a database file is detected.

### Sensitive Database Files

The following filenames are given **higher priority**:

- `chat.db` — Evonic's project chat database
- `database.db` — generic database reference

Accessing these always triggers `requires_approval`.

### Scoring

The HMADS patterns for SQLite are tuned to stay **within the `requires_approval` range** (8–14) to prevent accidental spillover into `dangerous`:

| Pattern | Weight | Alone | Combined with sqlite_access |
|---|---|---|---|
| `sqlite3` command | 8 | requires_approval | — |
| `import sqlite3` | 8 | requires_approval | — |
| `sqlite3.connect()` | 8 | requires_approval | — |
| `chat.db` reference | 6 | warning | 14 (requires_approval) |
| `*.db` reference | 4 | warning | 12 (requires_approval) |
| `*.sqlite` reference | 4 | warning | 12 (requires_approval) |

---

## Super Agent Exemption

**Super agents** (`is_super: true`) bypass all HMADS checks entirely. This is because super agents own the system and are trusted to execute any command.

In `bash.py` and `runpy.py`, the safety check is skipped when:

```python
if not agent.get('_skip_safety') and \
   agent.get('safety_checker_enabled', 1) and \
   not agent.get('is_super'):
    # Run HMADS check
```

This means super agents can:
- Execute any bash command without restrictions
- Run dangerous Python code without approval
- Access SQLite databases without gate checks

---

## Error Handling

When a command is blocked, the tool returns an error with details about which rule was triggered:

```json
{
  "error": "Command blocked by safety rule: rm -rf / matches dangerous pattern 'file_destruction'",
  "level": "dangerous",
  "score": 10,
  "reasons": ["Destructive file removal command (rm -rf, except /tmp)"],
  "blocked_patterns": ["file_destruction"],
  "requires_approval": false
}
```

For `requires_approval` responses in file tools:

```json
{
  "error": "Safety check: Access to SQLite database denied. 'chat.db' is a sensitive project database. Database file access requires approval.",
  "requires_approval": true,
  "reason": "Sensitive database file detected: chat.db"
}
```

---

## Configuration

HMADS is configured in two files:

### Pattern Rules — `backend/tools/lib/heuristic_safety.py`

To add new patterns:

1. Add the pattern to the appropriate list (`DESTRUCTIVE_PATTERNS`, `DANGEROUS_PATTERNS`, etc.)
2. Provide a weight, category, and description
3. Ensure the category is **unique** across pattern lists (or handled by deduplication)
4. Test with the HMADS test suite

### File-Level Safety — `backend/tools/safety_checker.py`

To add new file-level safety checks:

1. Add path patterns or extension sets
2. Implement the check function with multiple defense layers
3. Integrate into `read_file.py` and/or `write_file.py`

---

## Safety Pipeline Architecture

*Introduced in v0.2.0. Restructured in v0.2.6.*

The safety system follows a **pipeline architecture** where each check runs in sequence. If any check fails, the pipeline short-circuits and returns the result immediately:

```
Input command
      │
      ▼
┌─────────────────┐
│ CustomRuleChecker│── check custom rules first
└────────┬────────┘
         │ (pass)
         ▼
┌─────────────────┐
│  Layer 1: Pattern │── regex pattern matching
│     Matching      │
└────────┬────────┘
         │ (pass)
         ▼
┌─────────────────┐
│ Layer 2: AST    │── Python AST analysis
│   Analysis       │
└────────┬────────┘
         │ (pass)
         ▼
┌─────────────────┐
│ Layer 3: Scoring│── combine scores + modifiers
│  & Decision      │
└────────┬────────┘
         │
         ▼
    Final decision
 (safe / warning / requires_approval / dangerous)
```

### CustomRuleChecker

*Introduced in v0.2.0.*

The `CustomRuleChecker` sits at the **front of the safety pipeline** and checks user-defined custom safety rules before any built-in patterns are evaluated. This allows you to:

- **Add organization-specific rules** — block or warn on internal tooling patterns
- **Whitelist known safe operations** — bypass HMADS for trusted workflows
- **Override default weights** — increase or decrease severity for specific patterns

Custom rules are defined in `config/custom_safety_rules.json`:

```json
{
  "rules": [
    {
      "pattern": "rm -rf /data/archive",
      "action": "allow",
      "description": "Allow cleanup of archive directory"
    },
    {
      "pattern": "kubectl delete",
      "action": "require_approval",
      "description": "Kubernetes delete operations need approval"
    }
  ]
}
```

Each rule has:
- **`pattern`**: regex pattern to match against the command
- **`action`**: `allow`, `warn`, `require_approval`, or `block`
- **`description`**: explanation logged when the rule matches

Rules are checked in order. The **first matching rule** wins — if a rule matches, all subsequent HMADS layers are skipped.

### Sensitive System Path Check

*Introduced in v0.2.0. Updated in v0.2.6.*

The safety system includes a dedicated check for **sensitive system paths** that should never be accessed by regular agents. This is enforced at the file tool level (read/write operations):

| Path Pattern | Risk | Action |
|---|---|---|
| `/etc/shadow` | Critical | Blocked |
| `/etc/sudoers` | Critical | Blocked |
| `/root/` | High | Requires approval |
| `~/.ssh/` | High | Requires approval |
| `.env` files | High | Requires approval |
| `/var/log/auth.log` | Medium | Warning |

#### .env File Safety Check

*Introduced in v0.2.6. Hardened in v0.3.19.*

Access to `.env` files is checked with a dedicated rule. This prevents agents from reading environment variables containing API keys, secrets, and database credentials:

- **Read access** to `.env` files → `requires_approval`
- **Write access** to `.env` files → `requires_approval`
- **Pattern**: matches `*.env`, `.env`, `.env.*`, and `env` directory references

The check is context-aware: it only triggers for files that look like environment configuration, not for unrelated files containing `env` in their name.

In v0.3.19, `.env` file protection was extended to cover **all file operation tools** (`read_file`, `write_file`, `patch`, `str_replace`) with additional path normalization checks to prevent bypass attempts through symlinks, relative paths, or encoded characters.

#### Improved SQL False Positive Reduction

*Introduced in v0.2.6.*

The SQLite access detection patterns have been refined to reduce **false positives**. The following changes were made:

| Before | After | Effect |
|--------|-------|--------|
| `sqlite3` command → `dangerous` (15) | → `requires_approval` (8) | Legitimate SQL queries no longer trigger dangerous |
| `import sqlite3` → `dangerous` (15) | → `requires_approval` (8) | Python SQLite usage gets a fairer score |
| `chat.db` ref + `sqlite_access` → 20+ | → 14 (capped) | Combined patterns stay in approval range |

The scoring was also capped to prevent certain pattern combinations from exceeding the `dangerous` threshold when they should remain at `requires_approval`.

---

## v0.3.19 Security Audit & Hardening

*Introduced in v0.3.19.*

The v0.3.19 release includes fixes for findings from a **production readiness security audit**:

| Finding | Severity | Fix |
|---------|----------|-----|
| C-1 | Critical | Path traversal in skill installation — prevents arbitrary file overwrite during install |
| C-2 | Critical | Command injection in update manager — prevents code injection via crafted version strings |
| H-5 | High | Improved version comparison — handles pre-release versions safely with backward compatibility |
| M-4 | Medium | Additional input sanitization in file operation tools |
| M-6 | Medium | Strengthened regex boundaries in pattern matching |
| M-7 | Medium | Better error handling for edge cases in safety pipeline |

### Path Traversal Prevention (Skill Installation)

Skill installation now validates that extracted files stay within the target skill directory. Attempts to use `../` or absolute paths in archive entries are rejected:

```python
# Before: archive entry "../../etc/hack" could overwrite system files
# After:  entry is normalized and rejected if it escapes the install directory
```

### Command Injection Prevention (Update Manager)

The update manager now sanitizes version strings before passing them to shell commands, preventing injection attacks via crafted version tags.

### .env File Protection

In addition to the existing `.env` checks, v0.3.19 adds:

- **Broader tool coverage** — protection extended to `patch` and `str_replace` tools
- **Path normalization** — resolves symlinks and relative paths before checking
- **Encoded path detection** — catches URL-encoded and Unicode-normalized bypass attempts
- **Additional tool-level checks** — prevents `.env` manipulation through indirect paths

---

## Testing

Run the HMADS tests:

```bash
python3 tests/test_heuristic_safety.py
```

This verifies:
- Safe Python/Bash code is not flagged
- Dangerous code is correctly identified
- Categories are properly deduplicated
- Approval info is generated for `requires_approval` cases
- All safety rules work correctly
- Legitimate commands are not blocked

Run the SQLite-specific safety tests:

```bash
python3 tests/run_heuristic_tests.py
```
