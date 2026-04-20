---
title: Best Practices
description: Tips and recommendations for writing robust Evonic plugins.
---

# Best Practices

## Event Handling

- Handle events gracefully with try/except blocks
- Don't return anything from handlers — the framework ignores return values
- Log important actions for debugging using `sdk.log()`
- Don't block on long-running operations — use `sdk.http_request()` with a short timeout

## Configuration

- Provide sensible defaults for all configuration variables
- Validate configuration values on load
- Use environment variables for sensitive data
- Document all configuration variables in `plugin.json`

## Logging

- Use `sdk.log()` for all logging — it adds plugin context automatically
- Include context in log messages (session_id, user_id, etc.)
- Use appropriate log levels (`info`, `warn`, `error`)
- Don't log sensitive data (API keys, passwords, PII)

## Error Handling

- Handle errors gracefully without crashing
- Log errors with context using `sdk.log(message, level="error")`
- Provide meaningful error messages
- Check return values from SDK methods (e.g. `sdk.send_message()`)
