'use client'

import Link from 'next/link'
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

  return <form onSubmit={submit} className="adminForm">
    <fieldset className="editorFields" disabled={!!progress}>
      <label>Description<textarea rows={5} name="content" placeholder="Que veux-tu partager ?" /></label>
      <label>Ajouter une photo<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={event => setPhoto(event.target.files?.[0] || null)}/></label>
      {preview && <div><img alt="Photo sélectionnée" src={preview} style={{display:'block', maxHeight:280,maxWidth:'100%',objectFit:'contain'}}/>
        <button className="btn" type="button" onClick={() => { setPhoto(null); if(fileInput.current) fileInput.current.value='' }}>Retirer la photo</button></div>}
      <button type="submit" className="btn primary">{progress || 'Publier'}</button>
    </fieldset>
    {error && <p role="alert" className="editorFeedback">{error}</p>}
    {link && <div role="status" className="editorFeedback"><strong>Ta publication est en ligne.</strong>
      <div className="editorActions"><Link href={link}>Ouvrir la publication</Link><Link href="/publications">Voir le fil</Link>
        <button type="button" className="btn" onClick={async () => { try {await navigator.clipboard.writeText(new URL(link,window.location.origin).href); setCopied(true)} catch {setError('Ouvre la publication pour copier son adresse.')} }}>{copied ? 'Lien copié' : 'Copier le lien'}</button></div></div>}
  </form>
}
