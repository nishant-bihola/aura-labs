import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PayTrack — Biweekly Budget',
    short_name: 'PayTrack',
    description: 'Advanced biweekly paycheck budget tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
