'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Keeps the main landing-page banner while hiding page-level banners elsewhere. */
export default function PageBannerController() {
  const pathname = usePathname()

  useEffect(() => {
    document.body.classList.toggle('home-page', pathname === '/')
    return () => document.body.classList.remove('home-page')
  }, [pathname])

  return null
}
