'use client'

import { useId, useRef, useState, useTransition } from 'react'
import { Bookmark, BookmarkCheck, Copy, Ellipsis, Pin, PinOff, Share2, X } from 'lucide-react'
import { copyToClipboard } from '../../components/site/share-button'
import { setPublicationPin } from './pin-action'
import styles from './publication-actions.module.css'

const favoritesKey = 'niger-favoris'
type Favorite = { url: string; title: string }

function readFavorites(): Favorite[] {
  const stored: unknown = JSON.parse(localStorage.getItem(favoritesKey) || '[]')
  if (!Array.isArray(stored)) throw new Error('Format de favoris inconnu')
  return stored
}

export default function PublicationActions({ id, title, pinned, canPin }: {
  id: string
  title: string
  pinned: boolean
  canPin: boolean
}) {
  const [pinPending, startPinChange] = useTransition()
  const dialog = useRef<HTMLDialogElement>(null)
  const dialogId = useId()
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState('')
  const [manualUrl, setManualUrl] = useState('')
  const path = '/publications/' + encodeURIComponent(id)

  function openActions() {
    setMessage('')
    setManualUrl('')
    try {
      setSaved(readFavorites().some(item => item?.url === path))
    } catch {
      setSaved(false)
    }
    dialog.current?.showModal()
  }

  function toggleFavorite() {
    try {
      const items = readFavorites()
      const exists = items.some(item => item?.url === path)
      const next = exists ? items.filter(item => item?.url !== path) : [...items, { url: path, title }]
      localStorage.setItem(favoritesKey, JSON.stringify(next))
      setSaved(!exists)
      setMessage(exists ? 'Publication retirée des favoris.' : 'Publication ajoutée aux favoris.')
    } catch {
      setMessage('Les favoris sont indisponibles sur cet appareil.')
    }
  }

  function togglePin() {
    startPinChange(async () => {
      try {
        const result = await setPublicationPin(id, !pinned)
        if (result.error) setMessage(result.error)
        else dialog.current?.close()
      } catch {
        setMessage('Vérifiez votre connexion et votre session administrateur.')
      }
    })
  }

  async function copyLink() {
    const url = new URL(path, window.location.origin).href
    try {
      await copyToClipboard(url)
      setManualUrl('')
      setMessage('Lien copié.')
    } catch {
      setManualUrl(url)
      setMessage('Sélectionnez le lien pour le copier.')
    }
  }

  async function share() {
    const url = new URL(path, window.location.origin).href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        dialog.current?.close()
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
    setManualUrl(url)
    setMessage('Vous pouvez copier ce lien pour partager la publication.')
  }

  return (
    <div className={styles.actions}>
      {pinned && <span className={styles.pinMark} aria-label="Publication épinglée" title="Publication épinglée"><Pin size={16} aria-hidden="true" /><span>Épinglée</span></span>}
      <button className={styles.trigger} type="button" onClick={openActions} aria-label={'Options de la publication : ' + title} aria-haspopup="dialog" aria-controls={dialogId}>
        <Ellipsis size={23} aria-hidden="true" />
      </button>
      <dialog id={dialogId} ref={dialog} className={styles.dialog} aria-labelledby={dialogId + '-title'}
        onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}>
        <div className={styles.sheet}>
          <div className={styles.heading}>
            <h2 id={dialogId + '-title'}>Options de la publication</h2>
            <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Fermer"><X size={19} /></button>
          </div>
          <div className={styles.title}>{title}</div>
          {canPin && (
            <button className={styles.option} type="button" onClick={togglePin} disabled={pinPending}>
              {pinned ? <PinOff size={18} /> : <Pin size={18} />}
              {pinPending ? 'Enregistrement…' : pinned ? 'Désépingler la publication' : 'Épingler la publication'}
            </button>
          )}
          <button className={styles.option} type="button" onClick={share}><Share2 size={18} /> Partager</button>
          <button className={styles.option} type="button" onClick={copyLink}><Copy size={18} /> Copier le lien</button>
          <button className={styles.option} type="button" onClick={toggleFavorite}>
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            {saved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          </button>
          <div role="status" className={styles.feedback}>{message}</div>
          {manualUrl && <input className={styles.url} readOnly value={manualUrl} aria-label="Lien de la publication" onFocus={e => e.currentTarget.select()} />}
        </div>
      </dialog>
    </div>
  )
}
