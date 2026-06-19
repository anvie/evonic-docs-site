---
title: Update System
description: Simple git-based self-update that fetches release tags and applies them directly.
sidebar:
  order: 100
---

## Overview

Evonic's update system is intentionally simple. There is no separate supervisor daemon, no release staging, and no SSH signature verification. It just uses basic git operations directly on the repository.

Here is what happens when you run `evonic update`:

1. **Fetch** - pulls the latest tags from the remote
2. **Apply** - checks out the newest release tag
3. **Repair** - runs `evonic doctor --fix` to make sure everything is in good shape

That is it. Two git commands and a health check.

---

## How It Works

Because Evonic uses a **flat-repo architecture**, the project root is the live directory. There is no separate `releases/` folder, no worktrees, and no symlink switching. When you update, the code on disk gets updated directly.

### The two steps

| Step | Action | What happens |
|---|---|---|
| 1 | `git fetch --tags --force origin` | Gets the latest tags from the remote |
| 2 | `git checkout <tag>` | Switches the working tree to the new version |

After both steps succeed, `evonic doctor --fix` runs automatically to repair the environment (reinstall dependencies, fix permissions, etc.).

### What happens if something goes wrong?

If `git fetch` fails - the update stops immediately with an error message. No changes are made to your code.

If `git checkout` fails (for example, you have local changes that conflict) - the update stops, and you will see instructions on how to resolve it. Your current version stays untouched.

---

## Usage

### Check for updates (without applying)

```bash
evonic update --check
```

This fetches the latest tags and tells you what version is available, but does not change anything.

### Update to the latest release

```bash
evonic update
```

Fetches tags, finds the newest vX.Y.Z tag that is newer than your current version, checks it out, and runs doctor --fix.

### Update to a specific version

```bash
evonic update --tag v0.9.0
```

Useful if you want to pin to a specific release or skip a version.

### Track the nightly channel

```bash
evonic update nightly
```

This tracks origin/main directly instead of release tags. Use this if you want the latest development changes.

### Check the nightly channel

```bash
evonic update nightly --check
```

Shows the current commit hash vs the latest on origin/main without applying anything.

---

## Rollback

Need to go back to the previous version?

```bash
evonic update --rollback
```

This reverts to the commit before the last update. The rollback also runs doctor --fix afterward.

> **Note**: Rollback only works if there is a previous state in git's reflog. If you have made other commits since the update, reflog may not point where you expect.

---

## Real-Time Update Notifications

When a new Evonic release is available, the Web UI shows a notification banner at the top of the page.

- **View Changelog** - opens the release notes for the new version
- **Update Now** - triggers the update flow immediately
- **Dismiss** - hides the notification temporarily

### How it works

1. The update manager periodically checks the Git remote for new tags (cached for 24 hours)
2. When a newer tag is found, it emits an event via the event bus
3. Connected Web UI clients receive the event and show the banner
4. Clicking **Update Now** calls the backend to start the update

### Disabling automatic checks

```env
UPDATE_CHECK_ENABLED=0
```

---

## Restart

After an update (or rollback), the server needs to restart for the changes to take effect. The update does this automatically - it spawns a detached process that sends SIGTERM to the parent after a 2-second delay, letting the process manager (systemd, Docker, etc.) restart it cleanly.

---

## Known limitations

- **Brief downtime** (~1-2 seconds) during the git checkout and server restart
- **Local changes can block updates** - if you have uncommitted changes, git checkout will fail. Commit or stash them first
- **No built-in rollback guarantee** - reflog-based rollback depends on git history; for absolute safety, keep backups of your data directory
