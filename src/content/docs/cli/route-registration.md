---
title: Route Registration
description: How to register Flask routes in plugins to add web pages and API endpoints.
---

# Route Registration

Plugins can register Flask routes to add web pages and API endpoints to the platform. This is done by providing a `routes.py` file with a `create_blueprint()` function.

## How It Works

The PluginManager automatically detects `create_blueprint()` in either `handler.py` or `routes.py` and registers the blueprint with Flask. This allows plugins to:

- Add custom web pages (e.g., `/board/kanban`)
- Add API endpoints (e.g., `/api/kanban/tasks`)
- Serve static files and templates
- Implement custom authentication and access control

## Step 1: Define Routes in plugin.json

Add a `routes` array to your `plugin.json`:

```json
{
  "id": "my_plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Plugin with web routes",
  "routes": [
    {
      "path": "/my/page",
      "methods": ["GET"],
      "handler": "my_page"
    },
    {
      "path": "/api/my/data",
      "methods": ["GET", "POST"],
      "handler": "my_api"
    },
    {
      "path": "/api/my/data/<item_id>",
      "methods": ["PUT", "DELETE"],
      "handler": "my_api"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `path` | string | Yes | URL path for the route (supports Flask path converters like `<item_id>`) |
| `methods` | string[] | Yes | HTTP methods this route handles (e.g. `["GET"]`, `["GET", "POST"]`) |
| `handler` | string | Yes | Name of the handler function in `routes.py` |

## Step 2: Create routes.py

Create a `routes.py` file in your plugin directory with a `create_blueprint()` function:

```python
import os
import json
from flask import Blueprint, render_template, jsonify, request

# Plugin directory path (for templates, data files, etc.)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLUGIN_DIR = os.path.join(BASE_DIR, 'my_plugin')


def create_blueprint():
    """Return a Flask Blueprint for this plugin."""
    # Set template_folder to the plugin's templates directory
    bp = Blueprint('my_plugin', __name__,
                    template_folder=os.path.join(PLUGIN_DIR, 'templates'))

    @bp.route('/my/page')
    def my_page():
        """Render a web page."""
        return render_template('page.html')

    @bp.route('/api/my/data', methods=['GET', 'POST'])
    def my_api():
        """Handle API requests."""
        if request.method == 'GET':
            data = load_data()
            return jsonify({'data': data})
        elif request.method == 'POST':
            new_item = request.get_json()
            save_item(new_item)
            return jsonify({'success': True}), 201

    @bp.route('/api/my/data/<item_id>', methods=['PUT', 'DELETE'])
    def my_api(item_id):
        """Handle API requests with an item ID."""
        if request.method == 'PUT':
            data = request.get_json()
            update_item(item_id, data)
            return jsonify({'success': True})
        elif request.method == 'DELETE':
            delete_item(item_id)
            return jsonify({'success': True})

    return bp
```

**Key points:**

- The `create_blueprint()` function must return a Flask `Blueprint` instance
- Use `template_folder=os.path.join(PLUGIN_DIR, 'templates')` to set the correct template directory
- Routes defined in `routes.py` are automatically registered by the PluginManager
- You can use Flask's `request` object to access headers, body, query params, etc.

## Step 3: (Optional) Create Templates

If your route renders a template, create a `templates/` directory in your plugin:

```
my_plugin/
├── plugin.json
├── handler.py
├── routes.py
└── templates/
    └── page.html
```

## Agent Access Control

For API routes, you can implement agent access control by checking the `X-Agent-Id` header:

```python
def _check_agent_access():
    """Check if the request has valid agent access.

    Returns:
        tuple: (is_allowed: bool, error_message: str or None)
    """
    agent_id = request.headers.get('X-Agent-Id', '').strip()

    # No agent ID = regular user access (allowed)
    if not agent_id:
        return True, None

    # Agent ID present = check if it's the super agent
    super_agent_id = 'super'  # or read from config
    if agent_id == super_agent_id:
        return True, None

    # Not super agent = deny access
    return False, 'Forbidden: only super agent can access this API'


@bp.route('/api/my/data', methods=['GET', 'POST'])
def my_api():
    is_allowed, error = _check_agent_access()
    if not is_allowed:
        return jsonify({'error': error}), 403
    # ... rest of the handler
