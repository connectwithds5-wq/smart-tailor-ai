import { NextResponse } from 'next/server';
import type { PreviewRequest, PreviewResponse } from '@/lib/types';
import { generateWithCatVTON } from '@/lib/ai/catvton';
import { generateWithMitVTON } from '@/lib/ai/mit-vton';

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

    if (body.photoDataUrl) {
      // Commercial-safe provider is first. CatVTON remains an optional
      // prototype/testing fallback because its upstream license is non-commercial.
      if (process.env.MIT_VTON_ENDPOINT) {
        try {
          const generated = await generateWithMitVTON(body);
          return NextResponse.json({
            status: 'ready',
            imageUrl: generated.imageUrl,
            bodyProfile,
            message: 'AI preview generated successfully.',
            colorMatch: buildColorMatch(body.garment?.colorName),
          });
        } catch (error) {
          console.error('MIT VTON generation failed:', error);
        }
      }

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

    const providerConfigured = Boolean(process.env.MIT_VTON_ENDPOINT || process.env.CATVTON_ENDPOINT);
    const response: PreviewResponse = {
      status: 'demo',
      message: body.photoDataUrl
        ? providerConfigured
          ? 'AI provider was unavailable. The customer profile was created successfully; try generating again.'
          : 'Photo received. Add MIT_VTON_ENDPOINT for the commercial-safe GPU provider, or CATVTON_ENDPOINT for prototype testing.'
        : 'Add a front customer photo to start virtual try-on.',
      bodyProfile,
      colorMatch: buildColorMatch(body.garment?.colorName),
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Invalid preview request.' }, { status: 400 });
  }
}
