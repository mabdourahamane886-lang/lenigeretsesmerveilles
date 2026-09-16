'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createAdvertisement } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button className="btn primary" disabled={pending} type="submit">{pending ? 'Enregistrement…' : 'Enregistrer la campagne'}</button>
}

export default function AdForm() {
  const [error, action] = useActionState(async (_state: string | null, formData: FormData) => {
    try { await createAdvertisement(formData); return null } catch (e) { return e instanceof Error ? e.message : 'Une erreur est survenue.' }
  }, null)

  return <form className="adminForm" action={action}>
    <label>Nom de la campagne<input required name="name" placeholder="Ex. Promotion tourisme Niger" /></label>
    <label>Titre<input required name="title" placeholder="Découvrez le Niger autrement 🇳🇪" /></label>
    <label>Texte<textarea name="body" rows={4} placeholder="Message publicitaire" /></label>
    <label>Image du Niger<input name="media_url" placeholder="URL d’une photo authentique du Niger" /></label>
    <label>Bouton<input name="cta_label" placeholder="Découvrir" /></label>
    <label>Lien de destination<input name="destination_url" placeholder="https://..." /></label>
    <div className="formRow"><label>Date de début<input type="datetime-local" name="starts_at" /></label><label>Date de fin<input type="datetime-local" name="ends_at" /></label></div>
    <label>Position<select name="placement" defaultValue="home"><option value="home">Accueil</option><option value="article">Articles</option><option value="wonder">Merveilles</option><option value="regional">Pages régions</option></select></label>
    <label className="check"><input type="checkbox" name="active" /> Activer la campagne</label>
    {error && <p className="formError">{error}</p>}
    <SubmitButton />
  </form>
}
