import Link from 'next/link'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: articles } = supabase ? await supabase.from('niger_articles').select('id,title,slug,category,excerpt,cover_url,author_name,published_at').eq('published',true).order('published_at',{ascending:false}) : { data: [] }

  return <><Header/><main className="page"><div className="container">
    <div className="kicker">Édition</div><h1>Articles sur le Niger</h1><p className="lead">Histoires, patrimoine, culture, tourisme et regards documentés sur le Niger.</p>
    {!articles?.length ? <div className="emptyState"><span className="emptyIcon">✦</span><div><h2>Les prochains articles arrivent</h2><p className="muted">Les publications validées depuis l’administration apparaîtront ici.</p></div></div> :
      <div className="grid">{articles.map((article)=><article className="card" key={article.id}>
        <div className="cardimg" style={article.cover_url?{backgroundImage:`url(${article.cover_url})`}:undefined}/>
        <div className="cardbody"><span className="tag">{article.category}</span><h3>{article.title}</h3><p>{article.excerpt || 'Lire cet article consacré au Niger.'}</p><div className="articleMeta">{article.author_name}{article.published_at ? ' · ' + new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(article.published_at)) : ''}</div><Link className="cardLink" href={`/articles/${article.slug}`}>Lire l’article <span>→</span></Link></div>
      </article>)}</div>}
  </div></main><Footer/></>
}
