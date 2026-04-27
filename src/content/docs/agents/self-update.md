---
title: Update System
description: Reliable atomic self-update
sidebar:
  - Update System
---

Evonic includes an update supervisor that pulls new releases from your Git remote, verifies their SSH signature, installs dependencies in an isolated environment, and swaps the active release atomically — with rollback if anything goes wrong.
