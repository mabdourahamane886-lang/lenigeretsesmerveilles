'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()

  if (pathname === '/') return null

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push('/')
  }

  return (
    <div className="siteBackButtonWrap">
      <button className="siteBackButton" type="button" onClick={goBack} aria-label="Revenir à la page précédente">
        <ArrowLeft size={17} aria-hidden="true" /> Retour
      </button>
    </div>
  )
}
