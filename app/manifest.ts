import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sales CRM',
    short_name: 'SalesCRM',
    description: 'Enterprise Sales CRM Platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f7fa',
    theme_color: '#2563eb',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
