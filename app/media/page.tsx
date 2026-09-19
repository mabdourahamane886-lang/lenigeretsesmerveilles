import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const supabase = await createClient()
  const { data: media } = supabase ? await supabase.from('niger_media').select('id,title,description,url,credit').eq('published',true).order('created_at',{ascending:false}) : { data: [] }

  return <><Header/><main className="page"><div className="container">
    <div className="kicker">Photothèque</div><h1>Images du Niger</h1><p className="lead">Une photothèque organisée avec les sources et crédits des médias utilisés sur la plateforme.</p>
    {!media?.length ? <div className="emptyState"><span className="emptyIcon">◉</span><div><h2>La photothèque se remplit</h2><p className="muted">Les médias validés depuis l’administration apparaîtront ici.</p></div></div> :
      <div className="mediaGrid">{media.map((item)=><figure className="mediaCard" key={item.id}><img src={item.url} alt={item.title} loading="lazy"/><figcaption><strong>{item.title}</strong><span>{item.credit || 'Source non renseignée'}</span><small>{item.description}</small></figcaption></figure>)}</div>}
  </div></main><Footer/></>
}
