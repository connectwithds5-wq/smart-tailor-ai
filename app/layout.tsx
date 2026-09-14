import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Smart Tailor AI', description: 'AI-powered tailoring and virtual fitting studio' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
