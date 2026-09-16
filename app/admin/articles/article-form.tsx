'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createArticle } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button className="btn primary" disabled={pending} type="submit">{pending ? 'Enregistrement…' : 'Enregistrer l’article'}</button>
}

export default function ArticleForm() {
  const [error, action] = useFormState(async (_state: string | null, formData: FormData) => {
    try { await createArticle(formData); return null } catch (e) { return e instanceof Error ? e.message : 'Une erreur est survenue.' }
  }, null)

  return <form className="adminForm" action={action}>
    <label>Titre<input required name="title" placeholder="Titre de l’article" /></label>
    <label>Extrait<textarea name="excerpt" rows={3} placeholder="Résumé" /></label>
    <label>Contenu<textarea required name="content" rows={10} placeholder="Rédige le contenu de l’article…" /></label>
    <label>Photo du Niger<input name="cover_url" placeholder="URL d’une photo authentique du Niger" /></label>
    <label>Auteur<input name="author_name" defaultValue="Abdourahamane Mohamed" /></label>
    <label>Catégorie<select name="category" defaultValue="culture"><option value="culture">Culture</option><option value="tourisme">Tourisme</option><option value="histoire">Histoire</option><option value="patrimoine">Patrimoine</option><option value="jeunesse">Jeunesse</option></select></label>
    <label className="check"><input type="checkbox" name="published" /> Publier immédiatement</label>
    {error && <p className="formError">{error}</p>}
    <SubmitButton />
  </form>
}
