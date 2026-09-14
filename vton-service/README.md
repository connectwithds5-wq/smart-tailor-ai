# Smart Tailor MIT VTON GPU Service

This folder defines the GPU-side service contract used by Smart Tailor AI.

The Next.js app sends a `PreviewRequest` to `MIT_VTON_ENDPOINT` and expects:

```json
{
  "imageUrl": "https://.../generated-result.png"
}
```

Accepted response key: `imageUrl` or `image_url`.

## Request

```json
{
  "measurements": {
    "height": 178,
    "chest": 102,
    "waist": 88,
    "shoulder": 45
  },
  "garment": {
    "type": "shirt",
    "style": "slim",
    "colorName": "Navy",
    "colorHex": "#17243a"
  },
  "photoDataUrl": "data:image/jpeg;base64,..."
}
```

The service should:

1. Decode the customer front photo.
2. Decode/obtain the target garment image.
3. Run the MIT-licensed virtual try-on inference pipeline.
4. Save the generated result to temporary/object storage.
5. Return a public HTTPS image URL.

## Model

The initial commercial-safe candidate is `huzaifanasir95/AI-Virtual-TryOn`, which is published under the MIT license. The model uses a PyTorch image-to-image VTON pipeline based on multi-modal feature fusion, pose/parsing and a U-Net/GAN architecture.

Do not commit model weights, customer photos, generated customer images, or API keys to this repository.

## Deployment target

A Hugging Face Space can be used for prototyping. ZeroGPU provides shared GPU execution for compatible Gradio Spaces, subject to account quotas and hosting requirements. For a production tailoring SaaS, move this service to dedicated GPU infrastructure when latency, concurrency and privacy requirements justify it.

## API contract

`POST /generate`

Headers:

```text
Content-Type: application/json
Authorization: Bearer <optional-service-key>
```

Response:

```json
{
  "imageUrl": "https://cdn.example.com/vton/result.png"
}
```

Health endpoint:

`GET /health` → `{ "status": "ok" }`

## Important

This scaffold intentionally does not pretend that the upstream research repository already exposes a production REST endpoint. The inference wrapper must be tested with the model's actual checkpoint/preprocessing requirements before it is connected to the live Smart Tailor app.
