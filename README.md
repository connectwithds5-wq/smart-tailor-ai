# Smart Tailor AI

AI-powered tailoring and virtual fitting studio for tailors and customers.

## MVP
- Editable tailor-verified measurements
- Front + side customer photo upload
- Shirt / pant style studio
- Fit, collar/rise and colour selection
- Measurement-based body profile
- Provider-agnostic virtual try-on API
- Commercial-safe GPU provider as the primary integration path
- Optional CatVTON prototype fallback

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## AI architecture

The UI sends measurements, garment style and optional customer photos to `/api/virtual-try-on`.

Provider priority:

1. `MIT_VTON_ENDPOINT` — recommended commercial-safe GPU endpoint.
2. `CATVTON_ENDPOINT` — optional prototype/testing fallback.
3. Demo response — used when no provider is configured or a provider is temporarily unavailable.

Both providers use the same REST contract: POST the `PreviewRequest` JSON and return `{ "imageUrl": "..." }` (or `image_url`). This keeps the Next.js app independent from the GPU implementation.

### Important licensing note

CatVTON's upstream repository states that its code, checkpoints and demo are licensed CC BY-NC-SA 4.0 and are available for non-commercial purposes. It should therefore remain a prototype/testing fallback rather than the commercial SaaS model. See the upstream license before using it in any paid deployment.

For the commercial path, the repo is structured around a separate GPU endpoint so we can deploy a compatible MIT-licensed VTON implementation without coupling the web app to one model.

Never commit real API keys. Use environment variables in your deployment platform. See `.env.example`.

## GPU provider contract

Your GPU service should accept:

```json
{
  "measurements": {},
  "garment": {},
  "photoDataUrl": "data:image/...",
  "sidePhotoDataUrl": "data:image/..."
}
```

and return:

```json
{ "imageUrl": "https://.../generated-preview.png" }
```

The service can later be backed by the selected MIT-licensed model, a dedicated GPU VM, or another commercially licensed provider without changing the Smart Tailor frontend.

## Roadmap

1. Connect and test the GPU VTON service
2. Customer profiles and saved measurements
3. Fabric catalogue and fabric-photo visualization
4. AI colour/style recommendations
5. Orders, fitting history and WhatsApp sharing
6. Camera-assisted measurement and multi-tailor SaaS
