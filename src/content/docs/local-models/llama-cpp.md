---
title: llama.cpp Setup
description: How to install and configure llama.cpp for local model inference.
---

# llama.cpp Setup

llama.cpp is a highly optimized C++ library for running large language models with minimal resources. It's ideal for edge devices, CPU-only environments, and maximum portability.

## Installation

### From Source
```bash
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
cmake -B build
cmake --build build --config Release -j $(nproc)
```

### Using pip (llama-cpp-python)
```bash
pip install llama-cpp-python
```

### Pre-built Binaries
Download pre-built binaries from the [releases page](https://github.com/ggerganov/llama.cpp/releases)

## Getting Started

### 1. Convert a Model
Convert models to GGUF format (llama.cpp's native format):
```bash
python convert.py model.bin model.gguf
```

### 2. Run a Model
```bash
./main -m model.gguf -n 512 -p "Hello, how are you?"
```

### 3. Start the API Server
```bash
./server -m model.gguf --host 0.0.0.0 --port 8080
```

## Configuration with Evonic AI Platform

### API Endpoint
llama.cpp server runs at `http://localhost:8080` by default.

### Configuration
In your Evonic AI Platform configuration:
```yaml
model:
  provider: llama-cpp
  endpoint: http://localhost:8080
  model_name: model.gguf
```

## Model Management

### GGUF Format
- Native format for llama.cpp
- Supports various quantization levels
- Convert from Hugging Face models using conversion scripts

### Model Sources
- Hugging Face GGUF models: [TheBloke](https://huggingface.co/TheBloke)
- Official GGUF models from model creators
- Convert your own models to GGUF

## Advanced Configuration

### GPU Offloading
```bash
./server -m model.gguf -ngl 35
```
Where `-ngl` specifies the number of layers to offload to GPU.

### Context Length
```bash
./server -m model.gguf -c 8192
```
Set context length to 8192 tokens.

### Multi-Thread
```bash
./server -m model.gguf -t 8
```
Use 8 threads for inference.

### Quantization
Run with quantized models for better performance:
```bash
./server -m model-Q4_K_M.gguf
```

## Troubleshooting

### Out of Memory
- Use a quantized model (Q4, Q5, Q8)
- Reduce context length
- Increase GPU offloading (`-ngl`)

### Slow Inference
- Enable GPU offloading
- Use more CPU threads
- Choose a smaller model

### Model Not Loading
- Verify GGUF format
- Check file permissions
- Ensure sufficient disk space
