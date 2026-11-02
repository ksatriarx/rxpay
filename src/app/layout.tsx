import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import PwaRegister from '@/components/pwa-register';
import './globals.css';

export const metadata: Metadata = {
  title: 'RX PAY — Platform PPOB Digital',
  description: 'Beli pulsa, paket data, token listrik, dan bayar tagihan.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RX PAY',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <PwaRegister />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
