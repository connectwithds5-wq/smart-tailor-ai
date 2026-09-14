import type { PreviewRequest } from '@/lib/types';

/**
 * Commercial-safe VTON provider boundary.
 *
 * The model runs outside the Next.js/Vercel runtime (for example on a GPU VM).
 * Keep the HTTP contract stable so the underlying MIT-licensed implementation
 * can be replaced without changing the Smart Tailor UI or API route.
 */
export interface MitVtonResult {
  imageUrl: string;
  provider: 'mit-vton';
}

export async function generateWithMitVTON(input: PreviewRequest): Promise<MitVtonResult> {
  const endpoint = process.env.MIT_VTON_ENDPOINT;
  if (!endpoint) throw new Error('MIT_VTON_ENDPOINT is not configured.');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.MIT_VTON_API_KEY
        ? { Authorization: `Bearer ${process.env.MIT_VTON_API_KEY}` }
        : {}),
    },
    body: JSON.stringify(input),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`MIT VTON provider returned ${response.status}.`);

  const data = (await response.json()) as { imageUrl?: string; image_url?: string };
  const imageUrl = data.imageUrl ?? data.image_url;
  if (!imageUrl) throw new Error('MIT VTON provider did not return an image URL.');

  return { imageUrl, provider: 'mit-vton' };
}
