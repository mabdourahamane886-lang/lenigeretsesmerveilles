'use client'

import Link from 'next/link'
import { Globe, ImagePlus, Settings2, X } from 'lucide-react'
import styles from './composer.module.css'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPublicPost } from '../actions'
import { uploadPhoto } from './photo-upload'

export default function SimpleComposer() {
  const router = useRouter()
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const pending = useRef(false)
  const requestId = useRef('')
  const uploaded = useRef<{ file: File; path: string } | null>(null)

  useEffect(() => {
    if (!photo) { setPreview(''); return }
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const form = event.currentTarget
    const description = String(new FormData(form).get('content') || '').trim()
    if (!description && !photo) { setError('Ajoute une description ou une photo.'); return }
    pending.current = true
    setError(''); setLink(''); setCopied(false)
    try {
      requestId.current ||= crypto.randomUUID()
      setProgress(photo ? 'Envoi de la photo…' : 'Publication…')
      if (photo && uploaded.current?.file !== photo) uploaded.current = {file:photo, path:await uploadPhoto(photo)}
      setProgress('Publication…')
      const result = await createPublicPost(requestId.current, description, photo ? uploaded.current!.path : null)
      if ('error' in result) throw new Error(result.error)
      setLink('/publications/'+result.id)
      requestId.current = ''; uploaded.current = null
      form.reset(); setPhoto(null); router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enregistrement impossible. Réessaie.')
    } finally { setProgress(''); pending.current = false }
  }

  return <form onSubmit={submit} className={styles.composer}>
    <fieldset className={styles.fields} disabled={!!progress}>
      <div className={styles.identity}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Local SVG brand mark. */}
        <img src="/images/niger-merveilles-mark.svg" alt="" width={48} height={48} />
        <div>
          <strong>Le Niger et ses Merveilles</strong>
          <span className={styles.audience}><Globe size={14} aria-hidden="true" /> Public</span>
        </div>
      </div>
      <label className={styles.description}>
        <span>Description</span>
        <textarea rows={6} name="content" placeholder="Quelle histoire du Niger souhaitez-vous partager ?" />
      </label>
      {preview && <div className={styles.preview}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Preview uses a browser object URL. */}
        <img alt="Photo sélectionnée" src={preview} />
        <button type="button" className={styles.remove} onClick={() => {
          setPhoto(null)
          if (fileInput.current) fileInput.current.value = ''
        }}><X size={16} aria-hidden="true" /> Retirer la photo</button>
      </div>}
      <div className={styles.options}>
        <button type="button" className={styles.option} onClick={() => fileInput.current?.click()}>
          <ImagePlus size={22} aria-hidden="true" />
          <span><strong>{photo ? 'Remplacer la photo' : 'Ajouter une photo'}</strong>{photo && <small>{photo.name}</small>}</span>
        </button>
        <input ref={fileInput} type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={event => setPhoto(event.target.files?.[0] || null)} />
        <Link href="/admin/publications?mode=avance" className={styles.option}>
          <Settings2 size={22} aria-hidden="true" />
          <span><strong>Vidéo, musique et programmation</strong><small>Ouvrir les options avancées</small></span>
        </Link>
      </div>
      <button type="submit" className={styles.publish}>{progress || 'Publier'}</button>
    </fieldset>
    {error && <p role="alert" className="editorFeedback">{error}</p>}
    {link && <div role="status" className="editorFeedback"><strong>Ta publication est en ligne.</strong>
      <div className="editorActions"><Link href={link}>Ouvrir la publication</Link><Link href="/publications">Voir le fil</Link>
        <button type="button" className="btn" onClick={async () => { try {await navigator.clipboard.writeText(new URL(link,window.location.origin).href); setCopied(true)} catch {setError('Ouvre la publication pour copier son adresse.')} }}>{copied ? 'Lien copié' : 'Copier le lien'}</button></div></div>}
  </form>
}
