import { NextResponse } from 'next/server';
import type { PreviewRequest, PreviewResponse } from '@/lib/types';
import { generateWithCatVTON } from '@/lib/ai/catvton';
import { generateWithFashnVTON } from '@/lib/ai/fashn-vton';

function buildColorMatch(colorName?: string) {
  const name = colorName ?? 'Navy';
  return {
    name,
    score: name === 'Navy' ? 96 : 90,
    reason: 'Selected colour for the current garment and customer profile.',
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewRequest;
    const measurements = body.measurements ?? {};
    const chest = Number(measurements.chest ?? 0);
    const waist = Number(measurements.waist ?? 0);
    const ratio = chest && waist ? chest / waist : 0;
    const bodyProfile = ratio >= 1.18 ? 'Athletic build' : ratio >= 1.08 ? 'Balanced build' : 'Straight build';

    if (body.photoDataUrl && body.garmentDataUrl) {
      // FASHN VTON 1.5 is the primary commercial-safe provider.
      if (process.env.FASHN_VTON_ENDPOINT) {
        try {
          const generated = await generateWithFashnVTON(body);
          return NextResponse.json({
            status: 'ready',
            imageUrl: generated.imageUrl,
            bodyProfile,
            message: 'AI garment preview generated with FASHN VTON 1.5.',
            colorMatch: buildColorMatch(body.garment?.colorName),
          });
        } catch (error) {
          console.error('FASHN VTON generation failed:', error);
        }
      }

      // CatVTON is retained only as a prototype/testing fallback.
      if (process.env.CATVTON_ENDPOINT) {
        try {
          const generated = await generateWithCatVTON(body);
          return NextResponse.json({
            status: 'ready',
            imageUrl: generated.imageUrl,
            bodyProfile,
            message: 'Prototype AI preview generated with CatVTON.',
            colorMatch: buildColorMatch(body.garment?.colorName),
          });
        } catch (error) {
          console.error('CatVTON generation failed:', error);
        }
      }
    }

    const providerConfigured = Boolean(process.env.FASHN_VTON_ENDPOINT || process.env.CATVTON_ENDPOINT);
    const response: PreviewResponse = {
      status: 'demo',
      message: !body.photoDataUrl
        ? 'Add a front customer photo to start virtual try-on.'
        : !body.garmentDataUrl
          ? 'Add a garment/fabric photo so the AI can visualize the selected look.'
          : providerConfigured
            ? 'AI provider was unavailable. The customer profile was created successfully; try generating again.'
            : 'Photo received. Configure FASHN_VTON_ENDPOINT for the GPU try-on service.',
      bodyProfile,
      colorMatch: buildColorMatch(body.garment?.colorName),
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Invalid preview request.' }, { status: 400 });
  }
}
