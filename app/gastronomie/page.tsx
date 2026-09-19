import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function GastronomiePage() {
  const supabase = await createClient()
  const { data: items } = supabase ? await supabase.from('niger_gastronomy').select('id,name,description,ingredients,preparation,image_url,history').eq('published',true).order('name') : { data: [] }

  return <><Header/><main className="page"><div className="container">
    <div className="kicker">Saveurs du Niger</div><h1>Gastronomie nigérienne</h1><p className="lead">Plats, produits, recettes et histoires culinaires publiés sur la plateforme.</p>
    {!items?.length ? <div className="emptyState"><span className="emptyIcon">◆</span><div><h2>La rubrique se construit</h2><p className="muted">Les recettes et spécialités validées par l’administration apparaîtront ici.</p></div></div> :
      <div className="grid">{items.map((item)=><article className="card" key={item.id}><div className="cardimg" style={item.image_url?{backgroundImage:`url(${item.image_url})`}:undefined}/><div className="cardbody"><span className="tag">Gastronomie</span><h3>{item.name}</h3><p>{item.description}</p>{item.ingredients && <div className="miniBlock"><b>Ingrédients</b><span>{item.ingredients}</span></div>}{item.preparation && <div className="miniBlock"><b>Préparation</b><span>{item.preparation}</span></div>}</div></article>)}</div>}
  </div></main><Footer/></>
}
