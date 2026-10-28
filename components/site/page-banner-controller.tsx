'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Keep the main landing-page banner on home and hide the global site header on the dictionary page. */
export default function PageBannerController() {
  const pathname = usePathname()

  useEffect(() => {
    document.body.classList.toggle('home-page', pathname === '/')
    document.body.classList.toggle('dictionary-page', pathname === '/dictionnaire')

    return () => {
      document.body.classList.remove('home-page')
      document.body.classList.remove('dictionary-page')
    }
  }, [pathname])

  return (
    <style>{`
      body.dictionary-page .siteHeader {
        display: none !important;
      }
    `}</style>
  )
}
