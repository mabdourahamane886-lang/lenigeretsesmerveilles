'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { createClient } from '../../lib/supabase/client'
import styles from './application.module.css'

export default function AppLaunch({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    let timer: number | undefined
    const reveal = () => new Promise<void>(resolve => {
      timer = window.setTimeout(resolve, 650)
    })

    async function openApp() {
      const client = createClient()
      const [result] = await Promise.all([
        client?.auth.getSession().catch(() => null),
        reveal(),
      ])
      if (!active) return

      if (result?.data.session) setReady(true)
      else router.replace('/application/compte?entry=app')
    }

    void openApp()
    return () => {
      active = false
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [router])

  if (ready) return children

  return (
    <div className={styles.launchScreen}>
      <Image src="/images/niger-merveilles-mark.svg" width={144} height={128} priority alt="Le Niger et ses Merveilles" />
    </div>
  )
}
