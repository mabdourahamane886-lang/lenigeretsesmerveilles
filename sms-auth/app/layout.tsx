import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'SMS AUTH — Authentification WhatsApp sécurisée',
  description: 'SMS AUTH : plateforme professionnelle de validation de numéros, codes OTP WhatsApp et API de vérification pour les applications.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>
}
