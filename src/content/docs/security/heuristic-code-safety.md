---
title: Heuristic Code Safety
description: 3-layer safety system protecting runpy and bash tools from dangerous operations.
---

## Overview

The `runpy` and `bash` tools are protected by a **3-layer heuristic safety system** that prevents dangerous operations. The safety system is implemented in `backend/tools/lib/heuristic_safety.py` and is applied before any command is executed.

## Layer 1: Pattern Matching

The first layer blocks dangerous patterns in the command string using regex matching.

### Blocked Patterns

| Pattern | Example | Reason |
|---------|---------|--------|
| `rm -rf /` or `rm -rf *` | `rm -rf /` | Mass file deletion |
| `dd if=` | `dd if=/dev/zero` | Raw disk writing |
| `mkfs` | `mkfs.ext4` | Filesystem formatting |
| `>/dev/sd` | `> /dev/sda` | Direct disk writing |
| `wget` + `| bash` | `wget ... | bash` | Remote code execution |
| `curl` + `| bash` | `curl ... | bash` | Remote code execution |
| `chmod 777` | `chmod 777 /` | World-writable permissions |
| `chown root` | `chown root /` | Privilege escalation |
| `iptables` | `iptables -F` | Firewall manipulation |
| `shutdown` | `shutdown -h now` | System shutdown |
| `reboot` | `reboot` | System reboot |
| `kill -9` | `kill -9 1` | Force kill processes |

## Layer 2: Path Validation

The second layer ensures file operations stay within the agent's workspace directory.

### Rules

- All file paths must be relative to the workspace directory
- `../` traversal is rejected
- Absolute paths outside the workspace are rejected
- Symlinks pointing outside the workspace are rejected

### Example

```
Workspace: /workspace/agents/my_agent/workspace/

✓ Allowed:  "write_file('notes.md', 'content')"
✗ Blocked:  "write_file('../../etc/passwd', 'hacked')"
✗ Blocked:  "write_file('/etc/shadow', 'hacked')"
```

## Layer 3: Command Whitelisting

The third layer restricts allowed commands and flags.

### Allowed Commands

| Category | Commands |
|----------|----------|
| File operations | `cat`, `ls`, `find`, `grep`, `wc`, `head`, `tail`, `sort`, `uniq`, `diff`, `patch` |
| Text processing | `sed`, `awk`, `tr`, `cut`, `tee` |
| System info | `uname`, `df`, `du`, `free`, `whoami`, `id` |
| Python | `python3`, `pip`, `pip3` |
| Git | `git status`, `git diff`, `git log` (read-only) |
| Package managers | `apt-get update`, `apt-get install` (with restrictions) |

### Blocked Flags

| Flag | Reason |
|------|--------|
| `-rf` (rm) | Recursive force deletion |
| `--force` (many commands) | Bypass safety checks |
| `-i` (rm) | Interactive mode (can be abused) |
| `--all` (ls with dangerous commands) | Access restricted files |

## Error Handling

If a command is blocked by any layer, the tool returns an error:

```json
{
  "error": "Command blocked by safety rule: Pattern 'rm -rf /' matches dangerous pattern 'mass_deletion'",
  "rule": "mass_deletion",
  "layer": 1
}
```

The error message includes:
- The rule that was triggered
- Which safety layer blocked it
- A human-readable explanation

## Configuration

The safety system is configured in `backend/tools/lib/heuristic_safety.py`. To add new rules:

1. Add the pattern to the appropriate layer's rule list
2. Provide a descriptive name for the rule
3. Test with the heuristic safety test suite

## Testing

Run the heuristic safety tests:

```bash
python3 tests/test_heuristic_safety.py
```

This verifies that all safety rules are working correctly and that legitimate commands are not blocked.
