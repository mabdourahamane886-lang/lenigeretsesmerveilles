'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { Pencil, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './feed.module.css'

export default function MediaProfileEditor({ initialDescription }: { initialDescription: string }) {
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const titleId = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  function open() {
    form.current?.reset()
    setError('')
    setStatus('')
    dialog.current?.showModal()
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const data = new FormData(event.currentTarget)
    data.set('kind', 'profile')
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/media-profile', { method: 'POST', body: data })
      if (response.status === 413) throw new Error('Les images sont trop volumineuses. Réduisez leur taille et réessayez.')
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.error || 'Impossible d’enregistrer le profil.')
      router.refresh()
      dialog.current?.close()
      setStatus('Profil enregistré.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible d’enregistrer le profil.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className={styles.profileButton} aria-haspopup="dialog" onClick={open}>
        <Pencil size={16} aria-hidden="true" /> Éditer le profil
      </button>
      <span role="status" className="sr-only">{status}</span>
      <dialog ref={dialog} className={styles.profileDialog} aria-labelledby={titleId}
        onCancel={event => { if (busy) event.preventDefault() }}>
        <form ref={form} onSubmit={save}>
          <div className={styles.profileDialogHeading}>
            <h2 id={titleId}>Éditer le profil</h2>
            <button type="button" className={styles.profileButton} disabled={busy}
              onClick={() => dialog.current?.close()} aria-label="Fermer"><X size={18} /></button>
          </div>
          <fieldset disabled={busy}>
            <label>Photo de profil<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" /></label>
            <label>Photo de couverture<input name="cover" type="file" accept="image/jpeg,image/png,image/webp" /></label>
            <label>Description<textarea name="description" defaultValue={initialDescription} rows={4} maxLength={1000} /></label>
            <button type="submit" className={styles.profileButton}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
          </fieldset>
          {error && <p role="alert">{error}</p>}
        </form>
      </dialog>
    </>
  )
}
