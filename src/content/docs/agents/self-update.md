---
title: Update System
description: Reliable atomic self-update with rollback, SSH signature verification, and Telegram progress notifications.
sidebar:
  order: 100
---

## Overview

Evonic includes an update supervisor that pulls new releases from your Git remote, verifies their SSH signature, installs dependencies in an isolated environment, and swaps the active release atomically: with rollback if anything goes wrong.

**Key properties:**

- **Atomic**: no partial state is ever visible to the running daemon
- **Rollback**: any failure (signature, deps, health check, monitoring) restores the previous release
- **Isolated deps**: each release gets its own virtual environment: no shared-venv conflicts
- **Zero pip dependencies in the supervisor**: the update engine is pure Python stdlib + system `git`
- **Telegram notifications**: edit-in-place progress messages, separate failure alerts

---

## Architecture

```
Git remote ──► git fetch --tags ──► git verify-tag (SSH sig)
                                  │
                          git worktree add releases/<tag>/
                                  │
                          uv venv + pip install (isolated)
                                  │
                          health check on temp port
                                  │
                              stop daemon ──► atomic pointer swap
                                  │
                              start daemon ──► monitor 60s
                                  │
                                   rollback on any failure
```

### Directory layout

After migration the repository looks like this:

```
evonic/
├── .git/                        # single git object store
├── releases/
│   ├── v1.0.0/                  # previous release (git worktree)
│   │   └── .venv/
│   └── v1.1.0/                  # current live release (git worktree)
│       ├── .venv/
│       ├── db      → ../../shared/db/      # symlink
│       ├── agents  → ../../shared/agents/
│       └── ...
├── current → releases/v1.1.0/   # atomic symlink (POSIX)
├── current.slot                 # Windows: same pointer, text file
├── rollback.slot                # "v1.0.0": used by auto-rollback
├── supervisor/
│   ├── supervisor.py            # stdlib-only update engine
│   ├── migrate.py               # one-time migration script
│   └── config.json              # poll interval, telegram creds
└── shared/                      # mutable state, survives across releases
    ├── db/evonic.db
    ├── agents/
    ├── logs/
    ├── run/evonic.pid
    ├── .env
    └── .ssh/allowed_signers
```

Each release worktree has symlinks pointing into `shared/` for all mutable data. `config.py`'s `BASE_DIR` resolves through these symlinks transparently: no application code changes are required.

## Update lifecycle

Each update runs 6 ordered steps. Any failure triggers rollback.

| Step | Action | Progress |
|---|---|---|
| 1 | Fetch tags from remote | 17% |
| 2 | Verify SSH signature on new tag | 33% |
| 3 | Create worktree, install deps, link `shared/` | 50% |
| 4 | Start release on temp port, probe `/api/health` | 67% |
| 5 | Stop daemon → atomic pointer swap → write `rollback.slot` | 83% |
| 6 | Start new daemon → monitor health for `monitor_duration` seconds | 100% |

### Rollback

If any step fails:

1. The supervisor swaps the `current` pointer back to `rollback.slot`
2. The daemon is restarted from the previous release
3. The failed release worktree is removed from disk
4. A failure alert is sent to Telegram

Manual rollback:

```bash
evonic update --rollback
```

---

## Telegram notifications

When `telegram_bot_token` and `telegram_chat_id` are configured, the supervisor sends a single message at update start and **edits it in place** as each step completes:

```
[Update v1.0.0 → v1.1.0]
████████░░░░░░░░ 50%: Installing dependencies
Started: 14:32:01
```

On success the message is updated to:

```
✅ Update to v1.1.0 complete
█████████████████ 100%: Done
Started: 14:32:01
```

On failure a **new message** is sent (so it stays visible even after the progress message is edited):

```
❌ Update v1.1.0 FAILED at step 4/6
Rolled back to v1.0.0
Error: Staged release failed health check on port 18080
```

---

## Real-Time Update Notifications

*Introduced in v0.2.6.*

When a new Evonic release is available, the platform displays a **real-time notification** in the Web UI. This replaces the previous polling-based check that required manual trigger via `evonic update --check`.

### How It Works

1. The update supervisor periodically checks the Git remote for new tags
2. When a new tag is found (version > current), a notification is emitted via the **event bus**
3. The Web UI listens for these events and displays a banner at the top of the page
4. Clicking the banner triggers the update flow

### UI Notification

The banner appears on all pages and shows:

```
📦 Update available: v1.2.0 → v1.3.0
[View Changelog] [Update Now] [Dismiss]
```

- **View Changelog** — opens the release notes for the new version
- **Update Now** — triggers the update flow immediately
- **Dismiss** — hides the notification (reappears on next page load if not dismissed permanently)

### Disabling Notifications

Set the following in `.env` to disable automatic update checks:

```env
UPDATE_CHECK_ENABLED=0
```

## Health check endpoint

The supervisor probes `GET /api/health` before and after swapping the release. This endpoint is built into Evonic and returns:

```json
{
  "status": "ok",
  "uptime": 42.3,
  "version": "v1.1.0"
}
```

The endpoint is always accessible: it bypasses authentication and super-agent setup checks so the supervisor can reach it even on a fresh deployment.

---

## Windows support

The same supervisor code runs on Windows with the following differences:

| Concern | Linux/macOS | Windows |
|---|---|---|
| Active release pointer | `current` symlink (atomic `rename(2)`) | `current.slot` text file (atomic `os.replace()`) |
| Shared dir links | `os.symlink()` | NTFS junction (`mklink /J`), falls back to copy |
| Process signals | `SIGUSR1` / `SIGTERM` | `taskkill /PID` |
| Trigger supervisor | `SIGUSR1` | Named pipe `\\.\\pipe\\evonic-supervisor` |

File locking is avoided by design: the daemon is fully stopped before any files in the new release directory are touched. The old release directory is never modified after creation.

---

## Known limitations

- **~2–5 second downtime** during the swap (daemon stop + pointer change + daemon start)
- **Supervisor is not self-updating**: it is intentionally kept small and updated manually
- **Single signing key**: if the key is compromised, all future tags will pass verification; rotate immediately if suspected
- **Health check false positives**: `/api/health` returning 200 does not catch logic regressions in rarely-used code paths