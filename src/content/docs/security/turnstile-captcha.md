---
title: Cloudflare Turnstile Captcha
description: Protect public-facing login pages with Cloudflare Turnstile — a privacy-first, user-friendly captcha alternative.
---

## Overview

Evonic supports **Cloudflare Turnstile** — a privacy-first captcha alternative to Google reCAPTCHA that’s invisible by default and respects user privacy. Turnstile is applied on the **admin login page** (`/login`) and is **optional but highly recommended** if your Evonic instance is exposed to the public internet.

Without Turnstile, your login page is unprotected against brute-force and automated attacks. With it, you get:

- 🛡️ **Bot protection** — blocks automated login attempts
- 🔒 **Privacy-first** — no tracking cookies, no data collection
- 👤 **Frictionless UX** — most users pass without clicking anything
- 🎨 **Dark mode support** — matches your Evonic theme automatically

## How It Works

Turnstile is a **two-part system**:

1. **Client-side widget** — rendered on the login page, generates a token
2. **Server-side verification** — Evonic sends the token to Cloudflare for validation on every login attempt

The flow looks like this:

```
User opens /login
       │
       ▼
Turnstile widget loads (if configured)
       │
       ▼
User submits password → Token sent with form
       │
       ▼
Evonic verifies token with Cloudflare API
       │
       ▼
Token valid? → Allow login
Token invalid? → Show error
```

## Setup

### Step 1: Get Turnstile Keys from Cloudflare

1. Go to the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Click **"Add a site"**
3. Enter your Evonic domain (e.g., `evonic.yourdomain.com`)
4. Select **"Managed"** widget mode (recommended — non-intrusive)
5. Copy the **Site Key** and **Secret Key**

### Step 2: Configure Environment Variables

Add the keys to your `.env` file:

```bash
# .env
TURNSTILE_SITE_KEY=0x4AAAAAA...your-site-key
TURNSTILE_SECRET_KEY=0x4AAAAAA...your-secret-key
```

Or set them as environment variables directly:

```bash
export TURNSTILE_SITE_KEY="0x4AAAAAA...your-site-key"
export TURNSTILE_SECRET_KEY="0x4AAAAAA...your-secret-key"
```

> **Pro tip:** Use `envcrypt` (Evonic’s built-in encrypted env loader) if you want to keep your secret key encrypted at rest. See the [Configuration](/getting-started/configuration/) guide for details.

### Step 3: Restart Evonic

Turnstile config is read at startup. Restart your Evonic server to pick up the new keys:

```bash
./evonic server
```

That’s it. The Turnstile widget will **automatically appear** on the login page the next time you visit `/login`.

## Verification

To confirm Turnstile is working:

1. Visit `/login` in your browser
2. You should see the Turnstile widget (a small checkbox or badge) above the **Sign In** button
3. Open your browser’s DevTools → Network tab and submit the form
4. You should see a POST request to `challenges.cloudflare.com/turnstile/v0/siteverify`
5. Try submitting an empty form — you’ll get a "Captcha verification failed" error

## When to Enable Turnstile

| Scenario | Recommendation |
|---|---|
| **Local dev** (`localhost`) | 🔴 Not needed |
| **Internal network only** | 🟡 Optional — recommended if you share credentials |
| **Public internet** | 🟢 **Strongly recommended** |
| **Public + multiple users** | 🟢 **Required** — without it, your login is wide open |

> ⚠️ **Heads up:** If your Evonic instance is accessible from the public internet, **please enable Turnstile**. It adds a critical layer of defense against brute-force attacks, credential stuffing, and automated bots trying to crack your admin password. It takes 5 minutes to set up and saves you from a world of pain.

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Widget doesn’t show on login page | `TURNSTILE_SITE_KEY` not set or empty | Check your `.env` file and restart the server |
| "Captcha verification failed" every time | `TURNSTILE_SECRET_KEY` doesn’t match the site key | Double-check both keys in your Cloudflare dashboard |
| "Captcha verification error" | Network issue or Cloudflare outage | Check your server’s internet connection, try again later |
| Widget looks wrong in dark mode | Script runs before DOM is ready | Reload the page — the theme switch script runs on first paint |
