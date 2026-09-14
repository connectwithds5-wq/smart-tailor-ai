import type { PreviewRequest } from '@/lib/types';

export interface FashnVtonResult {
  imageUrl: string;
  provider: 'fashn-vton';
}

function categoryFor(garment: PreviewRequest['garment']['garment']) {
  return garment === 'pant' ? 'bottoms' : 'tops';
}

function extractCompleteData(sse: string): unknown {
  const lines = sse.split(/\r?\n/);
  const completeIndex = lines.findIndex((line) => line.trim() === 'event: complete');
  const start = completeIndex >= 0 ? completeIndex + 1 : 0;
  for (let i = start; i < lines.length; i += 1) {
    if (lines[i].startsWith('data: ')) return JSON.parse(lines[i].slice(6));
  }
  throw new Error('FASHN VTON returned no completed result.');
}

export async function generateWithFashnVTON(input: PreviewRequest): Promise<FashnVtonResult> {
  const endpoint = process.env.FASHN_VTON_ENDPOINT;
  if (!endpoint) throw new Error('FASHN_VTON_ENDPOINT is not configured.');
  if (!input.photoDataUrl) throw new Error('Customer front photo is required.');
  if (!input.garmentDataUrl) throw new Error('Garment photo is required for FASHN VTON.');

  const startUrl = endpoint.replace(/\/$/, '');
  const response = await fetch(startUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.FASHN_VTON_API_KEY
        ? { Authorization: `Bearer ${process.env.FASHN_VTON_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      data: [input.photoDataUrl, input.garmentDataUrl, categoryFor(input.garment.garment)],
    }),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`FASHN VTON submit returned ${response.status}.`);
  const { event_id: eventId } = (await response.json()) as { event_id?: string };
  if (!eventId) throw new Error('FASHN VTON did not return an event id.');

  const resultResponse = await fetch(`${startUrl}/${encodeURIComponent(eventId)}`, {
    headers: process.env.FASHN_VTON_API_KEY
      ? { Authorization: `Bearer ${process.env.FASHN_VTON_API_KEY}` }
      : undefined,
    cache: 'no-store',
  });
  if (!resultResponse.ok) throw new Error(`FASHN VTON result returned ${resultResponse.status}.`);

  const output = extractCompleteData(await resultResponse.text());
  const values = Array.isArray(output) ? output : [output];
  const imageUrl = typeof values[0] === 'string' ? values[0] : undefined;
  if (!imageUrl?.startsWith('data:image/')) throw new Error('FASHN VTON did not return an image data URL.');

  return { imageUrl, provider: 'fashn-vton' };
}
