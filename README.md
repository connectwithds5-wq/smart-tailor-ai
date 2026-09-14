# Smart Tailor AI

AI-powered tailoring and virtual fitting studio for tailors and customers.

## MVP
- Editable tailor-verified measurements
- Front + side customer photo upload
- Shirt / pant style studio
- Fit, collar/rise and colour selection
- Measurement-based body profile
- Preview API foundation for a real virtual try-on provider
- Provider credentials documented through `.env.example`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## AI architecture

The UI sends measurements, garment style and optional customer photos to `/api/virtual-try-on`. The route currently returns a safe demo response and is intentionally provider-agnostic. The next integration can plug in a photorealistic image-generation / virtual try-on provider without changing the fitting UI.

Never commit real API keys. Use environment variables in your deployment platform.

## Roadmap

1. Connect production image generation / virtual try-on
2. Customer profiles and saved measurements
3. Fabric catalogue and fabric-photo visualization
4. AI colour/style recommendations
5. Orders, fitting history and WhatsApp sharing
6. Camera-assisted measurement and multi-tailor SaaS
