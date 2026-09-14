export type MeasurementKey =
  | 'height' | 'chest' | 'waist' | 'shoulder' | 'shirtLength' | 'sleeve'
  | 'pantWaist' | 'pantLength' | 'thigh' | 'knee' | 'bottom' | 'neck' | 'hip';

export type Measurements = Record<MeasurementKey, number>;

export type GarmentType = 'shirt' | 'pant';

export interface GarmentStyle {
  garment: GarmentType;
  fit: string;
  detail: string;
  colorName: string;
  colorHex: string;
}

export interface PreviewRequest {
  measurements: Partial<Measurements>;
  garment: GarmentStyle;
  photoDataUrl?: string;
  sidePhotoDataUrl?: string;
}

export interface PreviewResponse {
  status: 'ready' | 'demo';
  message: string;
  bodyProfile: string;
  colorMatch: { name: string; score: number; reason: string };
}
