import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Le Niger et ses Merveilles',
    short_name: 'Niger Merveilles',
    description: 'Les régions, les cultures, les langues et les histoires du Niger.',
    start_url: '/application',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/app-icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/app-icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/app-icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    lang: 'fr',
    dir: 'ltr',
    categories: ['travel', 'education'],
  }
}
