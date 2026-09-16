import Link from 'next/link'

export default function AdminArticles() {
  return <main className="section"><div className="container"><Link className="textlink" href="/admin">← Administration</Link><div className="adminHero"><div><span className="kicker">Articles</span><h1>Créer un contenu</h1><p className="muted">Publie des articles sur la culture, le patrimoine, l'histoire et le tourisme nigérien.</p></div></div>
    <form className="adminForm"><label>Titre<input placeholder="Titre de l'article" /></label><label>Extrait<textarea rows={3} placeholder="Résumé" /></label><label>Contenu<textarea rows={10} placeholder="Rédige le contenu de l'article..." /></label><label>Image principale<input placeholder="URL d'une photo authentique du Niger" /></label><label>Catégorie<select defaultValue="culture"><option value="culture">Culture</option><option value="tourisme">Tourisme</option><option value="histoire">Histoire</option><option value="patrimoine">Patrimoine</option><option value="jeunesse">Jeunesse</option></select></label><button className="btn primary" type="button">Enregistrer l'article</button></form>
  </div></main>
}
