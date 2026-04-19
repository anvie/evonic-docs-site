---
title: Ollama Setup
description: How to install and configure Ollama for local model inference.
---

# Ollama Setup

Ollama is the easiest way to run large language models locally. It provides a simple CLI and API interface with support for many popular models.

## Installation

### macOS
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
Download the installer from [ollama.com](https://ollama.com/)

## Getting Started

### 1. Start Ollama
```bash
ollama serve
```

### 2. Pull a Model
```bash
ollama pull llama3.2
ollama pull mistral
ollama pull codellama
```

### 3. Test the Model
```bash
ollama run llama3.2
```

## Configuration with Evonic AI Platform

### API Endpoint
Ollama runs a local API server by default at `http://localhost:11434`.

### Configuration
In your Evonic AI Platform configuration:
```yaml
model:
  provider: ollama
  endpoint: http://localhost:11434
  model_name: llama3.2
```

### Available Models
Browse available models at [ollama.com/library](https://ollama.com/library) or list them:
```bash
ollama list
```

## Model Management

### List Installed Models
```bash
ollama list
```

### Remove a Model
```bash
ollama rm llama3.2
```

### Copy a Model
```bash
ollama cp llama3.2 llama3.2-custom
```

## Advanced Configuration

### GPU Acceleration
Ollama automatically uses GPU if available. To force CPU-only:
```bash
OLLAMA_NUM_GPU=0 ollama serve
```

### Custom Port
```bash
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

### Model Parameters
Create a Modelfile for custom parameters:
```
FROM llama3.2
PARAMETER temperature 0.7
PARAMETER num_ctx 4096
SYSTEM """You are a helpful assistant."""
```

Build the custom model:
```bash
ollama create my-model -f Modelfile
```

## Troubleshooting

### Model Not Loading
- Check GPU memory availability
- Try a smaller model (e.g., `llama3.2:1b` instead of `llama3.2:70b`)
- Ensure Ollama is running: `ollama list`

### Slow Inference
- Enable GPU acceleration
- Reduce `num_ctx` parameter
- Close other GPU-intensive applications

### Connection Refused
- Verify Ollama is running: `curl http://localhost:11434`
- Check firewall settings
- Ensure correct endpoint in configuration
