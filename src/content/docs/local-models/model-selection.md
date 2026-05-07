---
title: Model Selection Guide
description: How to choose the right model for your use case and hardware.
---

Choosing the right model is critical for balancing performance, cost, and hardware requirements. This guide helps you select the best **model size category** for your needs — keeping recommendations future-proof as new models are released.

## Quick Decision Matrix

| Use Case | Recommended Size | Quantization | Runner |
|----------|-----------------|--------------|--------|
| General Chat | Small (3–7B) | Q5_K_M | Ollama |
| Code Generation | Medium (7–22B) | Q4_K_M | vLLM |
| Math/Reasoning | Medium (7–9B) | Q5_K_M | Ollama |
| SQL Generation | Medium (7–8B) | Q4_K_M | llama.cpp |
| Document Analysis | Small–Medium (7B) | Q5_K_M | Ollama |
| Edge Deployment | Small (3–4B) | Q4_K_M | llama.cpp |
| High-Throughput | Large (70B+) | AWQ INT4 | vLLM |

## Model Size Categories

### General Purpose
Best for everyday tasks, chat, and general assistance.

| Size Category | Parameter Range | Strengths |
|---------------|----------------|-----------|
| Small | 1–4B | Fast, minimal hardware, good for basic tasks |
| Small–Medium | 7–9B | Balanced performance, versatile |
| Medium | 11–14B | Strong reasoning, well-rounded |

### Code Generation
Optimized for programming tasks. Aim for a model in the **7–22B range** for the best balance of code quality and speed.

| Size Category | Parameter Range | Strengths |
|---------------|----------------|-----------|
| Small | Up to 7B | Good for common languages (Python, JS, C++) |
| Medium | 15–22B | Multi-language, strong code gen |
| Large | 34B+ | Maximum capability, higher hardware requirements |

### Math & Reasoning
Specialized for logical reasoning and mathematical tasks.

| Size Category | Parameter Range | Strengths |
|---------------|----------------|-----------|
| Small–Medium | 7–9B | Solid math and reasoning capabilities |
| Medium | 9–14B | Strong analytical skills |

### SQL & Data
Optimized for SQL generation and data analysis.

| Size Category | Parameter Range | Strengths |
|---------------|----------------|-----------|
| Small–Medium | 7–8B | Good SQL generation and structured data handling |

## Hardware Requirements

### Consumer GPU (8GB VRAM)
- Small model (3–4B, Q4+)
- Small–Medium model (7B, Q4)

### Consumer GPU (12–16GB VRAM)
- Small–Medium model (7–9B, Q4+)

### High-End GPU (24GB VRAM)
- Large model (70B, Q4)
- Medium model (20–22B, Q4)
- Mixture-of-Experts model (8x7B, Q4)

### CPU-Only
- Small model (1–4B, Q4+)
- Tiny model (1.5B, Q4+)

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
Test against a trusted baseline model (e.g., a cloud API) for comparison.

### 3. Run Local Model
Test your local model with the same prompts.

### 4. Compare Results
- **Accuracy**: Does the local model match the baseline?
- **Speed**: Is the response time acceptable?
- **Quality**: Is the output useful for your use case?

### 5. Iterate
- Try different quantizations
- Adjust model parameters
- Consider different models in the same size category

## Recommendations

### For Beginners
Start with a **small model (3–4B)** on Ollama. These are fast, require minimal hardware, and perform well for most everyday tasks.

### For Developers
Use a **medium-sized model (7–22B)** for code generation tasks. Ollama or vLLM is recommended depending on your throughput needs.

### For Production
Use a **small–medium model (7–9B)** with Q4_K_M quantization. These offer the best balance of quality and performance for production deployments.

### For Research
Use the **largest model your hardware can handle**. FP16 or Q8_0 quantization for maximum accuracy.

## Troubleshooting

### Model Too Slow
- Try a smaller model size category
- Use more aggressive quantization
- Enable GPU offloading
- Reduce context length

### Poor Quality
- Try a larger model size category
- Use less aggressive quantization
- Adjust temperature and other parameters
- Consider a model specialized for your use case

### Out of Memory
- Use a smaller model size category
- Increase quantization
- Reduce context length
- Enable more GPU offloading
