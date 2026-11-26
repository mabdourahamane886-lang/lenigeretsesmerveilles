'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { createClient } from '../../lib/supabase/client'
import styles from './application.module.css'

let opened = false

export default function AppLaunch({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    const client = createClient()
    async function openApp() {
      try {
        if (!client) throw new Error('Connexion indisponible')
        const { data, error } = await client.auth.getUser()
        if (!active) return
        if (data.user && !error) {
          opened = true
          setReady(true)
        } else if (!error || error.name === 'AuthSessionMissingError' || error.status === 401 || error.code === 'refresh_token_not_found' || error.code === 'session_not_found') {
          router.replace('/application/compte?entry=app')
        } else setError(true)
      } catch { if(active) setError(true) }
    }
    void openApp()
    const subscription = client?.auth.onAuthStateChange((event) => {
      if(event === 'SIGNED_OUT' && active) { setReady(false); router.replace('/application/compte?entry=app') }
    }).data.subscription
    return () => { active = false; subscription?.unsubscribe() }
  }, [router, attempt])
  if (ready) return children
  return <div className={styles.launchScreen} role="status">
    {!opened && <Image src="/images/niger-merveilles-mark.svg" width={144} height={128} priority alt="Le Niger et ses Merveilles" />}
    {error && <div><p>Connexion momentanément indisponible.</p><button type="button" onClick={()=>{setError(false);setAttempt(n=>n+1)}}>Réessayer</button></div>}
  </div>
}
