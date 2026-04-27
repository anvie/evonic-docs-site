---
title: Troubleshooting
description: Common plugin issues and how to fix them.
---

## Plugin Not Loading

### Symptom
Plugin doesn't appear in `evonic plugin list` or doesn't respond to events.

### Fixes
- Check that `plugin.json` is valid JSON: `cat plugins/my_plugin/plugin.json | python3 -m json.tool`
- Verify the plugin directory is in the correct location
- Run `evonic plugin reload my_plugin` to force a reload
- Check plugin logs: `evonic plugin logs my_plugin`

## Handler Not Being Called

### Symptom
Plugin loads but event handlers don't execute.

### Fixes
- Ensure event names in `plugin.json` match exactly (case-sensitive)
- Verify handler function names follow the `on_<event_name>` pattern
- Check that the plugin is enabled: `evonic plugin enable my_plugin`
- Review logs for errors: `evonic plugin logs my_plugin --limit 50`

## Configuration Not Working

### Symptom
Plugin config values aren't being read or applied.

### Fixes
- Verify variable names in `plugin.json` match exactly (case-sensitive)
- Check config values: `evonic plugin config my_plugin`
- Set config values: `evonic plugin config my_plugin --set KEY value`
- Reload the plugin after changing config: `evonic plugin reload my_plugin`

## HTTP Requests Failing

### Symptom
`sdk.http_request()` returns errors or times out.

### Fixes
- Check the URL is correct and accessible
- Increase timeout: `sdk.http_request(..., timeout=60)`
- Verify the external service is running and reachable
- Check logs for detailed error messages: `sdk.log(response.get('error'), level="error")`

## Permission Errors

### Symptom
Plugin can't read/write files or access certain resources.

### Fixes
- Ensure the Evonic process has read/write permissions to the plugins directory
- Check file permissions: `ls -la plugins/my_plugin/`
- Run with appropriate user permissions

## Common Error Messages

### `"Plugin already exists"`
- Use `--force` flag to overwrite: `evonic plugin install ./my_plugin.zip --force`
- Or uninstall first: `evonic plugin uninstall my_plugin`

### `"Event handler not found"`
- Verify handler function name matches event name: `on_<event_name>`
- Check for typos in `plugin.json` event names

### `"Invalid plugin.json"`
- Validate JSON syntax: `python3 -m json.tool plugin.json`
- Ensure all required fields are present: `id`, `name`, `version`, `description`, `events`

### `"Module not found"`
- Check that `handler.py` is in the plugin root directory
- Verify there are no syntax errors in `handler.py`: `python3 -m py_compile handler.py`
