---
title: Skill Management
description: Complete guide to managing skills with the Evonic CLI.
---

# Skill Management

Skills are self-contained tool packages that extend agent capabilities. The CLI provides a complete set of commands for managing skills.

## Skill Structure

A skill is a directory or zip file containing:

```
my_skill/
├── skill.json          # Metadata and tool definitions
├── setup.py            # Python package configuration
└── backend/
    └── tools/
        ├── __init__.py
        └── tool_name.py  # Tool implementations
```

### skill.json

The skill manifest defines the skill's metadata and available tools:

```json
{
  "id": "my_skill",
  "name": "My Custom Skill",
  "version": "1.0.0",
  "description": "Description of what this skill does",
  "tools": [
    {
      "name": "tool_name",
      "description": "What this tool does",
      "parameters": {
        "type": "object",
        "properties": {
          "param1": {
            "type": "string",
            "description": "Parameter description"
          }
        },
        "required": ["param1"]
      }
    }
  ]
}
```

## Commands

### Install a Skill

Install a skill from a zip file or directory.

```bash
# Install from zip file
evonic skill install ./my_skill.zip

# Install from directory
evonic skill install ./my_skill/

# Force overwrite existing skill
evonic skill install ./my_skill.zip --force
```

**Options:**
| Option | Description |
|--------|-------------|
| `path` | Path to zip file or directory (required) |
| `-f, --force` | Force overwrite existing skill |

### Uninstall a Skill

Remove a skill from the platform.

```bash
evonic skill uninstall my_skill
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `skill_id` | ID of the skill to uninstall (required) |

### List Skills

View all installed skills with their status and tool count.

```bash
evonic skill list
```

**Example Output:**
```
  ID                  Name                  Version  Status   Tools
  ------------------  --------------------  -------  -------  -----
  claimguard          ClaimGuard            1.0.0    enabled  2
  hello_world         Hello World           1.0.0    enabled  1
  krasan              Krasan Hotel Booking  2.0.0    enabled  7
  krasan_admin_skill  Krasan Admin          2.0.0    enabled  30

  Total: 4 skill(s)
```

### Get Skill Info

View detailed information about a specific skill, including available tools.

```bash
evonic skill info claimguard
```

**Example Output:**
```
  Skill ID    : claimguard
  Name        : ClaimGuard
  Version     : 1.0.0
  Description : Medical and clinical expert for ICD-10 coding and clinical analysis.
  Enabled     : True
  Tools       : 2
    - icd10_search: Search 83,000+ ICD-10/ICD-10-CM codes by clinical term, diagnosis, or code prefix. Returns up to 30 BM25-ranked results. Supports English terms, Indonesian medical terms (auto-translated), multi-word queries, and direct code lookup with subcodes.
    - icd10_search2: Semantic RAG search over ICD-10 WHO 2010 codes using BGE-M3 vector embeddings. Better than icd10_search for paraphrased clinical language, synonyms, and concept-level queries. Returns up to 60 results ranked by cosine similarity.
```

### Enable/Disable a Skill

Control whether a skill is active.

```bash
# Enable a skill
evonic skill enable claimguard

# Disable a skill
evonic skill disable claimguard
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `skill_id` | ID of the skill to enable/disable (required) |

### Configure a Skill

View or modify skill configuration.

```bash
# Show current configuration
evonic skill config claimguard

# Set configuration values
evonic skill config claimguard --set API_KEY my-secret-key
evonic skill config claimguard --set API_KEY my-secret-key TIMEOUT 30
```

**Arguments:**
| Argument | Description |
|----------|-------------|
| `skill_id` | ID of the skill (required) |

**Options:**
| Option | Description |
|--------|-------------|
| `--set KEY [VALUE ...]` | Set configuration key=value pairs |

## Creating Custom Skills

### Step 1: Create Directory Structure

```bash
mkdir -p my_skill/backend/tools
```

### Step 2: Create skill.json

```json
{
  "id": "my_skill",
  "name": "My Custom Skill",
  "version": "1.0.0",
  "description": "Custom skill for my use case",
  "tools": [
    {
      "name": "my_tool",
      "description": "Does something useful",
      "parameters": {
        "type": "object",
        "properties": {
          "input": {
            "type": "string",
            "description": "Input parameter"
          }
        },
        "required": ["input"]
      }
    }
  ]
}
```

### Step 3: Create Tool Implementation

```python
# backend/tools/my_tool.py
def my_tool(input: str) -> dict:
    """Process the input and return results."""
    return {
        "status": "success",
        "result": f"Processed: {input}"
    }
```

### Step 4: Create setup.py

```python
from setuptools import setup, find_packages

setup(
    name='my_skill',
    version='1.0.0',
    packages=find_packages(),
)
```

### Step 5: Install the Skill

```bash
evonic skill install ./my_skill/
```

## Best Practices

### Versioning

- Use semantic versioning (major.minor.patch)
- Increment major version for breaking changes
- Increment minor version for new features
- Increment patch version for bug fixes

### Tool Design

- Keep tools focused on a single responsibility
- Provide clear, descriptive documentation
- Handle errors gracefully with meaningful messages
- Return structured data (dict) when possible

### Configuration

- Use environment variables for sensitive data (API keys, secrets)
- Provide sensible defaults for optional configuration
- Validate configuration values on install

### Testing

- Test tools with various inputs before release
- Include example usage in documentation
- Consider edge cases and error conditions

## Troubleshooting

### Installation Fails

**Problem:** Skill installation fails with an error.

**Solution:**
- Check that the zip file is valid: `unzip -t my_skill.zip`
- Verify skill.json is valid JSON
- Ensure all required files are present
- Use `--force` to overwrite existing skills

### Skill Not Showing Up

**Problem:** Installed skill doesn't appear in `skill list`.

**Solution:**
- Verify the skill_id in skill.json matches the directory name
- Check that skill.json is valid JSON
- Restart the Evonic server
- Check error logs for installation errors

### Tool Not Available

**Problem:** Tool doesn't appear in agent's available tools.

**Solution:**
- Verify the skill is enabled: `evonic skill info <skill_id>`
- Check that the tool is listed in skill.json
- Ensure the tool file exists in backend/tools/
- Check that the tool function has the correct signature
