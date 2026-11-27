import type { Metadata, Viewport } from 'next'
import './globals.css'
import './brand-refresh.css'
import './refonte-2026.css'
import Header from '../components/site/header'
import AppEnvironment from '../components/site/app-environment'
import AppThemeSync from '../components/site/app-theme-sync'
import Footer from '../components/site/footer'
import PageBannerController from '../components/site/page-banner-controller'

export const metadata: Metadata = {
  metadataBase: new URL('https://lenigeretsesmerveilles-ngr.vercel.app'),
  title: {
    default: 'Le Niger et ses Merveilles',
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
  appleWebApp: { capable: true, title: 'Niger Merveilles', statusBarStyle: 'default' },
  icons: { apple: [{ url: '/app-icons/apple-touch.png', sizes: '180x180', type: 'image/png' }] },
  authors: [{ name: 'Le Niger et ses Merveilles' }],
  creator: 'Le Niger et ses Merveilles',
  publisher: 'Le Niger et ses Merveilles',
  category: 'culture',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Le Niger et ses Merveilles',
    title: 'Le Niger et ses Merveilles',
    description:
      'Une plateforme pour explorer les territoires, les patrimoines, les cultures et les histoires du Niger.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Le Niger et ses Merveilles',
    description: 'Découvrez le Niger autrement.',
    images: ['/opengraph-image'],
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
  themeColor: '#ffffff',
  colorScheme: 'light',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <AppEnvironment siteFooter={<Footer />}>
          <AppThemeSync />
          <PageBannerController />
          <Header />
          <div className="siteGlobalContent">{children}</div>
        </AppEnvironment>
      </body>
    </html>
  )
}
