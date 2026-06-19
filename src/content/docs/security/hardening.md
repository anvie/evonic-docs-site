---
title: Security Hardening Suite
description: API rate limiting, audit logging, user blocking, and private key detection.
sidebar:
  order: 4
---

## Overview

*Introduced in v0.8.0.*

The Security Hardening Suite adds multiple layers of protection to Evonic, designed for production deployments exposed to the public internet. It includes four components: API rate limiting, security audit logging, user blocking, and PEM private key detection.

---

## API Rate Limiting

All API endpoints are now protected by tiered rate limits with atomic enforcement:

| Tier | Limit | Scope |
|------|-------|-------|
| CRUD | 120 requests/minute | General CRUD operations (raised from 30 in v0.8.0) |
| Chat | 10 requests/minute | Chat message endpoints (read/poll requests excluded) |
| Login | Configurable | Login attempts (persisted across restarts via SQLite) |

Rate limits are enforced atomically using SQLite-backed counters, preventing race conditions under concurrent requests. When a rate limit is hit, the endpoint returns a `429 Too Many Requests` response with a `Retry-After` header.

### CRUD Rate Limit

The CRUD endpoint rate limit applies to create, read, update, and delete operations on agents, tools, skills, schedules, and other resources. The limit was raised from 30 to 120 requests per minute in v0.8.0 to reduce friction during bulk operations.

### Chat Rate Limit

Chat message endpoints have a 10 requests per minute limit. Cheap read/poll requests are excluded from this tier, preventing rate-limiting of normal browsing while protecting against abuse.

### Login Rate Limiter

The login rate limiter persists across server restarts via SQLite, ensuring that rate-limit state survives process restarts. This prevents attackers from bypassing login protection by cycling the server.

---

## Security Audit Logging

All authentication and authorization events are now recorded in a dedicated security audit log for forensic traceability:

| Event Type | Description |
|------------|-------------|
| login_attempt | Login attempt (success or failure) |
| logout | User logout |
| token_refresh | JWT token refresh |
| authorization_failure | Failed authorization check |
| user_blocked | User was blocked by the system |
| user_unblocked | User was unblocked |
| rate_limit_exceeded | Rate limit was hit |

The audit log provides a chronological trail of security events, making it possible to investigate incidents, identify attack patterns, and meet compliance requirements.

---

## User Blocking

Abusive accounts can be **blocked** from accessing the platform. When a user is blocked:

- All API requests from the blocked user are rejected
- Active sessions are terminated
- Login attempts are rejected with a clear message

### Blocked User Admin UI

An admin interface (`/admin/blocked-users`) lets you view and manage blocked users:

- **View**: See a list of all currently blocked users
- **Block**: Manually block a user by username or ID
- **Unblock**: Remove a block and restore platform access

User blocking integrates with the rate-limiting system: accounts that repeatedly hit rate limits or exhibit abuse patterns can be automatically flagged for review.

---

## PEM Private Key Detection

The platform now detects when **private keys** (PEM-encoded RSA, EC, or SSH keys) appear in tool output or file operations. When detected:

1. The operation is routed through a user approval flow
2. The user is warned that a private key was detected
3. The user can approve or reject the exposure

This prevents accidental key exposure to LLM providers. Without this guard, an agent could inadvertently send a private key file to the model provider through tool arguments, output, or file content.

---

## Configuration

Security hardening features are enabled by default and require no additional configuration. The login rate-limiter state is automatically persisted via SQLite, surviving server restarts.

For advanced configuration, see the [Configuration Reference](/reference/configuration).
