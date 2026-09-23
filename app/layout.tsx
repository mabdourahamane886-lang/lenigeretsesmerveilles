import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Le Niger et ses Merveilles 🇳🇪',
    template: '%s | Le Niger et ses Merveilles',
  },
  description:
    'Explorez les 8 régions du Niger, ses merveilles, ses cultures, sa gastronomie, ses événements et ses récits sur une plateforme numérique moderne.',
  keywords: [
    'Niger',
    'tourisme Niger',
    'culture Niger',
    'patrimoine Niger',
    'Agadez',
    'Niamey',
    'Zinder',
    'Tahoua',
    'Tillabéri',
    'Maradi',
    'Diffa',
    'Dosso',
    'Ténéré',
  ],
  applicationName: 'Le Niger et ses Merveilles',
  authors: [{ name: 'Le Niger et ses Merveilles' }],
  creator: 'Le Niger et ses Merveilles',
  publisher: 'Le Niger et ses Merveilles',
  category: 'culture',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Le Niger et ses Merveilles',
    title: 'Le Niger et ses Merveilles 🇳🇪',
    description:
      'Une plateforme pour explorer les territoires, les patrimoines, les cultures et les histoires du Niger.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Le Niger et ses Merveilles 🇳🇪',
    description: 'Découvrez le Niger autrement.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b5d3b',
  colorScheme: 'light',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
