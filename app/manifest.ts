import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Le Niger et ses Merveilles',
    short_name: 'Niger Merveilles',
    description: 'Plateforme numérique dédiée aux régions, patrimoines, cultures, gastronomie et histoires du Niger.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8faf9',
    theme_color: '#0b5d3b',
    lang: 'fr',
    dir: 'ltr',
    categories: ['travel', 'culture', 'education'],
  }
}
