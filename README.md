# Smart Tailor AI

AI-powered tailoring and virtual fitting studio for tailors and customers.

## MVP
- Editable tailor-verified measurements
- Front + side customer photo upload
- Garment/fabric photo upload
- Shirt / pant style studio
- Fit, collar/rise and colour selection
- Measurement-based body profile
- Real virtual try-on provider integration
- FASHN VTON 1.5 GPU/ZeroGPU service scaffold
- Optional CatVTON prototype fallback

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## AI architecture

The UI sends measurements, customer photos and the selected garment/fabric photo to `/api/virtual-try-on`.

Provider priority:

1. `FASHN_VTON_ENDPOINT` — primary commercial-safe VTON service.
2. `CATVTON_ENDPOINT` — optional prototype/testing fallback.
3. Demo response — used when no provider is configured or a provider is temporarily unavailable.

FASHN VTON v1.5 is an Apache-2.0 maskless virtual try-on model. Its published model card describes person + garment image inference, support for tops/bottoms/one-pieces and about 8 GB VRAM for inference. citeturn5search0turn5search4

## GPU service

The `vton-service/` directory contains a Gradio/ZeroGPU wrapper around FASHN VTON 1.5. The service exposes a `try_on` Gradio API endpoint. Gradio's HTTP API uses a two-step submit/event flow; the Smart Tailor adapter handles that internally. citeturn8search0turn8search5

Set:

```text
FASHN_VTON_ENDPOINT=https://<your-space>.hf.space/gradio_api/call/try_on
```

The ZeroGPU path is intended for prototyping. Hugging Face currently provides shared ZeroGPU execution for compatible Gradio Spaces, with daily quotas and queueing; production should move to dedicated GPU infrastructure when needed. citeturn0search1

### Important licensing note

CatVTON remains only a prototype/testing fallback because its upstream license is non-commercial. Do not use it as the commercial SaaS model without separate licensing clearance.

FASHN VTON 1.5 is released under Apache-2.0, although its repository lists third-party components with their own licenses; review those notices before commercial deployment. citeturn5search1turn5search4

Never commit real API keys, customer photos, generated customer images, or model weights. Use deployment environment variables.

## Roadmap

1. Deploy and test the FASHN VTON GPU Space
2. Customer profiles and saved measurements
3. Fabric catalogue and fabric-photo visualization
4. AI colour/style recommendations
5. Orders, fitting history and WhatsApp sharing
6. Camera-assisted measurement and multi-tailor SaaS
