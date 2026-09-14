import { NextResponse } from 'next/server';
import type { PreviewRequest, PreviewResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewRequest;
    const measurements = body.measurements ?? {};
    const chest = Number(measurements.chest ?? 0);
    const waist = Number(measurements.waist ?? 0);
    const ratio = chest && waist ? chest / waist : 0;

    const bodyProfile = ratio >= 1.18 ? 'Athletic build' : ratio >= 1.08 ? 'Balanced build' : 'Straight build';
    const response: PreviewResponse = {
      status: 'demo',
      message: 'Preview pipeline is ready. Connect an image-generation provider to render the photorealistic garment.',
      bodyProfile,
      colorMatch: {
        name: body.garment?.colorName ?? 'Navy',
        score: body.garment?.colorName === 'Navy' ? 96 : 90,
        reason: 'Versatile contrast for the selected profile and garment style.',
      },
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Invalid preview request.' }, { status: 400 });
  }
}
