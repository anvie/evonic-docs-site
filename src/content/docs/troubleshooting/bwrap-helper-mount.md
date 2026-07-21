---
title: "Bubblewrap Startup Failure (Helper Mount Permission)"
description: How to diagnose and fix Bubblewrap workplace failures caused by helper-mount permission issues.
---

When starting an agent with a Bubblewrap (`bwrap`) workplace, you may see the agent fail to initialize with errors about helper mounts, permission denied, or missing namespaces. This guide will help you identify the issue and resolve it safely.

## Common Symptoms

If you are experiencing this issue, you will see errors in the agent logs or terminal output similar to these:

- **Bwrap keeper readiness failure** — The Bubblewrap keeper process fails to start or reports it is not ready.
- **`nsenter` cannot open namespace** — A message like:
  ```
  nsenter: failed to open /proc/<pid>/ns/user: No such file or directory
  ```
- **Bubblewrap exits with a permission error** — Something like:
  ```
  bwrap: Can't find source path /home/evonic/.evonic/helpers/bwrap-helper: Permission denied
  ```

The key pattern is a **readiness failure** from the bwrap keeper, followed immediately by an **`nsenter` error** about a missing process or namespace.

---

## Root Cause

Bubblewrap works by creating a **user namespace** — an isolated view of the system for the sandboxed process. After entering this namespace, Bubblewrap needs to **bind-mount** the Evonic helper binary so the sandboxed process can use it.

The problem happens when:

1. The helper binary lives **inside a parent directory** that has restricted permissions (mode `0700` or similar), such as a home directory.
2. When Bubblewrap creates its user namespace, it becomes **unprivileged** inside that namespace.
3. An unprivileged process **cannot traverse** a directory it does not have search (`x`) permission on.
4. Bubblewrap fails with: `bwrap: Can't find source path <helper-path>: Permission denied`
5. After Bubblewrap exits, the keeper process is gone, so `nsenter` cannot open `/proc/<pid>/ns/user` — the process no longer exists.

> **💡 In short**: The helper binary is accessible to *you*, but Bubblewrap inside its own namespace loses the ability to reach it because a parent directory blocks traversal.

---

## Diagnostic Steps

Follow these steps to confirm the issue without exposing sensitive paths.

### 1. Check the Error Logs

Look for an error that mentions both `bwrap` and `nsenter` in sequence:

```
bwrap: Can't find source path .../helpers/...: Permission denied
nsenter: failed to open /proc/.../ns/user: No such file or directory
```

If you see both, this is the helper-mount permission issue.

### 2. Identify the Helper Path

The error message from Bubblewrap tells you exactly which path it cannot reach. Look for the path after `Can't find source path`. For example:

```
bwrap: Can't find source path /home/evonic/.evonic/helpers/bwrap-helper: Permission denied
```

The helper path is `/home/evonic/.evonic/helpers/bwrap-helper`.

### 3. Check Parent Directory Permissions

Once you have the helper path, work **upwards** from the helper file to find which parent directory is blocking traversal:

```bash
namei -l /home/evonic/.evonic/helpers/bwrap-helper
```

This command shows the permissions of every directory along the path. Look for a directory with mode `0700` (or `drwx------`) — that is the one Bubblewrap cannot traverse.

> **💡 Why `namei`?** It shows the entire path tree in one go without needing to `ls` each directory separately. This is especially helpful when the restricted directory is something like a home folder.

You can also check a specific directory's permissions directly:

```bash
ls -ld /home/evonic
```

A result like `drwx------ 2 evonic evonic 4096` (mode `0700`) confirms the home directory is private.

---

## Recovery Options

There are two ways to resolve this issue. Choose the one that fits your situation.

### Option A: Broaden Parent Directory Permissions (Temporary Workaround)

If the blocking directory is a home folder or similar, you can allow others to traverse it:

```bash
chmod +x /home/evonic
```

This adds the **search** (`x`) permission for everyone, which allows Bubblewrap to traverse the directory without changing read/write permissions.

**⚠️ Important**: This is a **temporary workaround** and is **generally discouraged**. Broadening permissions on a home directory weakens its privacy. Use this only to confirm the diagnosis or as a stopgap while you plan a proper upgrade.

To revert the change later:

```bash
chmod 0700 /home/evonic
```

### Option B: Upgrade Evonic (Recommended)

The proper fix is to **upgrade to a version of Evonic** that handles the helper mount correctly. The fix ensures the helper binary is placed in a location that Bubblewrap can always access — for example, a shared directory with appropriate permissions or by using a bind-mount that does not require parent traversal.

Check the [Changelog](/about/changelog) for the version where this issue is resolved.

---

## Preventing the Issue

- **Keep your Evonic installation up to date** — this ensures helper binaries are handled correctly.
- **If you use a custom installation path**, make sure the Evonic helper directory (and all its parent directories) are **traversable** by Bubblewrap. At minimum, each parent directory needs the `x` (search) permission for the user that runs the agent.

---

## Still Having Issues?

If you have applied the workaround or upgraded but still see similar errors:

- **Check if Bubblewrap is installed** — Run `which bwrap` to confirm it is available on your system.
- **Check user namespaces support** — Run `unshare --user true` to verify unprivileged user namespaces work on your kernel.
- **Check for other restricted directories** — Use `namei -l` on the full helper path to check *every* parent directory, not just the immediate one.
- **Check agent logs for other errors** — The actual issue may be different from what is described here. Look for any error mentioning `bwrap`, `nsenter`, or `permission denied` for context clues.
