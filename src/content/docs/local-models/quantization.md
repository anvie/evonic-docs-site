---
title: Quantization Guide
description: Understanding quantization for local models - GGUF, AWQ, INT4/INT8 and more.
---

Quantization reduces model size and inference cost by representing weights with fewer bits. This is essential for running large models on consumer hardware.

## What is Quantization?

Quantization maps high-precision values (e.g., FP16, FP32) to lower-precision values (e.g., INT8, INT4). The trade-off is a small accuracy loss for significant gains in speed and memory efficiency.

## Quantization Formats

### GGUF (llama.cpp)
The most popular format for local LLMs. Supports various quantization levels:

| Format | Bits | Size Reduction | Quality |
|--------|------|----------------|---------|
| FP16 | 16 | 1x | Reference |
| Q8_0 | 8 | 2x | Near lossless |
| Q5_K_M | 5.7 | 2.8x | Excellent |
| Q4_K_M | 4.3 | 3.7x | Very Good |
| Q3_K_M | 3.4 | 4.7x | Good |
| Q2_K | 2.3 | 7x | Acceptable |

**Recommendation:** Q4_K_M or Q5_K_M for most use cases.

### AWQ (Activation-Aware Weight Quantization)
Optimized for GPU inference with vLLM and other engines:

| Format | Bits | Quality |
|--------|------|---------|
| FP16 | 16 | Reference |
| AWQ INT4 | 4 | Very Good |
| AWQ INT8 | 8 | Near lossless |

### GPTQ (Generative Post-Training Quantization)
Another GPU-friendly format:

| Format | Bits | Quality |
|--------|------|---------|
| FP16 | 16 | Reference |
| GPTQ INT4 | 4 | Very Good |
| GPTQ INT8 | 8 | Near lossless |

## Choosing the Right Quantization

### For Consumer GPUs (8-12GB VRAM)
- Use Q4_K_M or Q5_K_M (GGUF)
- Model size: 4-7B parameters ideal
- Good balance of speed and quality

### For High-End GPUs (24GB+ VRAM)
- Use Q8_0 or FP16 (GGUF)
- Model size: 13-70B parameters possible
- Maximum quality with reasonable speed

### For CPU-Only Systems
- Use Q4_K_M or Q5_K_M (GGUF)
- More threads help performance
- Consider smaller models (3-7B)

### For Edge Devices
- Use Q2_K or Q3_K_M (GGUF)
- Prioritize speed over quality
- Consider specialized models (e.g., Phi-3, Gemma)

## How to Convert Models

### Converting to GGUF
```bash
# Using llama.cpp conversion script
python convert_hf_to_gguf.py \
    --model /path/to/hf/model \
    --outfile /path/to/output.gguf \
    --outtype f16
```

### Using Pre-Quantized Models
Most popular models are available pre-quantized on Hugging Face:
- [TheBloke](https://huggingface.co/TheBloke) - Extensive GGUF collection
- [Bartowski](https://huggingface.co/Bartowski) - AWQ and GPTQ models
- [llama.cpp](https://huggingface.co/llama.cpp) - Official GGUF models

## Performance Tips

### Memory Optimization
- Use the smallest quantization that meets your quality needs
- Reduce context length (`num_ctx`) to minimum required
- Enable GPU offloading when possible

### Speed Optimization
- Use KV cache quantization (supported in newer GGUF versions)
- Enable flash attention (if supported by your hardware)
- Use continuous batching (vLLM) or speculative decoding

### Quality Preservation
- Always test with your specific use case
- Q4_K_M is usually the sweet spot
- For critical applications, use Q5_K_M or Q8_0
- Keep FP16 as reference for comparison

## Troubleshooting

### Blurry/Nonsensical Output
- Quantization too aggressive (try Q5_K_M or Q8_0)
- Model too small for the task
- Insufficient context length

### Slow Inference
- Model too large for your hardware
- Try a more quantized version
- Enable GPU offloading

### Out of Memory
- Use a smaller model
- Increase quantization (Q4 → Q8)
- Reduce context length
- Enable more GPU offloading
