import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Le Niger et ses Merveilles 🇳🇪',
  description: 'Explorez les régions, paysages, cultures, patrimoines et merveilles du Niger.',
  metadataBase: new URL('https://lenigeretsesmerveilles.vercel.app')
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>
}
