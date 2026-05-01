---
title: Creating Tools
description: How to write and register custom tools for agents.
---

Tools are the primary way agents interact with the outside world. This guide walks you through creating custom tools that agents can use.

## Tool Structure

Every tool has:
- A name (must be unique)
- A description (used for tool selection)
- Input schema (parameters)
- An executor function

## Writing a Tool

```python
from evonic.tools import Tool

def my_tool(input: str) -> str:
    """Process the input and return a result."""
    return f"Processed: {input}"

tool = Tool(
    name="my_tool",
    description="Process input and return a result",
    input_schema={"input": {"type": "string", "description": "The input to process"}},
    executor=my_tool,
)
```

## Safety System

The `runpy` and `bash` tools are protected by a **3-layer heuristic safety system**:

1. **Pattern Matching**: blocks dangerous regex patterns like `rm -rf /`, `dd if=`, etc.
2. **Path Validation**: ensures file operations stay within the workspace directory
3. **Command Whitelisting**: restricts allowed commands and flags

The safety system is implemented in `backend/tools/lib/heuristic_safety.py` and is applied before any command is executed. If a command is blocked, the tool returns an error explaining which rule was violated.

See [Heuristic Code Safety](/security/heuristic-code-safety) for full details on the safety rules and configuration.

## Registering a Tool

Tools are registered in your plugin's `tools.py` file. They're automatically available to agents once registered.

## Testing Tools

Test your tools with the eval framework:

```python
from evonic.evaluators import Evaluator

evaluator = Evaluator(
    name="my_tool_test",
    tool="my_tool",
    inputs=["hello", "world"],
    expected_outputs=["Processed: hello", "Processed: world"],
)
```

## Best Practices

- Keep tools focused on a single responsibility
- Validate all inputs
- Return structured output
- Handle errors gracefully
- Document tool behavior clearly
