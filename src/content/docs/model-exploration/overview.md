---
title: Model Explorer Overview
description: Evaluate and compare open-source models to find the right fit for your use case.
---

# Model Explorer Overview

The Model Explorer (formerly Evaluator) is a built-in feature of the Evonic AI Platform that helps you evaluate and compare open-source models. It's designed to help you find the right model for your specific use case and hardware constraints.

## Why Evaluate Models?

Different models excel at different tasks. Before deploying an agent in production, you should:

- **Test accuracy** — Does the model understand your domain?
- **Measure speed** — Is the response time acceptable?
- **Check resource usage** — Can your hardware handle it?
- **Compare options** — Find the best model for your needs

## Evaluation Domains

The Model Explorer tests models across multiple domains:

| Domain | What it Tests |
|--------|---------------|
| `conversation` | Language fluency, keyword understanding, contextual responses |
| `math` | Arithmetic to multi-step word problems |
| `sql` | SQL generation against a real database |
| `tool_calling` | Function calling with OpenAI tool format |
| `reasoning` | Logical deduction and problem solving |
| `health` | Medical/health knowledge questions |
| `needle_in_haystack` | Finding specific info in long contexts |

## Complexity Levels

Each domain has 5 levels of increasing difficulty:

1. **Level 1** — Basic concepts and simple tasks
2. **Level 2** — Intermediate understanding
3. **Level 3** — Complex scenarios
4. **Level 4** — Advanced reasoning
5. **Level 5** — Expert-level challenges

## How It Works

1. **Select a model** — Choose from your configured local or remote models
2. **Choose domains** — Select which domains to evaluate
3. **Run evaluation** — The platform tests the model across all selected domains
4. **Review results** — See color-coded results and detailed per-test breakdowns
5. **Compare models** — Run multiple evaluations to compare different models

## Results Dashboard

The results dashboard shows:

- **Progress matrix** — Color-coded grid showing pass/fail status
- **Per-test details** — Full prompt, response, and scoring for each test
- **Historical tracking** — Compare results across multiple runs
- **Export options** — Download results for further analysis

## Getting Started

1. Navigate to the **Model Explorer** section
2. Click **Start Evaluation**
3. Select your model and domains
4. Watch the real-time progress matrix
5. Review detailed results

## Next Steps

- [Evaluation workflow](/model-exploration/evaluation-workflow)
- [Evaluator types](/model-exploration/evaluator-types)
- [Test definitions](/model-exploration/test-definitions)
- [Viewing results](/model-exploration/results)
