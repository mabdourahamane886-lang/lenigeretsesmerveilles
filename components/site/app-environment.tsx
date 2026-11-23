'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

type InstallPrompt = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const AppContext = createContext({
  appHome: '/',
  installed: false,
  requestInstall: async (): Promise<boolean> => false,
})

export const useAppEnvironment = () => useContext(AppContext)

export default function AppEnvironment({ children }: { children: ReactNode }) {
  const path = usePathname()
  const [appTab, setAppTab] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [promptEvent, setPromptEvent] = useState<InstallPrompt | null>(null)

  useEffect(() => {
    const mode = window.matchMedia('(display-mode: standalone)')
    const updateMode = () => setStandalone(mode.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)
    const offer = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPrompt)
    }
    const complete = () => {
      setInstalled(true)
      setPromptEvent(null)
    }
    updateMode()
    mode.addEventListener('change', updateMode)
    window.addEventListener('beforeinstallprompt', offer)
    window.addEventListener('appinstalled', complete)
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // The online application also works with service workers disabled.
      })
    }
    return () => {
      mode.removeEventListener('change', updateMode)
      window.removeEventListener('beforeinstallprompt', offer)
      window.removeEventListener('appinstalled', complete)
    }
  }, [])

  useEffect(() => {
    try {
      if (path === '/application') sessionStorage.setItem('niger-app-navigation', '1')
      if (path === '/') sessionStorage.removeItem('niger-app-navigation')
      setAppTab(sessionStorage.getItem('niger-app-navigation') === '1')
    } catch {
      if (path === '/' || path === '/application') setAppTab(path === '/application')
    }
  }, [path])

  async function requestInstall() {
    if (!promptEvent) return false
    setPromptEvent(null)
    try {
      await promptEvent.prompt()
      await promptEvent.userChoice
      return true
    } catch {
      return false
    }
  }

  return (
    <AppContext.Provider value={{ appHome: standalone || appTab ? '/application' : '/', installed: standalone || installed, requestInstall }}>
      {children}
    </AppContext.Provider>
  )
}
