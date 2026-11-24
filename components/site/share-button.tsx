'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'

export async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const field = document.createElement('textarea')
  field.value = value
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()
  const copied = document.execCommand('copy')
  field.remove()
  if (!copied) throw new Error('Copie indisponible')
}

export default function ShareButton({ title, href }: { title: string; href?: string }) {
  const [copied, setCopied] = useState(false)

  function shareUrl() {
    return href ? new URL(href, window.location.origin).href : window.location.href
  }

  async function copyLink() {
    try {
      await copyToClipboard(shareUrl())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  async function share() {
    const url = shareUrl()
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // Si le partage est annulé ou indisponible, le lien reste copiable.
      }
    }
    await copyLink()
  }

  return (
    <div className="articleShareActions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <button type="button" className="proButton proButtonDark shareButton" onClick={share}>
        <Share2 size={15} />
        Partager
      </button>
      <button type="button" className="proButton proButtonDark shareButton" onClick={copyLink}>
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? 'Lien copié' : 'Copier le lien direct'}
      </button>
    </div>
  )
}
