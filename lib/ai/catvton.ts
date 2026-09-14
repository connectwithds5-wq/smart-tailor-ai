import type { PreviewRequest } from '@/lib/types';

/**
 * Provider boundary for CatVTON. The actual GPU inference service is kept
 * outside the Next.js/Vercel runtime; this adapter gives the app one stable
 * contract so the provider can be swapped without changing the UI.
 */
export interface VtonResult {
  imageUrl: string;
  provider: 'catvton';
}

export async function generateWithCatVTON(_input: PreviewRequest): Promise<VtonResult> {
  const endpoint = process.env.CATVTON_ENDPOINT;
  if (!endpoint) throw new Error('CATVTON_ENDPOINT is not configured.');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.CATVTON_API_KEY ? { Authorization: `Bearer ${process.env.CATVTON_API_KEY}` } : {}),
    },
    body: JSON.stringify(_input),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`CatVTON provider returned ${response.status}.`);
  const data = (await response.json()) as { imageUrl?: string; image_url?: string };
  const imageUrl = data.imageUrl ?? data.image_url;
  if (!imageUrl) throw new Error('CatVTON provider did not return an image URL.');
  return { imageUrl, provider: 'catvton' };
}
