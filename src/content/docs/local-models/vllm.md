---
title: vLLM Setup
description: How to install and configure vLLM for high-throughput local model inference.
---

vLLM is a high-throughput and memory-efficient inference engine for large language models. It's designed for production workloads with support for PagedAttention, continuous batching, and optimized GPU utilization.

## Installation

### From pip
```bash
pip install vllm
```

### From Source
```bash
git clone https://github.com/vllm-project/vllm.git
cd vllm
pip install -e .
```

## Getting Started

### 1. Start the vLLM Server
```bash
python -m vllm.entrypoints.api_server \
    --model meta-llama/Llama-3-8b-Instruct \
    --host 0.0.0.0 \
    --port 8000
```

### 2. Test the Server
```bash
curl http://localhost:8000/v1/completions \
    -H "Content-Type: application/json" \
    -d '{
        "model": "meta-llama/Llama-3-8b-Instruct",
        "prompt": "Hello, how are you?",
        "max_tokens": 100
    }'
```

## Configuration with Evonic

### API Endpoint
vLLM runs an OpenAI-compatible API at `http://localhost:8000/v1`.

### Configuration
In your Evonic configuration:
```yaml
model:
  provider: vllm
  endpoint: http://localhost:8000/v1
  model_name: meta-llama/Llama-3-8b-Instruct
```

## Advanced Configuration

### GPU Memory
```bash
python -m vllm.entrypoints.api_server \
    --model meta-llama/Llama-3-8b-Instruct \
    --gpu-memory-utilization 0.9
```

### Tensor Parallelism (Multi-GPU)
```bash
python -m vllm.entrypoints.api_server \
    --model meta-llama/Llama-3-70b-Instruct \
    --tensor-parallel-size 4
```

### Quantization
```bash
python -m vllm.entrypoints.api_server \
    --model meta-llama/Llama-3-8b-Instruct \
    --quantization awq
```

### Continuous Batching
vLLM enables continuous batching by default for high throughput.

## Troubleshooting

### CUDA Errors
- Verify GPU compatibility
- Check CUDA version compatibility
- Ensure sufficient GPU memory

### Slow Startup
- Pre-download model weights
- Use quantized models
- Reduce tensor parallelism

### Memory Issues
- Reduce `gpu_memory_utilization`
- Use smaller models
- Enable quantization
