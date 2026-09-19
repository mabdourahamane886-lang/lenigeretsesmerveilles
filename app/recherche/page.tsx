import Link from 'next/link'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function RecherchePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const query = q.trim().slice(0, 80)
  const supabase = await createClient()

  let wonders: any[] = []
  let events: any[] = []
  let articles: any[] = []
  let cultures: any[] = []
  let gastronomy: any[] = []

  if (supabase && query) {
    const safe = query.replace(/[%_]/g, '')
    const like = '%' + safe + '%'
    const [w, e, a, c, g] = await Promise.all([
      supabase.from('niger_wonders').select('id,name,slug,short_description,description').eq('published',true).or('name.ilike.' + like + ',short_description.ilike.' + like + ',description.ilike.' + like).limit(8),
      supabase.from('niger_events').select('id,name,slug,city,description').eq('published',true).or('name.ilike.' + like + ',city.ilike.' + like + ',description.ilike.' + like).limit(8),
      supabase.from('niger_articles').select('id,title,slug,excerpt').eq('published',true).or('title.ilike.' + like + ',excerpt.ilike.' + like + ',content.ilike.' + like).limit(8),
      supabase.from('niger_cultures').select('id,title,slug,history,traditions').eq('published',true).or('title.ilike.' + like + ',history.ilike.' + like + ',traditions.ilike.' + like).limit(8),
      supabase.from('niger_gastronomy').select('id,name,slug,description').eq('published',true).or('name.ilike.' + like + ',description.ilike.' + like + ',ingredients.ilike.' + like).limit(8),
    ])
    wonders = w.data || []
    events = e.data || []
    articles = a.data || []
    cultures = c.data || []
    gastronomy = g.data || []
  }

  const total = wonders.length + events.length + articles.length + cultures.length + gastronomy.length

  return <><Header/><main className="page"><div className="container">
    <div className="kicker">Recherche</div><h1>Explorer le Niger</h1>
    <form className="searchForm"><input name="q" defaultValue={query} placeholder="Rechercher une région, un événement, un article…" aria-label="Recherche"/><button className="btn primary">Rechercher</button></form>
    {!query ? <div className="emptyState"><span className="emptyIcon">⌕</span><div><h2>Que cherchez-vous ?</h2><p className="muted">Recherchez une merveille, un événement, un article, une culture ou une spécialité.</p></div></div> :
      total === 0 ? <div className="emptyState"><span className="emptyIcon">—</span><div><h2>Aucun résultat</h2><p className="muted">Essayez un autre mot-clé ou une autre orthographe.</p></div></div> :
      <div className="searchResults">
        {wonders.length>0 && <section><div className="kicker">Merveilles</div>{wonders.map(x=><Link className="searchRow" key={x.id} href="/merveilles"><b>{x.name}</b><span>{x.short_description || x.description}</span></Link>)}</section>}
        {events.length>0 && <section><div className="kicker">Événements</div>{events.map(x=><Link className="searchRow" key={x.id} href={'/evenements/' + x.slug}><b>{x.name}</b><span>{x.city || 'Niger'} · {x.description}</span></Link>)}</section>}
        {articles.length>0 && <section><div className="kicker">Articles</div>{articles.map(x=><Link className="searchRow" key={x.id} href={'/articles/' + x.slug}><b>{x.title}</b><span>{x.excerpt}</span></Link>)}</section>}
        {cultures.length>0 && <section><div className="kicker">Culture</div>{cultures.map(x=><Link className="searchRow" key={x.id} href="/culture"><b>{x.title}</b><span>{x.history || x.traditions}</span></Link>)}</section>}
        {gastronomy.length>0 && <section><div className="kicker">Gastronomie</div>{gastronomy.map(x=><Link className="searchRow" key={x.id} href="/gastronomie"><b>{x.name}</b><span>{x.description}</span></Link>)}</section>}
      </div>}
  </div></main><Footer/></>
}
