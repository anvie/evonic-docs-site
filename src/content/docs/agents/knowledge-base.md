---
title: Knowledge Base
description: Manage agent knowledge files and the built-in read tool.
sidebar:
  order: 3
---

## Overview

Each agent has a knowledge base (KB) stored as files on the filesystem at `agents/<agent_id>/kb/`. The agent accesses these files at runtime using the built-in `read` tool — it does **not** load all files into the system prompt automatically.

This design keeps the system prompt lean while giving the agent access to large reference documents on demand.

## How It Works

1. You upload `.md` files to the agent's KB directory
2. The system prompt automatically includes a **file listing** so the agent knows what's available:
   ```
   ## Available Knowledge Files
   You can read these files using the `read` tool:
   - facilities.md (2.3 KB)
   - pricing.md (1.1 KB)
   - faq.md (4.5 KB)
   ```
3. During conversation, the agent calls `read("facilities.md")` when it needs that information
4. If the file is large, the tool returns a **truncated view** showing the remaining lines count (e.g., "Showing first 100 of 450 lines") so the agent knows more content is available
4. The tool returns the file content, which the agent uses to answer the user

## The Built-in `read` Tool

Every agent automatically has access to the `read` tool. It accepts a single `filename` parameter:

```json
{
  "name": "read",
  "description": "Read a knowledge base file.",
  "parameters": {
    "type": "object",
    "properties": {
      "filename": {
        "type": "string",
        "description": "The filename to read (e.g. 'facilities.md')"
      }
    },
    "required": ["filename"]
  }
}
```

### Security

The `read` tool is **sandboxed** to the agent's KB directory:
- Only bare filenames are accepted (no paths)
- `../` traversal is rejected
- Absolute paths are rejected
- The resolved path must stay within `agents/<agent_id>/kb/`

## Managing KB Files

### Via the Web UI

In the agent detail page, go to the **Knowledge** tab:

- **Upload** — click "Upload" to select a `.md` or `.txt` file
- **New File** — click "+ New File" to create an empty file and open the editor
- **Edit** — click "Edit" on any file to modify it inline
- **Delete** — click "Delete" to remove a file

### Via the API

**List files:**
```bash
curl http://localhost:8080/api/agents/bookstore_bot/kb
```

Response:
```json
{
  "files": [
    {"filename": "facilities.md", "size": 2345, "modified": 1712500000.0},
    {"filename": "pricing.md", "size": 1100, "modified": 1712400000.0}
  ]
}
```

**Read a file:**
```bash
curl http://localhost:8080/api/agents/bookstore_bot/kb/facilities.md
```

**Upload (multipart):**
```bash
curl -X POST http://localhost:8080/api/agents/bookstore_bot/kb \
  -F "file=@facilities.md"
```

**Create with content (JSON):**
```bash
curl -X POST http://localhost:8080/api/agents/bookstore_bot/kb \
  -H 'Content-Type: application/json' \
  -d '{"filename": "faq.md", "content": "# FAQ\n\n## Check-in time?\n14:00"}'
```

**Update:**
```bash
curl -X PUT http://localhost:8080/api/agents/bookstore_bot/kb/faq.md \
  -H 'Content-Type: application/json' \
  -d '{"content": "# FAQ\n\nUpdated content..."}'
```

**Delete:**
```bash
curl -X DELETE http://localhost:8080/api/agents/bookstore_bot/kb/faq.md
```

## Best Practices

- **Keep files focused** — one topic per file (pricing, FAQ, policies, etc.)
- **Use descriptive filenames** — the agent sees these names and decides which to read
- **Include headers** — markdown structure helps the agent find relevant sections
- **Don't duplicate system prompt content** — put static persona in the system prompt, reference data in KB files
- **Keep files reasonable in size** — very large files consume tokens when read
