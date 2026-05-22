---
title: Artifacts
description: Save, view, and manage persistent work outputs that survive across sessions.
sidebar:
  order: 4
---

Artifacts is Evonic's persistent file output system. It lets agents save reports, summaries, generated files, or any work result they want to keep beyond the current conversation session. Unlike temporary workspace files, artifacts are stored in a dedicated directory that persists independently of sessions.

---

## How It Works

Every agent has its own artifacts directory at `agents/<agent_id>/artifacts/`. When an agent saves an artifact, the file is stored there and becomes immediately accessible through the web UI and via file tool paths.

The system supports two modes:

- **Text mode** for markdown reports, code snippets, logs, and plain text files
- **Base64 mode** for images, PDFs, and other binary files

---

## Saving Artifacts

Agents use the built-in `save_artifact` tool to store files. This tool is always available and does not require any configuration.

### Text Files

```python
save_artifact(
    filename="report.md",
    content="# Analysis Report\n\nKey findings from this session...",
    mime_type="text/markdown",
    mode="text"
)
```

### Binary Files

For images, PDFs, or any binary content, set `mode` to `"base64"` and pass base64-encoded content:

```python
save_artifact(
    filename="chart.png",
    content="iVBORw0KGgoAAAANSUhEUgAA...",
    mime_type="image/png",
    mode="base64"
)
```

### Parameter Reference

| Parameter | Required | Description |
|-----------|----------|-------------|
| `filename` | Yes | The filename for the artifact (e.g. `report.md`, `output.json`). Must not contain path separators. |
| `content` | Yes | The file content. For text mode, pass plain text. For base64 mode, pass base64-encoded data. |
| `mime_type` | No | Optional MIME type hint (e.g. `text/markdown`, `application/json`, `image/png`). |
| `mode` | No | Set to `"text"` (default) or `"base64"`. |

---

## Accessing Artifacts

### Web UI

Every artifact appears in the agent's detail page under an Artifacts tab. You can view, download, or delete artifacts directly from the browser. The viewer supports markdown rendering for text files and inline preview for images.

### Via File Tools

Agents can read and manage their own artifacts using the `/_self/artifacts/` virtual path with any file tool:

```python
# Read an artifact
read_file(file_path="/_self/artifacts/report.md")

# List artifacts (via bash)
bash(script="ls /_self/artifacts/")
```

This works from any execution environment: local, Docker sandbox, SSH workplace, or Evonet-connected device. See the [\_/self/ Virtual Path](/agents/tools#the-self-virtual-path) section in the Tools page for details.

---

## Key Characteristics

### Survive Session Deletion

Artifacts are stored independently of conversation sessions. Even if you clear the chat history or a session expires, the artifacts remain available.

### Cross-Agent Isolation

Each agent can only see its own artifacts. Agent A cannot read, modify, or delete artifacts belonging to Agent B. This ensures privacy and separation of work outputs.

### No Size Limit

There is no hard file size limit for artifacts. However, very large files may take longer to display in the web UI viewer.

---

## Use Cases

| Scenario | Example |
|----------|---------|
| **Research reports** | An analyst agent saves a full market research report with findings and recommendations |
| **Data exports** | A data agent saves extracted CSV data after processing a database query |
| **Image generation** | A creative agent saves generated images for later review |
| **Code output** | A developer agent saves compiled binaries or build artifacts |
| **Session summaries** | An agent saves a summary of its work at the end of a long session |

---

## Best Practices

- Use descriptive filenames with proper extensions so the web UI can serve them with the right MIME type
- For markdown reports, set `mime_type` to `"text/markdown"` for rich rendering in the viewer
- Group related outputs into a single artifact rather than saving many tiny files
- Clean up artifacts that are no longer needed to keep the workspace tidy
