---
title: Smart Tailor VTON
emoji: 👔
colorFrom: stone
colorTo: amber
sdk: gradio
sdk_version: 6.3.0
python_version: 3.10
app_file: app.py
pinned: false
license: apache-2.0
short_description: Smart Tailor virtual try-on using FASHN VTON 1.5
---

# Smart Tailor VTON GPU Service

This Space is the GPU inference side of Smart Tailor AI.

## Model

The service uses **FASHN VTON v1.5**, a maskless image-to-image virtual try-on model. The model and upstream implementation are Apache-2.0 licensed. It accepts a person image plus a garment image and supports `tops`, `bottoms`, and `one-pieces`. The published model requires roughly 8 GB VRAM for inference.

## Inputs

The Gradio API endpoint is named `try_on` and accepts:

1. Customer front image as a data URL
2. Garment/fabric image as a data URL
3. Category: `tops`, `bottoms`, or `one-pieces`

It returns a PNG data URL so the Smart Tailor Next.js API can display the result without requiring a separate object-storage service for the prototype.

## Smart Tailor integration

Set the web app environment variable:

```text
FASHN_VTON_ENDPOINT=https://<your-space>.hf.space/gradio_api/call/try_on
```

The Next.js adapter handles Gradio's two-step event/SSE API and converts the generated result into the normal `{ imageUrl }` response expected by the frontend.

## ZeroGPU

The inference function uses the Hugging Face `spaces.GPU` decorator. This makes the Space compatible with shared ZeroGPU execution for prototyping. ZeroGPU has daily quotas and queueing; dedicated GPU hosting should be used for production workloads.

Never commit customer photos, generated customer images, API keys, or model weights to the Smart Tailor repository.
