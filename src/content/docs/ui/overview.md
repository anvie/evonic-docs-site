---
title: User Interface Guide
description: Navigating the Evonic v1.0.0 dashboard and agent management.
---

# User Interface Guide

Evonic v1.0.0 introduces a complete redesign of the management interface, focusing on modularity, transparency, and developer efficiency.

## The New Panel UI

The core of the v1.0.0 experience is the **Panel UI**. Instead of a traditional page-based navigation, Evonic now uses a dynamic panel system that allows you to keep multiple contexts open simultaneously.

### Key Panel Features
- **Modular Layout**: Drag and resize panels to create a workspace that fits your current task.
- **Context Persistence**: Panels remember their state; if you were looking at a specific log file in the Log Panel, it will remain there when you switch agents.
- **Quick-Toggle**: Use `Ctrl+K` (or `Cmd+K`) to quickly open or close panels like the State Viewer or Tool Console.
- **Button Edit Mode** (v1.5.0): Panel action buttons can now be renamed or deleted — switch a panel into edit mode to manage the actions it shows.

### Panel UI Plugin Architecture

The Panel UI is built on a **plugin-based architecture**. Each panel (Log Viewer, State Inspector, Tool Console, Process Manager, etc.) is a self-contained widget that registers itself with the panel system. This means:

- **Extensibility**: New panels can be added by plugins without modifying the core UI code.
- **Lazy Loading**: Panels are loaded on-demand — an unused panel consumes zero resources until you open it.
- **Isolated State**: Each panel manages its own state independently, so a crash in one panel doesn't affect others.

Developers building custom plugins can register new panels via the plugin manifest:

```json
{
  "panels": [
    {
      "id": "custom-metrics",
      "label": "Custom Metrics",
      "icon": "chart-bar",
      "component": "panels/MetricsPanel.vue"
    }
  ]
}
```

## Background Process Manager

Managing long-running tasks is now simplified through the **Background Process Manager**. When you use the `/detach` command, the process is moved to this manager.

### Features of the Process Manager:
- **Real-time Monitoring**: View the live output of detached jobs (e.g., a large `npm install` or a data migration) without blocking the chat.
- **Status Badges**: Processes are marked as `Running`, `Completed`, `Failed`, or `Paused`.
- **One-Click Termination**: Kill runaway processes instantly with the "Terminate" button.
- **Log Export**: Download the full `.log` file of any background process for external analysis.

## Agent Detail Redesign

The Agent Detail page has been overhauled to reduce clutter and make configuration more intuitive.

### 1. Tabbed Organization
Instead of a single long scrolling page, agent settings are now split into:
- **General**: Basic identity and system prompts.
- **Tools**: A searchable list of installed tools with individual configuration toggles.
- **Knowledge**: Management of the Knowledge Base (KB) and graph links.
- **Channels**: Connection settings for WhatsApp, Telegram, etc.
- **Stats**: Token usage and performance metrics.

### 2. Live State Viewer
A new "State" tab allows you to see the agent's current internal variables, active focus, and memory snapshots in real-time.

## Drag-and-Drop File Uploads

Interacting with files is now effortless. You can drag any file from your local OS directly into the chat bubble.

- **Automatic Injection**: Uploaded files are automatically placed into the agent's current workplace.
- **Context Awareness**: The agent is immediately notified of the file's name and path, allowing it to start working with the file without you having to type the path.
- **Bulk Uploads**: Drag multiple files at once to populate a workplace quickly.

## Chat, State Panel & Settings (v1.5.6)

*Updated in v1.5.6.*

The chat, the session state panel, and the settings pages received a set of usability improvements.

### Chat & State Panel

- **Workplace-switched divider** — when the active workplace changes (via the header switcher or the agent's `switch_workplace` tool), a divider marks where in the conversation the context changed.
- **Connection notice above the composer** — a notice appears above the message input when the workplace connection needs attention.
- **`ask_user` card docking** — `ask_user` cards now dock cleanly within the chat flow.
- **Collapsed completed-task lists** — long lists of completed tasks collapse by default, so the chat doesn't get buried in finished work.
- **Improved chat rendering** — general rendering improvements, including a fix for currency amounts being mangled by the math (KaTeX) pipeline.
- **Refreshed update banner** — the update-available banner has new styling.

### Settings

- **Aligned headers** — the Variables and Plugin Settings headers are now aligned.
- **Tidier rows** — the Models & Routing and Vision rows are tidier.
- **Cleaner combobox focus ring** — comboboxes have a cleaner focus ring.
- **Real `Other` input** — the `Other` answer in `ask_user` cards now uses a real input field.

## Questions, Approvals & Browser Notifications (v1.6.0)

An agent can stop and ask you a question, and a tool call can wait for your approval. Both are now visible even when Evonic is in a background tab.

### Answering a question

When an agent asks something, a question card appears above the chat input. Pick an option, tick several and press **Done** for a multi-select question, or choose **Other** and type your own answer. On Telegram the same question arrives as a message with inline-keyboard buttons.

There is no tool to assign: every agent has an **Ask User Questions** toggle under *Tools & capabilities*, on by default. Turning it off removes the tool and closes any question that is still open. See [`ask_user_question`](/agents/tools#ask_user_question).

### Turning on browser notifications

Evonic can raise a desktop notification when an agent asks a question or a tool call needs approval, so you don't have to keep watching a tab.

1. Wait for a question card or an approval modal to appear.
2. Click **Notify me in this browser** on it.
3. Allow notifications when the browser asks.

The button only shows while permission has not been requested yet. Evonic then keeps exactly one tab per browser listening for questions and approvals, even while that tab is hidden.

:::note[Requirements]
Browser notifications need a **secure context** — HTTPS or `localhost` — and at least one open Evonic tab. On a plain-HTTP deployment on another host, the browser will not deliver them.
:::

### When a notification is silenced

Notifications are deliberately quiet when you are already looking at the answer:

| Event | Notifies unless… |
|---|---|
| An agent asks a question | a focused Evonic tab is already showing that agent's chat |
| A command needs approval | any Evonic tab is focused (the approval modal is on screen) |

Each question or approval also notifies **at most once per browser**, and its notification closes automatically once it is resolved. A tab that stops reporting (closed or frozen) stops counting as focused after about 45 seconds, so a stale tab can't mute your notifications forever.

## Quick Reference: UI Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Open Command Palette / Toggle Panels |
| `Ctrl + L` | Clear Chat Visuals |
| `Shift + Esc` | Close Current Panel |
| `Ctrl + S` | Save Current Agent Config |

