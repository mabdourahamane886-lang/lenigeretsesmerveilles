'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createEvent } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button className="btn primary" disabled={pending} type="submit">{pending ? 'Publication…' : 'Enregistrer l’événement'}</button>
}

type State = { error?: string; slug?: string } | null

export default function EventForm({ regions }: { regions: { id: string; name: string }[] }) {
  const [state, action] = useActionState(async (_state: State, formData: FormData): Promise<State> => {
    try {
      const result = await createEvent(formData)
      return { slug: result?.slug || undefined }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Impossible de publier cet événement.' }
    }
  }, null)

  return <form className="adminForm" action={action}>
    <label>Nom<input required name="name" placeholder="Nom de l’événement"/></label>
    <div className="formRow">
      <label>Région<select name="region_id"><option value="">Choisir</option>{regions.map((r, index)=><option key={`${r.id || 'region'}-${index}`} value={r.id}>{r.name}</option>)}</select></label>
      <label>Ville<input name="city"/></label>
    </div>
    <div className="formRow">
      <label>Début<input required type="datetime-local" name="starts_at"/></label>
      <label>Fin<input type="datetime-local" name="ends_at"/></label>
    </div>
    <label>Description<textarea name="description" rows={4}/></label>
    <label>Programme<textarea name="program" rows={5}/></label>
    <label>Lieu<input name="location"/></label>
    <label>Photo du Niger<input name="image_url" placeholder="URL d'une photo authentique du Niger"/></label>
    <label className="check"><input type="checkbox" name="published"/> Publier immédiatement</label>
    {state?.error && <p className="formError">{state.error}</p>}
    {state?.slug && <p className="notice proNotice">Événement publié. <a href={'/evenements/' + state.slug} target="_blank" rel="noreferrer">Voir l’événement →</a></p>}
    <SubmitButton />
  </form>
}
