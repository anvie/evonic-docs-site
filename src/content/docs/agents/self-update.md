---
title: Update System
description: Reliable atomic self-update with rollback, SSH signature verification, and Telegram progress notifications.
sidebar:
  order: 100
---

## Overview

Evonic includes an update supervisor that automatically pulls new releases from your Git remote, verifies their SSH signature, installs dependencies in an isolated environment, and swaps the active release atomically — with automatic rollback if anything goes wrong.

**Key properties:**

- **Atomic**: no partial state is ever visible to the running daemon
- **Rollback**: any failure (signature, deps, health check, monitoring) automatically restores the previous release
- **Isolated deps**: each release gets its own virtual environment — no shared-venv conflicts
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
├── rollback.slot                # "v1.0.0" — used by auto-rollback
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

Each release worktree has symlinks pointing into `shared/` for all mutable data. `config.py`'s `BASE_DIR` resolves through these symlinks transparently — no application code changes are required.

---

## First-time setup

### 1. Run the migration script

Stop the server first, then migrate the flat repository layout:

```bash
evonic stop

# Preview what will happen (no changes made)
python3 supervisor/migrate.py --dry-run

# Apply migration (creates releases/v0.1.0/, shared/, current symlink)
python3 supervisor/migrate.py --tag v0.1.0
```

The migration script:
1. Moves mutable data (`db/`, `agents/`, `logs/`, `.env`, `.ssh/`, etc.) into `shared/`
2. Creates an annotated git tag for the current HEAD
3. Checks out a git worktree for that tag in `releases/v0.1.0/`
4. Creates a Python venv and installs dependencies
5. Symlinks `shared/` items into the release
6. Creates the `current` symlink and `rollback.slot`

:::caution
Migration is a one-way operation. Run it on a copy first to verify the outcome before applying to production.
:::

### 2. Configure SSH tag signing

The supervisor verifies every release tag's SSH signature before touching any files. Set this up once:

```bash
# Tell git to use SSH for signing
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519   # your key path

# Create the allowed_signers file
echo "your@email.com $(cat ~/.ssh/id_ed25519.pub)" > shared/.ssh/allowed_signers

# Point git at it
git config gpg.ssh.allowedSignersFile shared/.ssh/allowed_signers
```

Sign the initial tag created by `migrate.py`:

```bash
git tag -s -f v0.1.0 -m "Initial release"

# Verify it works
git verify-tag v0.1.0
# Expected: Good "git" signature for your@email.com ...
```

For every future release:

```bash
git tag -s v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### 3. Configure the supervisor

Edit `supervisor/config.json` (created by `migrate.py`):

```json
{
    "app_root": "/path/to/evonic",
    "poll_interval": 300,
    "git_remote": "origin",
    "health_port": 8080,
    "health_temp_port": 18080,
    "health_timeout": 10,
    "monitor_duration": 60,
    "keep_releases": 3,
    "python_bin": "python3",
    "uv_bin": null,
    "telegram_bot_token": "123456:ABC-your-bot-token",
    "telegram_chat_id": "-100your_chat_id"
}
```

| Field | Default | Description |
|---|---|---|
| `app_root` | (repo root) | Absolute path to the Evonic repository |
| `poll_interval` | `300` | Seconds between automatic tag checks |
| `git_remote` | `"origin"` | Git remote to fetch from |

| `health_port` | `8080` | Port the live daemon listens on |
| `health_temp_port` | `18080` | Temporary port used for staging health check |
| `health_timeout` | `10` | Seconds to wait for a single health probe |
| `monitor_duration` | `60` | Seconds to monitor the new daemon after swap |
| `keep_releases` | `3` | Number of old releases to keep on disk |
| `python_bin` | `"python3"` | Python executable for creating venvs |
| `uv_bin` | `null` | Path to `uv` binary (much faster installs); `null` to use pip |
| `telegram_bot_token` | `""` | Telegram Bot API token (leave empty to disable) |
| `telegram_chat_id` | `""` | Telegram chat or channel ID to post updates to |

### 4. Start the supervisor

```bash
# Foreground (for testing)
python3 supervisor/supervisor.py --config supervisor/config.json

# Background
nohup python3 supervisor/supervisor.py --config supervisor/config.json \
    >> supervisor/run/supervisor.log 2>&1 &
```

**With systemd** — create `/etc/systemd/system/evonic-supervisor.service`:

```ini
[Unit]
Description=Evonic Update Supervisor
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/evonic
ExecStart=/usr/bin/python3 /path/to/evonic/supervisor/supervisor.py \
    --config /path/to/evonic/supervisor/config.json
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable evonic-supervisor
sudo systemctl start evonic-supervisor
```

---

## Update lifecycle

Each update runs 6 ordered steps. Any failure triggers automatic rollback.

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
████████░░░░░░░░ 50% — Installing dependencies
Started: 14:32:01
```

On success the message is updated to:

```
✅ Update to v1.1.0 complete
█████████████████ 100% — Done
Started: 14:32:01
```

On failure a **new message** is sent (so it stays visible even after the progress message is edited):

```
❌ Update v1.1.0 FAILED at step 4/6
Rolled back to v1.0.0
Error: Staged release failed health check on port 18080
```

---

## Health check endpoint

The supervisor probes `GET /api/health` before and after swapping the release. This endpoint is built into Evonic and returns:

```json
{
  "status": "ok",
  "uptime": 42.3,
  "version": "v1.1.0"
}
```

The endpoint is always accessible — it bypasses authentication and super-agent setup checks so the supervisor can reach it even on a fresh deployment.

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
- **Supervisor is not self-updating** — it is intentionally kept small and updated manually
- **Single signing key** — if the key is compromised, all future tags will pass verification; rotate immediately if suspected
- **Health check false positives** — `/api/health` returning 200 does not catch logic regressions in rarely-used code paths