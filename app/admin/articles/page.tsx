import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import ArticleForm from './article-form'

export default async function AdminArticles() {
  const supabase = await createClient()
  const { data: articles } = supabase
    ? await supabase.from('niger_articles').select('id,title,category,published,created_at').order('created_at', { ascending: false })
    : { data: [] }

  return <main className="section"><div className="container">
    <Link className="textlink" href="/admin">← Administration</Link>
    <div className="adminHero"><div><span className="kicker">Articles</span><h1>Gestion des articles</h1><p className="muted">Crée et publie des contenus sur la culture, le patrimoine, l’histoire et le tourisme nigérien.</p></div></div>
    <ArticleForm />
    <section className="adminList"><div className="sectionHead"><div><div className="kicker">Contenus</div><h2>Articles enregistrés</h2></div></div>
      {!articles?.length ? <p className="muted">Aucun article pour le moment.</p> : <div className="adminRows">{articles.map(article => <div className="adminRow" key={article.id}><div><b>{article.title}</b><span className="muted">{article.category} · {article.published ? 'Publié' : 'Brouillon'}</span></div><span>{new Date(article.created_at).toLocaleDateString('fr-FR')}</span></div>)}</div>}
    </section>
  </div></main>
}
