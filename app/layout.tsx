import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My MBG',
  description: 'Sistem informasi audit dan monitoring Program Makan Bergizi Gratis.',
  manifest: '/manifest.webmanifest'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='id'>
      <body>{children}</body>
    </html>
  );
}
