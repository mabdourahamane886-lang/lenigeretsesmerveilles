import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MerveillesPage(){
  const supabase = await createClient()
  const { data } = supabase ? await supabase.from('niger_wonders').select('id,name,short_description,description,cover_url,published').eq('published', true).order('featured', { ascending: false }).order('name') : { data: null }
  const wonders = data ?? []
  return <><Header/><main className="page"><div className="container"><div className="kicker">Patrimoine & découverte</div><h1>Les merveilles du Niger</h1><p className="lead">Explorez les lieux, paysages et patrimoines publiés depuis l’administration.</p>{wonders.length === 0 ? <div className="ai"><div><h2>Le catalogue arrive</h2><p className="muted">Les premières merveilles seront publiées depuis l’espace administrateur.</p></div></div> : <div className="grid">{wonders.map(w=><article className="card" key={w.id}><div className="cardimg" style={{backgroundImage:w.cover_url?`url(${w.cover_url})`:undefined}}/><div className="cardbody"><span className="tag">Merveille du Niger</span><h3>{w.name}</h3><p>{w.short_description || w.description || 'Découvrez ce patrimoine du Niger.'}</p></div></article>)}</div>}</div></main><Footer/></>
}
