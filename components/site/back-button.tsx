'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const pathname = usePathname()

  if (pathname === '/') return null

  return (
    <div className="siteBackButtonWrap">
      <Link className="siteBackButton" href="/" aria-label="Retour au site, page d’accueil">
        <ArrowLeft size={17} aria-hidden="true" /> Retour au site
      </Link>
    </div>
  )
}
