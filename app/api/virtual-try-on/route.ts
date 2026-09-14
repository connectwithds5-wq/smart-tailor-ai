import { NextResponse } from 'next/server';
import type { PreviewRequest, PreviewResponse } from '@/lib/types';
import { generateWithCatVTON } from '@/lib/ai/catvton';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewRequest;
    const measurements = body.measurements ?? {};
    const chest = Number(measurements.chest ?? 0);
    const waist = Number(measurements.waist ?? 0);
    const ratio = chest && waist ? chest / waist : 0;
    const bodyProfile = ratio >= 1.18 ? 'Athletic build' : ratio >= 1.08 ? 'Balanced build' : 'Straight build';

    if (process.env.CATVTON_ENDPOINT && body.photoDataUrl) {
      try {
        const generated = await generateWithCatVTON(body);
        return NextResponse.json({
          status: 'ready',
          imageUrl: generated.imageUrl,
          bodyProfile,
          message: 'CatVTON preview generated successfully.',
          colorMatch: { name: body.garment?.colorName ?? 'Navy', score: body.garment?.colorName === 'Navy' ? 96 : 90, reason: 'Selected colour for the current garment.' },
        });
      } catch (error) {
        console.error('CatVTON generation failed:', error);
      }
    }

    const response: PreviewResponse = {
      status: 'demo',
      message: body.photoDataUrl
        ? 'Photo received. Add CATVTON_ENDPOINT to enable real GPU try-on.'
        : 'Add a front customer photo to start virtual try-on.',
      bodyProfile,
      colorMatch: { name: body.garment?.colorName ?? 'Navy', score: body.garment?.colorName === 'Navy' ? 96 : 90, reason: 'Versatile contrast for the selected profile and garment style.' },
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Invalid preview request.' }, { status: 400 });
  }
}
