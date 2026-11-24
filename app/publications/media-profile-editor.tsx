'use client'
import { useState } from 'react'

export default function MediaProfileEditor({ initialDescription = '' }: { initialDescription?: string }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [description, setDescription] = useState(initialDescription)
  async function saveDescription() {
    setBusy(true); setMessage('')
    const form = new FormData()
    form.set('kind', 'description'); form.set('description', description)
    try {
      const response = await fetch('/api/media-profile', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Enregistrement impossible')
      window.location.reload()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erreur') }
    finally { setBusy(false) }
  }
  async function upload(kind: 'avatar' | 'cover', file?: File) {
    if (!file) return
    setBusy(true); setMessage('')
    const form = new FormData()
    form.set('kind', kind); form.set('file', file)
    try {
      const response = await fetch('/api/media-profile', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Enregistrement impossible')
      window.location.reload()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erreur de transfert') }
    finally { setBusy(false) }
  }
  return <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',marginTop:12}}>
    {(['avatar','cover'] as const).map(kind => <label key={kind} style={{cursor:busy?'wait':'pointer',border:'1px solid #d1d5db',borderRadius:9,padding:'9px 12px',background:'#fff',color:'#111827',fontWeight:600}}>
      {kind === 'avatar' ? 'Modifier le logo' : 'Modifier la couverture'}
      <input disabled={busy} aria-label={kind === 'avatar' ? 'Choisir un logo' : 'Choisir une couverture'} type="file" accept="image/png,image/jpeg,image/webp" style={{display:'none'}} onChange={event => { void upload(kind,event.target.files?.[0]); event.target.value='' }} />
    </label>)}
    {busy && <span role="status">Enregistrement en cours…</span>}
    <div style={{width:'100%',display:'grid',gap:8,marginTop:8}}>
      <label htmlFor="media-description" style={{fontWeight:600}}>Description du média</label>
      <textarea id="media-description" value={description} onChange={event => setDescription(event.target.value)} maxLength={1000} rows={3} style={{width:'100%',border:'1px solid #d1d5db',borderRadius:9,padding:12}} />
      <button type="button" disabled={busy} onClick={() => void saveDescription()} style={{justifySelf:'start',padding:'10px 16px',borderRadius:9,background:'#155e45',color:'white',border:0,cursor:'pointer'}}>Enregistrer la description</button>
    </div>
    {message && <span role="alert">{message}</span>}
  </div>
}
