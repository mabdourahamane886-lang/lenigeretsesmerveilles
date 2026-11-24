'use client'

import { useEffect } from 'react'

const KEY = 'niger-app-preferences-v2'

export default function AppThemeSync() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function apply() {
      let theme = 'system'
      try {
        const data = JSON.parse(localStorage.getItem(KEY) || '{}')
        theme = typeof data.theme === 'string' ? data.theme : 'system'
      } catch { /* préférence absente */ }
      const dark = theme === 'dark' || (theme !== 'light' && media.matches)
      document.documentElement.dataset.nigerTheme = dark ? 'dark' : 'light'
    }
    apply()
    window.addEventListener('storage', apply)
    media.addEventListener('change', apply)
    return () => {
      window.removeEventListener('storage', apply)
      media.removeEventListener('change', apply)
    }
  }, [])
  return null
}
