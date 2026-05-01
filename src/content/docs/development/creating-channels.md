---
title: Creating Channels
description: How to implement new messaging channel integrations.
sidebar:
  order: 4
---

## Overview

Channels are modular integrations that connect agents to external messaging platforms. Each channel type implements the `BaseChannel` abstract class.

## The BaseChannel Interface

```python
# backend/channels/base.py

class BaseChannel(ABC):
    def __init__(self, channel_id: str, agent_id: str, config: dict):
        self.channel_id = channel_id
        self.agent_id = agent_id
        self.config = config
        self._running = False

    @abstractmethod
    def start(self):
        """Start listening for incoming messages."""

    @abstractmethod
    def stop(self):
        """Stop listening and clean up resources."""

    @abstractmethod
    def send_message(self, external_user_id: str, text: str):
        """Send a message to a user on the platform."""

    @staticmethod
    @abstractmethod
    def get_channel_type() -> str:
        """Return the type identifier (e.g., 'telegram')."""

    @property
    def is_running(self) -> bool:
        return self._running
```

## Implementing a New Channel

### Step 1: Create the Channel Class

Create `backend/channels/<type>.py`:

```python
# backend/channels/discord.py

from backend.channels.base import BaseChannel

class DiscordChannel(BaseChannel):
    def __init__(self, channel_id, agent_id, config):
        super().__init__(channel_id, agent_id, config)
        self._client = None

    @staticmethod
    def get_channel_type():
        return 'discord'

    def start(self):
        import discord
        from backend.agent_runtime import agent_runtime

        bot_token = self.config.get('bot_token', '')
        agent_id = self.agent_id
        channel_id = self.channel_id

        intents = discord.Intents.default()
        intents.message_content = True
        self._client = discord.Client(intents=intents)

        @self._client.event
        async def on_message(message):
            if message.author == self._client.user:
                return
            user_id = str(message.author.id)
            response = agent_runtime.handle_message(
                agent_id, user_id, message.content, channel_id
            )
            await message.channel.send(response)

        # Run in background thread
        import threading
        def run():
            self._client.run(bot_token)
        self._thread = threading.Thread(target=run, daemon=True)
        self._thread.start()
        self._running = True

    def stop(self):
        if self._client:
            import asyncio
            asyncio.run(self._client.close())
        self._running = False

    def send_message(self, external_user_id, text):
        # Discord requires channel context, implementation varies
        pass
```

### Step 2: Register the Channel Type

Add your channel to `backend/channels/registry.py`:

```python
from backend.channels.discord import DiscordChannel

CHANNEL_TYPES = {
    'telegram': TelegramChannel,
    'discord': DiscordChannel,  # Add here
}
```

### Step 3: Add UI Config Fields (Optional)

In `templates/agent_detail.html`, add config fields for the new type in the `updateChannelConfigFields()` function:

```javascript
} else if (type === 'discord') {
    container.innerHTML = `
        <label>Bot Token</label>
        <input type="text" id="channel-bot-token" placeholder="Discord bot token">
        <label>Guild ID</label>
        <input type="text" id="channel-guild-id" placeholder="Server ID">`;
}
```

## Key Implementation Notes

### Message Handling

The core interaction is simple: when a message arrives:

```python
from backend.agent_runtime import agent_runtime

response = agent_runtime.handle_message(
    agent_id=self.agent_id,
    external_user_id=user_id,      # Platform-specific user ID
    message=text,                   # The message text
    channel_id=self.channel_id      # For session scoping
)
```

The agent runtime handles everything: session management, system prompt, tools, LLM calls, and message persistence.

### Threading

Channels typically run in background daemon threads since they use long-polling or websocket connections. Set `daemon=True` so the thread doesn't block server shutdown.

### Config Schema

Channel config is stored as JSON in the database. Each channel type defines its own config fields (bot tokens, API keys, etc.). The config dict is passed to the constructor.

### Error Handling

If a channel fails to start (missing token, library not installed), the `ChannelManager` catches the exception and logs it. Other channels continue to operate normally.

## Reference: Telegram Implementation

See `backend/channels/telegram.py` for the complete reference implementation using `python-telegram-bot`:
- Async message handling
- Background polling thread
- Graceful stop
