'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppEnvironment } from './app-environment'
import { ArrowLeft } from 'lucide-react'

const sections: Record<string, { href: string; label: string }> = {
  articles: { href: '/articles', label: 'Retour aux articles' },
  assistant: { href: '/assistant', label: 'Retour à Niger IA' },
  culture: { href: '/culture', label: 'Retour à la culture' },
  evenements: { href: '/evenements', label: 'Retour à l’agenda' },
  gastronomie: { href: '/gastronomie#galerie', label: 'Retour à la gastronomie' },
  media: { href: '/media', label: 'Retour à la photothèque' },
  merveilles: { href: '/merveilles', label: 'Retour aux merveilles' },
  publications: { href: '/publications', label: 'Retour aux publications' },
  regions: { href: '/regions', label: 'Retour aux régions' },
}

export default function BackButton() {
  const [section, child] = usePathname().split('/').filter(Boolean)

  const { appHome } = useAppEnvironment()
  if (section === 'application' || !section || section === 'admin' || section === 'admin-login') return null

  const parent = child ? sections[section] : undefined
  const { href, label } = parent ?? { href: appHome, label: appHome === '/application' ? 'Retour à l’application' : 'Retour à l’accueil' }

  return (
    <div className="container siteBackButtonWrap">
      <Link className="siteBackButton" href={href}>
        <ArrowLeft size={16} aria-hidden="true" /> {label}
      </Link>
    </div>
  )
}
