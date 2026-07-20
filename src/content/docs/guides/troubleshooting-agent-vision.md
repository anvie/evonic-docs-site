---
title: Troubleshooting: Agent Image Processing Failure
description: Step by step guide to fix issues when an agent fails to process images in Evonic.
sidebar:
  order: 5
---

When using an agent with vision capabilities (image recognition), you may encounter a situation where the agent fails to process or "see" images you send. This guide will help you diagnose and fix the issue systematically.

## Common Symptoms

Before diving into fixes, recognize these symptoms:

- The agent replies as if it never received an image at all
- The agent responds with text like "I cannot see the image you sent"
- The agent only reads text but ignores image attachments
- No visible errors, but the agent does not describe the image content

---

## Root Cause

This issue is almost always caused by **vision configuration not being enabled** in one (or more) of these three places:

1. **Model Settings**: the model you are using must support and have vision enabled
2. **General Settings**: vision must be enabled at the system level
3. **Agent Settings**: each individual agent must have image processing enabled

All three settings must be **enabled**. If even one is off, the agent will not be able to process images.

---

## Step 1: Check Model Settings

Make sure the model you are using supports vision and the feature is enabled.

### How to Check:

1. Open the **Model Settings** page in the Evonic dashboard
2. Select the model your agent is using (e.g. Mimo v2.5, GPT-4 Vision, Claude, etc.)
3. Look for the toggle or checkbox for **Vision** or **Image Processing**
4. Make sure the toggle is set to **Enabled**

> **Note**: Not all models support vision. Models like GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and Llama 3.2 Vision have this capability. Text-only models like GPT-3.5 or Llama 3.1 (non-vision) cannot process images.

### If Your Model Does Not Support Vision:

- Switch to a vision-capable model from the available model list
- For local models, make sure you are using the vision variant (e.g. `llava` or `llama3.2-vision` instead of the text-only variant)

---

## Step 2: Check General Settings

After the model is enabled, make sure vision is also enabled at the system level.

### How to Check:

1. Open the **General Settings** page in the Evonic dashboard
2. Find the section related to **Vision**, **Image**, or **Multimodal**
3. Make sure the toggle or option for image processing is set to **Enabled**

This setting applies globally. If disabled here, no agent will be able to process images even if the model and agent settings are correct.

---

## Step 3: Check Agent Settings

The last and most commonly missed step: make sure the specific agent you are using has image processing enabled.

### How to Check:

1. Open the **Agents** page in the Evonic dashboard
2. Select the agent that is having the issue
3. Open the **Settings** or **Configuration** tab
4. Find the setting for **Image Processing**, **Vision**, or **Attachment Handling**
5. Make sure the option is set to **Enabled**

> **Tip**: If you are using multiple agents, check this setting for every agent that needs to process images. Vision settings are per-agent.

---

## Step 4: Verify After Fixing

After confirming all three settings above are enabled:

1. **Restart the agent** if needed (some changes require a restart)
2. Send a test image to the agent through the channel you normally use
3. Ask the agent to describe what is in the image
4. If the agent successfully describes the image, the issue is resolved

---

## Quick Checklist

Use this checklist to make sure nothing is missed:

- [ ] Model supports vision (GPT-4o, Claude, Gemini Vision, Llama Vision, etc.)
- [ ] Vision is enabled in **Model Settings**
- [ ] Vision is enabled in **General Settings**
- [ ] Image processing is enabled in **Agent Settings**
- [ ] Agent has been restarted after changes
- [ ] Test image was processed successfully

---

## Still Having Issues?

If all three settings above are correct but the agent still cannot process images:

- **Check image format**: Make sure the image format is supported (JPEG, PNG, GIF, WebP are generally supported; special formats like HEIC may not be)
- **Check image size**: Some models have image size limits. Try sending a smaller resolution image
- **Check model connection**: If using a cloud model (API), make sure the internet connection is stable and the API key is valid
- **Check agent logs**: Open the agent logs to see if there are any specific errors related to image processing
- **Try a different channel**: If you are using WhatsApp, try sending the image through Telegram or web chat to isolate whether the issue is with the channel or the agent
