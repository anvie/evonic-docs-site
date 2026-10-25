---
title: TOTP Two-Factor Authentication
description: Optional TOTP two-factor authentication for the administrator account — a six-digit code from any authenticator app.
sidebar:
  order: 5
---

## Overview

*Introduced in v1.5.6.*

Evonic supports optional **TOTP two-factor authentication (2FA)** for the administrator account. When enabled, signing in requires your password **and** a six-digit one-time code from an authenticator app (Google Authenticator, 1Password, Authy, and other TOTP-compatible apps).

This is a good fit for instances exposed to the public internet, where a password alone isn't enough protection.

## How It Works

- **Standard TOTP** — six-digit codes that rotate on a 30-second window, with the issuer labeled `Evonic`. Any TOTP-compatible authenticator app works.
- **Enrollment at login** — the first time you sign in after enabling 2FA, you add the account to your authenticator app and enter a code to confirm. The setup screen shows the account's provisioning URI, which you can scan or paste into your app.
- **Encrypted secret** — the TOTP secret is encrypted with your application secret key and stored in the settings table. It never appears in API responses after setup is confirmed.
- **Single admin account** — Evonic has one administrator account, so 2FA protects that account.

## Enabling 2FA

1. Go to **System → Settings → General** (`/settings`).
2. Find the **Two-Factor Authentication** toggle and switch it on.
3. The next time you sign in, you'll be asked to enroll: add the account to your authenticator app, then enter the six-digit code it shows to finish.

After enrollment, every login requires a fresh six-digit code in addition to your password.

### The `ENABLE_2FA` Override

The `ENABLE_2FA` environment variable can force 2FA on or off from the outside, which is handy for deployments that manage settings via environment or config files:

- When `ENABLE_2FA` is set, it **overrides** the saved setting, and the settings toggle is disabled with a note that the value is controlled by the environment variable.
- To manage 2FA from the UI again, remove the environment variable and restart.

```bash
# Force 2FA on (or off) regardless of the saved setting
ENABLE_2FA=1 ./start.sh
```

## Disabling 2FA

Switch the **Two-Factor Authentication** toggle off in **System → Settings → General**. If the `ENABLE_2FA` environment variable is set, remove it first — otherwise it will keep enforcing 2FA.

## What to Know

- **Bring an authenticator** — if you enable 2FA, make sure you have access to your authenticator app before you need to sign in again.
- **Codes expire quickly** — a code is only valid for its 30-second window, so enter it promptly.
- **Secret is protected** — the secret is encrypted at rest with your application secret key. Treat `SECRET_KEY` accordingly: if it changes, the stored secret can no longer be decrypted.

## See Also

- [Security Hardening Suite](/security/hardening): rate limiting, audit logging, user blocking, and private key detection
- [Cloudflare Turnstile Captcha](/security/turnstile-captcha): bot protection for the login page
