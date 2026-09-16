import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import { createClient } from '../../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function RegionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  if (!supabase) notFound()
  const { data: region } = await supabase.from('niger_regions').select('id,name,slug,description,cover_url').eq('slug', slug).maybeSingle()
  if (!region) notFound()
  const [{ data: wonders }, { data: cultures }, { data: gastronomy }, { data: events }] = await Promise.all([
    supabase.from('niger_wonders').select('id,name,short_description,cover_url').eq('region_id', region.id).eq('published', true).order('name'),
    supabase.from('niger_cultures').select('id,title,cover_url,history').eq('region_id', region.id).eq('published', true).order('title'),
    supabase.from('niger_gastronomy').select('id,name,image_url,description').eq('region_id', region.id).eq('published', true).order('name'),
    supabase.from('niger_events').select('id,name,city,starts_at,image_url,description').eq('region_id', region.id).eq('published', true).order('starts_at')
  ])
  return <><Header/><main className="page"><div className="container"><Link className="back" href="/regions">← Toutes les régions</Link><div className="kicker">Région du Niger</div><h1>{region.name}</h1><p className="lead">{region.description || 'Découvrez le patrimoine, les paysages et la culture de cette région du Niger.'}</p>{region.cover_url && <div className="featureBox" style={{backgroundImage:`url(${region.cover_url})`}}/>}<div className="detailGrid"><section className="detailCard"><span>🏛️</span><h2>Patrimoine</h2><p>{wonders?.length || 0} merveille(s) publiée(s).</p></section><section className="detailCard"><span>👥</span><h2>Culture</h2><p>{cultures?.length || 0} contenu(s) culturel(s) publié(s).</p></section><section className="detailCard"><span>🍲</span><h2>Gastronomie</h2><p>{gastronomy?.length || 0} spécialité(s) publiée(s).</p></section></div><section className="section"><h2>À découvrir</h2><div className="grid">{wonders?.map(w=><article className="card" key={w.id}><div className="cardimg" style={{backgroundImage:w.cover_url?`url(${w.cover_url})`:undefined}}/><div className="cardbody"><span className="tag">Merveille</span><h3>{w.name}</h3><p>{w.short_description || 'Découvrez ce lieu du Niger.'}</p></div></article>)}</div></section><section className="section"><h2>Culture</h2><div className="grid">{cultures?.map(c=><article className="card" key={c.id}><div className="cardimg" style={{backgroundImage:c.cover_url?`url(${c.cover_url})`:undefined}}/><div className="cardbody"><span className="tag">Culture</span><h3>{c.title}</h3><p>{c.history || 'Traditions et patrimoine culturel de la région.'}</p></div></article>)}</div></section><div className="notice"><strong>Contenu participatif</strong><p>Cette fiche peut être enrichie avec des photos, lieux, événements et témoignages validés.</p><Link className="btn primary" href="/contribution">Proposer une découverte</Link></div></div></main><Footer/></>
}
