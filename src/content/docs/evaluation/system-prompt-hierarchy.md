---
title: System Prompt Hierarchy
description: How the 3-layer system prompt resolution works.
sidebar:
  order: 3
---

## Overview

System prompts resolve through a 3-layer hierarchy: **Domain** → **Level** → **Test**. Each layer can either **overwrite** (replace) or **append** (concatenate) the prompt from the layer above.

This lets you set a base persona at the domain level and add specific instructions per test without repetition.

## Resolution Logic

```
IF test.system_prompt exists:
    IF mode == 'append':
        RETURN domain_prompt + "\n\n" + test_prompt
    ELSE (mode == 'overwrite'):
        RETURN test_prompt
ELSE:
    RETURN domain_prompt (or None if not set)
```

## Examples

### Domain Default Only

```json
// domain.json
{
  "system_prompt": "Kamu adalah asisten yang ramah.",
  "system_prompt_mode": "overwrite"
}

// test.json: no system_prompt field
// Result: "Kamu adalah asisten yang ramah."
```

### Test Override (Overwrite)

```json
// domain.json
{ "system_prompt": "Kamu adalah asisten yang ramah." }

// test.json
{
  "system_prompt": "Gunakan bahasa formal dan sopan.",
  "system_prompt_mode": "overwrite"
}

// Result: "Gunakan bahasa formal dan sopan."
```

### Test Extension (Append)

```json
// domain.json
{
  "system_prompt": "Kamu adalah asisten reservasi.\n\n## PRICING\n| Kamar | Harga |\n| Bismo | Rp 400.000 |"
}

// test.json
{
  "system_prompt": "Selalu sebutkan extra bed (Rp 150.000) dan breakfast (Rp 50.000).",
  "system_prompt_mode": "append"
}

// Result:
// "Kamu adalah asisten reservasi.
//
// ## PRICING
// | Kamar | Harga |
// | Bismo | Rp 400.000 |
//
// Selalu sebutkan extra bed (Rp 150.000) dan breakfast (Rp 50.000)."
```

## Use Cases

### Common Persona + Task-Specific Instructions

**Domain:** Customer service tests
```json
{ "system_prompt": "Kamu adalah customer service yang ramah dan profesional." }
```

**Test:** Complaint handling
```json
{
  "system_prompt": "Untuk komplain: 1) Dengarkan, 2) Minta maaf, 3) Tawarkan solusi.",
  "system_prompt_mode": "append"
}
```

### Base Knowledge + Variations

**Domain:** Hotel reservation
```json
{
  "system_prompt": "Kamu adalah asisten reservasi.\n\n## FASILITAS\n- Check-in: 14:00\n- Check-out: 12:00"
}
```

**Test:** Weekend pricing
```json
{
  "system_prompt": "## WEEKEND PRICING\nHarga weekend 25% lebih tinggi.",
  "system_prompt_mode": "append"
}
```

## Setting System Prompts

### Via the UI

1. Go to **Settings** → **Domains** tab
2. Click **Edit** on a domain → set **Domain System Prompt**
3. Click into a test → set **System Prompt** and **Mode** (overwrite/append)

### Via JSON Files

Set `system_prompt` and `system_prompt_mode` in `domain.json` or individual test JSON files.

## Best Practices

- Use domain-level prompts for **shared knowledge** (persona, pricing, policies)
- Use `append` mode for **additional instructions** on specific tests
- Use `overwrite` mode only for **completely different contexts**
- Keep domain prompts concise: avoid duplicating information in every test