```

## Example: Kanban Board Plugin

Here's a real-world example using the built-in Kanban Board plugin:

### plugin.json

```json
{
  "id": "kanban",
  "name": "Kanban Board",
  "version": "1.0.0",
  "description": "Kanban board plugin for task management with UI and API endpoints",
  "author": "Evonic",
  "enabled": true,
  "routes": [
    {
      "path": "/board/kanban",
      "methods": ["GET"],
      "handler": "kanban_page"
    },
    {
      "path": "/api/kanban/tasks",
      "methods": ["GET", "POST"],
      "handler": "kanban_api"
    },
    {
      "path": "/api/kanban/tasks/<task_id>",
      "methods": ["PUT", "DELETE"],
      "handler": "kanban_api"
    }
  ]
}
```

### routes.py

```python
import os
import json
import uuid
from datetime import datetime, timezone
from flask import Blueprint, render_template, jsonify, request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLUGIN_DIR = os.path.join(BASE_DIR, 'kanban')
TASKS_FILE = os.path.join(PLUGIN_DIR, 'tasks.json')


def create_blueprint():
    bp = Blueprint('kanban', __name__,
                    template_folder=os.path.join(PLUGIN_DIR, 'templates'))

    @bp.route('/board/kanban')
    def kanban_page():
        return render_template('kanban.html')

    @bp.route('/api/kanban/tasks', methods=['GET'])
    def kanban_api_get():
        tasks = _load_tasks()
        return jsonify({'tasks': tasks})

    @bp.route('/api/kanban/tasks', methods=['POST'])
    def kanban_api_create():
        data = request.get_json()
        new_task = {
            'id': str(uuid.uuid4()),
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'status': data.get('status', 'todo'),
            'priority': data.get('priority', 'medium'),
            'created_at': _now_iso(),
            'updated_at': _now_iso(),
        }
        tasks = _load_tasks()
        tasks.append(new_task)
        _save_tasks(tasks)
        return jsonify({'task': new_task}), 201

    @bp.route('/api/kanban/tasks/<task_id>', methods=['PUT'])
    def kanban_api_update(task_id):
        data = request.get_json()
        tasks = _load_tasks()
        for i, task in enumerate(tasks):
            if task['id'] == task_id:
                tasks[i].update(data)
                tasks[i]['updated_at'] = _now_iso()
                _save_tasks(tasks)
                return jsonify({'task': tasks[i]})
        return jsonify({'error': 'Task not found'}), 404

    @bp.route('/api/kanban/tasks/<task_id>', methods=['DELETE'])
    def kanban_api_delete(task_id):
        tasks = _load_tasks()
        tasks = [t for t in tasks if t['id'] != task_id]
        _save_tasks(tasks)
        return jsonify({'success': True})

    return bp
```

## Best Practices

- **Keep routes.py focused**: Only put route handlers in `routes.py`, event handlers in `handler.py`
- **Use consistent naming**: Name your blueprint after the plugin ID (e.g., `Blueprint('kanban', ...)`)
- **Handle errors gracefully**: Always check for missing data and return appropriate error responses
- **Document your routes**: Include docstrings for each route handler
- **Validate input**: Always validate and sanitize user input before processing
- **Use config for sensitive data**: Store API keys, passwords, etc. in plugin config, not in code

## Troubleshooting

### Routes Not Registering

**Problem:** Routes defined in `routes.py` are not accessible.

**Solution:**
- Verify `create_blueprint()` exists and returns a Flask Blueprint
- Check that `routes.py` is in the plugin directory (not in a subdirectory)
- Verify the plugin is enabled: `evonic plugin info <plugin_id>`
- Check server logs for errors during blueprint registration

### Template Not Found

**Problem:** `TemplateNotFound` error when rendering templates.

**Solution:**
- Ensure `template_folder` is set to the correct path: `os.path.join(PLUGIN_DIR, 'templates')`
- Verify the template file exists in the `templates/` directory
- Check that the template name matches exactly (case-sensitive)

### 403 Forbidden on API Routes

**Problem:** API routes return 403 even for authorized users.

**Solution:**
- Check if `_check_agent_access()` is implemented correctly
- Verify the `X-Agent-Id` header is being sent
- Check the super agent ID configuration
- For regular user access, ensure no `X-Agent-Id` header is sent
