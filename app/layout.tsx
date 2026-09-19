import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://lenigeretsesmerveilles.vercel.app'),
  title: { default: 'Le Niger et ses Merveilles 🇳🇪', template: '%s | Le Niger et ses Merveilles' },
  description: 'Explorez les régions, paysages, cultures, patrimoines, histoires et merveilles du Niger dans une plateforme numérique moderne.',
  keywords: ['Niger', 'tourisme Niger', 'culture du Niger', 'patrimoine Niger', 'Agadez', 'Zinder', 'Niamey', 'Ténéré', 'Fleuve Niger'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://lenigeretsesmerveilles.vercel.app',
    siteName: 'Le Niger et ses Merveilles',
    title: 'Le Niger et ses Merveilles 🇳🇪',
    description: 'Découvrez les régions, cultures, patrimoines et paysages du Niger.',
  },
  twitter: { card: 'summary_large_image', title: 'Le Niger et ses Merveilles 🇳🇪', description: 'Une plateforme numérique pour explorer et valoriser le Niger.' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b5d3b' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>
}
