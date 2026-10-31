---
title: Backup & Restore
description: Create a full Evonic backup archive, verify it, and restore it safely.
---

`evonic backup` packs your whole Evonic installation — agents, databases, plugins, keys, and config — into a single archive. `evonic restore` puts it back, with verification and rollback safety.

:::caution[Breaking change in v1.6.0]
`evonic backup --encrypt` has been **removed**. So has the `cli/backup_crypto.py` module behind it, because it never produced real AES encryption. See [Encrypting a backup](#encrypting-a-backup) for the replacement, and [Restoring an old encrypted backup](#restoring-an-old-encrypted-backup) if you still have archives from before v1.6.0.
:::

## What goes into a backup

A backup is a compressed tar archive plus a `backup-manifest.json` that lists every file with its size and SHA-256.

| Included | Notes |
|---|---|
| Agent runtime data | `agents/` — including shared knowledge-base files and artifacts |
| Platform database | `shared/db/evonic.db` with its WAL and SHM files, snapshotted consistently |
| Plugin data and config | Plugin databases plus each `plugins/*/config.json` |
| Avatars | `shared/avatars/` |
| Configuration | `.env` and `shared/.env` |
| SSH keys | `keys/` |
| Plan files | `plan/` |
| Skill config | `skills/config.json` |

Source code is **not** included — `backend/`, `cli/`, `app.py`, `config.py`, and `routes/` are excluded, as are `.git/`, `.venv/`, `__pycache__/`, and `logs/`. A backup restores your data onto a fresh install; it is not a copy of the application.

## `evonic backup`

```bash
evonic backup [--output PATH] [--format gz|bz2|zip] [--exclude PATTERN] [--quiet]
```

| Flag | Default | Description |
|---|---|---|
| `--output`, `-o` | `evonic-backup-<timestamp>.tar.gz` in the current directory | Output file. If you pass a **directory**, the archive is saved inside it with the default filename. |
| `--format` | `gz` | Compression format: `gz` (fastest), `bz2` (smaller), or `zip`. |
| `--exclude` | none | Skip files matching a pattern. Repeatable. |
| `--quiet`, `-q` | off | Suppress progress output. |

**Example — back up to a mounted volume:**

```bash
evonic backup -o /mnt/backups/
```

**Example — smaller archive, skipping a large directory:**

```bash
evonic backup --format bz2 --exclude 'shared/agents/files/*'
```

When it finishes, the command prints the archive path, size, SHA-256, and file count. Keep that SHA-256 — you can compare it after copying the file elsewhere.

## Inspecting a backup without restoring it

Two read-only flags let you look inside an archive first:

```bash
evonic backup --verify backup.tar.gz   # check integrity against the manifest
evonic backup --list backup.tar.gz     # list the archive contents
```

`--verify` recomputes the manifest checksums, so it is the quickest way to know whether a copied or downloaded archive is intact. `--list` reads the manifest and prints the file list.

## Restoring

```bash
evonic restore <backup_file> [--dry-run] [--force] [--no-restart]
```

| Flag | Description |
|---|---|
| `--dry-run` | Verify the archive and list what would be restored, then stop. |
| `--force` | Skip the interactive "Continue? [y/N]" prompt. |
| `--no-restart` | Do not restart the server after the restore finishes. |

A restore runs in a fixed order, so a bad archive never leaves you with half your data:

1. **Format check** — the file must be plain gzip, bzip2, or zip.
2. **Verification** — the manifest is read and every file's checksum is checked.
3. **Contents preview** — the file list is printed.
4. **Confirmation** — you are asked before anything changes (unless `--force`).
5. **Rollback copies** — existing files are copied aside before being overwritten.
6. **Server stop, restore, server start** — the server is stopped, files are restored, then it restarts.

**Example — rehearse a restore safely:**

```bash
evonic restore /mnt/backups/evonic-backup-20261031-2100.tar.gz --dry-run
```

**Example — unattended restore on a new machine:**

```bash
evonic restore /mnt/backups/evonic-backup-20261031-2100.tar.gz --force --no-restart
```

If the archive is valid but the server cannot restart, `--no-restart` leaves it stopped so you can inspect the logs yourself.

## Encrypting a backup

`--encrypt` no longer exists. It now fails immediately instead of running — a deliberate loud failure, because the old implementation silently wrote archives that were not actually encrypted:

```bash
$ evonic backup --encrypt
Error: The --encrypt option has been removed.
Encrypted backups are no longer supported by 'evonic backup'.
Encrypt the resulting archive at the file level instead, e.g.:
  evonic backup -o backup.tar.gz && gpg -c backup.tar.gz
```

Encrypt the finished archive with a standard tool instead:

```bash
# gpg — symmetric encryption with a passphrase
evonic backup -o backup.tar.gz
gpg -c backup.tar.gz              # writes backup.tar.gz.gpg

# age — modern alternative
evonic backup -o backup.tar.gz
age -p backup.tar.gz > backup.tar.gz.age
```

To restore, decrypt first and then hand the plain archive to `evonic restore`:

```bash
gpg -d backup.tar.gz.gpg > backup.tar.gz
evonic restore backup.tar.gz
```

This is also more flexible than the old flag: you can use hardware keys, multiple recipients, or your existing secret-management workflow.

## Restoring an old encrypted backup

Archives created with the old `--encrypt` **cannot be restored by `evonic restore`**. The restore command rejects anything that is not a plain gzip, bzip2, or zip archive and says so explicitly:

```
Error: Unsupported backup archive format.
Only plain gzip (.tar.gz), bzip2 (.tar.bz2) and zip (.zip) archives are supported.
Encrypted backups are no longer supported: the --encrypt option was removed.
```

That is intentional: the old module did not implement AES correctly, so those archives were masked rather than encrypted. Moving forward, keep a plain archive and encrypt it at the file level, as shown above.

## Backups are unaffected otherwise

Everything else works as before: same formats, same flags, same manifest, same verification, same restore flow. If your scripts call `evonic backup` without `--encrypt`, nothing changes.
