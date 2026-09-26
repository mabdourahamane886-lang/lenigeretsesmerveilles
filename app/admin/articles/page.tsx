import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'
import ArticleForm from './article-form'

type AdminArticleRow = {
  id: string | number
  title: string
  slug: string | null
  category: string | null
  published: boolean | null
  created_at: string
  niger_regions?: { name?: string | null } | { name?: string | null }[] | null
}

export default async function AdminArticles() {
  const supabase = await createClient()
  const [{ data: articles }, { data: categories }, { data: regions }] = supabase
    ? await Promise.all([
        supabase.from('niger_articles').select('id,title,slug,category,region_id,published,created_at,niger_regions(name)').order('created_at', { ascending: false }),
        supabase.from('niger_categories').select('name,slug').order('name'),
        supabase.from('niger_regions').select('id,name').order('name'),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  return <main className="section"><div className="container">
    <Link className="textlink" href="/admin">← Administration</Link>
    <div className="adminHero"><div><span className="kicker">Publications</span><h1>Créer et publier</h1><p className="muted">Choisis une catégorie, une région et une image depuis ta galerie. Chaque publication publiée possède son propre lien partageable.</p></div></div>
    <ArticleForm categories={categories || []} regions={regions || []} />
    <section className="adminList"><div className="sectionHead"><div><div className="kicker">Contenus</div><h2>Publications enregistrées</h2></div></div>
      {!articles?.length ? <p className="muted">Aucune publication pour le moment.</p> : <div className="adminRows">{articles.map((article: any) => {
        const region = Array.isArray(article.niger_regions) ? article.niger_regions[0]?.name : article.niger_regions?.name
        return <div className="adminRow" key={article.id}><div><b>{article.title}</b><span className="muted">{article.category} · {region || 'Toutes les régions'} · {article.published ? 'Publié' : 'Brouillon'}</span>{article.published && article.slug && <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><Link className="textlink" href={'/articles/' + article.slug}>Voir →</Link><Link className="textlink" href={'/articles/' + article.slug}>Lien à copier →</Link></div>}</div><span>{new Date(article.created_at).toLocaleDateString('fr-FR')}</span></div>
      })}</div>}
    </section>
  </div></main>
}
