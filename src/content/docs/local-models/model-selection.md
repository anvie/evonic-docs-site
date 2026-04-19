---
title: Model Selection Guide
description: How to choose the right model for your use case and hardware.
---

# Model Selection Guide

Choosing the right model is critical for balancing performance, cost, and hardware requirements. This guide helps you select the best model for your needs.

## Quick Decision Matrix

| Use Case | Recommended Model | Quantization | Runner |
|----------|------------------|--------------|--------|
| General Chat | Llama 3.2 3B | Q5_K_M | Ollama |
| Code Generation | Codestral 22B | Q4_K_M | vLLM |
| Math/Reasoning | Qwen 2.5 7B | Q5_K_M | Ollama |
| SQL Generation | Llama 3 8B | Q4_K_M | llama.cpp |
| Document Analysis | Mistral 7B | Q5_K_M | Ollama |
| Edge Deployment | Phi-3 Mini 3.8B | Q4_K_M | llama.cpp |
| High-Throughput | Llama 3 70B | AWQ INT4 | vLLM |

## Model Categories

### General Purpose
Best for everyday tasks, chat, and general assistance.

| Model | Size | Strengths |
|-------|------|-----------|
| Llama 3.2 3B | 3B parameters | Fast, good for most tasks |
| Llama 3.2 11B | 11B parameters | Balanced performance |
| Mistral 7B v0.3 | 7B parameters | Versatile, well-rounded |
| Gemma 2 9B | 9B parameters | Strong reasoning |

### Code Generation
Optimized for programming tasks.

| Model | Size | Strengths |
|-------|------|-----------|
| Codestral 22B | 22B parameters | Multi-language, strong code gen |
| CodeLlama 7B | 7B parameters | Python, JavaScript, C++ |
| StarCoder2 15B | 15B parameters | Multi-language, large codebase |
| DeepSeek Coder 6.7B | 7B parameters | Strong code completion |

### Math & Reasoning
Specialized for logical reasoning and mathematical tasks.

| Model | Size | Strengths |
|-------|------|-----------|
| Qwen 2.5 7B | 7B parameters | Strong math and reasoning |
| Llama 3 8B | 8B parameters | Good general reasoning |
| Mistral 7B | 7B parameters | Solid logical reasoning |
| Gemma 2 9B | 9B parameters | Strong analytical skills |

### SQL & Data
Optimized for SQL generation and data analysis.

| Model | Size | Strengths |
|-------|------|-----------|
| Llama 3 8B | 8B parameters | Good SQL generation |
| CodeLlama 7B | 7B parameters | Strong SQL and data queries |
| Qwen 2.5 7B | 7B parameters | Good at structured data |

## Hardware Requirements

### Consumer GPU (8GB VRAM)
- Llama 3.2 3B (Q4+)
- Mistral 7B (Q4)
- Phi-3 Mini 3.8B (Q4+)

### Consumer GPU (12-16GB VRAM)
- Llama 3 8B (Q4)
- Qwen 2.5 7B (Q4+)
- Gemma 2 9B (Q4)

### High-End GPU (24GB VRAM)
- Llama 3 70B (Q4)
- Mixtral 8x7B (Q4)
- Codestral 22B (Q4)

### CPU-Only
- Phi-3 Mini 3.8B (Q4+)
- Llama 3.2 3B (Q4+)
- Qwen 2.5 1.5B (Q4+)

## Evaluation Criteria

### Accuracy
- Test with your specific use case
- Compare against baseline (cloud API)
- Consider both qualitative and quantitative metrics

### Speed
- Time to first token (TTFT)
- Tokens per second (TPS)
- Context length impact

### Memory Usage
- Model size (quantized)
- Context window requirements
- Batch size capabilities

### Cost
- Hardware investment
- Electricity costs
- Maintenance overhead

## Testing Your Model

### 1. Define Test Cases
Create a representative set of prompts for your use case.

### 2. Run Baseline
Test against a known good model (e.g., GPT-4, Claude) for comparison.

### 3. Run Local Model
Test your local model with the same prompts.

### 4. Compare Results
- Accuracy: Does the local model match the baseline?
- Speed: Is the response time acceptable?
- Quality: Is the output useful for your use case?

### 5. Iterate
- Try different quantizations
- Adjust model parameters
- Consider different models

## Recommendations

### For Beginners
Start with Llama 3.2 3B or Phi-3 Mini 3.8B on Ollama. These are fast, require minimal hardware, and perform well for most tasks.

### For Developers
Use Codestral 22B or CodeLlama 7B for code generation tasks. vLLM is recommended for high-throughput development workflows.

### For Production
Use Llama 3 8B or Qwen 2.5 7B with Q4_K_M quantization. These offer the best balance of quality and performance for production deployments.

### For Research
Use the largest model your hardware can handle. FP16 or Q8_0 quantization for maximum accuracy.

## Troubleshooting

### Model Too Slow
- Try a smaller model
- Use more aggressive quantization
- Enable GPU offloading
- Reduce context length

### Poor Quality
- Try a larger model
- Use less aggressive quantization
- Adjust temperature and other parameters
- Consider a model specialized for your use case

### Out of Memory
- Use a smaller model
- Increase quantization
- Reduce context length
- Enable more GPU offloading
