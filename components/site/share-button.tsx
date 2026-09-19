'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // L'utilisateur peut fermer la fenêtre de partage sans erreur visible.
    }
  }

  return (
    <button type="button" className="proButton proButtonDark shareButton" onClick={share}>
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? 'Lien copié' : 'Partager / copier le lien'}
    </button>
  )
}
