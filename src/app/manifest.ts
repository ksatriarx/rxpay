import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RX PAY - Platform PPOB Digital',
    short_name: 'RX PAY',
    description: 'Beli pulsa, paket data, token listrik, dan bayar tagihan.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563EB',
    icons: [
      {
        src: 'https://cdn-icons-png.flaticon.com/192/2436/2436874.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'https://cdn-icons-png.flaticon.com/512/2436/2436874.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
  }
}
