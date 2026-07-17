---
title: MCP Client Integration
description: Integrating Evonic with the Model Context Protocol (MCP).
---

# MCP Client Integration

Evonic v1.0.0 introduces native support for the **Model Context Protocol (MCP)**. MCP is an open standard that allows AI agents to connect to external servers that provide tools, prompts, and resources in a standardized way.

## What is MCP?

Instead of writing a custom plugin for every single service you want an agent to access, MCP allows you to connect Evonic to an **MCP Server**. This server acts as a gateway to a specific set of capabilities (e.g., a GitHub MCP server provides tools to read issues and create PRs).

## How it Works in Evonic

Evonic acts as an **MCP Client**. When you connect an agent to an MCP server, the agent automatically discovers all available tools and resources provided by that server.

### Connection Flow
1. **Configuration**: You provide the MCP server's endpoint and authentication (e.g., an API key or a local command).
2. **Discovery**: Upon startup, Evonic queries the MCP server for its `list_tools` and `list_resources` manifest.
3. **Integration**: The discovered tools are dynamically injected into the agent's toolset, appearing just like native Evonic tools.
4. **Execution**: When the agent calls an MCP tool, Evonic forwards the request to the MCP server, receives the result, and feeds it back into the conversation.

## Configuring MCP Servers

You can add MCP servers via the **Agent Detail > Tools** tab or through the configuration file:

```json
{
  "mcp_servers": [
    {
      "name": "github-manager",
      "endpoint": "https://mcp-github.example.com",
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    },
    {
      "name": "local-filesystem",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
    }
  ]
}
```

## Benefits of MCP Integration

- **Ecosystem Access**: Instantly use any tool built by the MCP community without waiting for an official Evonic plugin.
- **Centralized Tooling**: Manage tools on a remote server and update them without needing to restart or reconfigure your agents.
- **Interoperability**: Switch between different LLMs while keeping the same set of standardized MCP tools.

## Security Note
MCP servers can provide powerful tools. Always review the tool manifest of an MCP server before connecting it to a high-privilege agent. Use the **restricted mode** for channels that use MCP tools to ensure only authorized users can trigger them.
