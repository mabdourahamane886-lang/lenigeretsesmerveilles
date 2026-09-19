import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

const sections = [
  ['👥','Peuples & traditions','Histoires, langues, vêtements, pratiques et savoir-faire.'],
  ['🍲','Gastronomie','Plats, produits locaux et traditions culinaires.'],
  ['🎭','Événements','Festivals, rencontres et rendez-vous culturels.'],
  ['🧵','Artisanat','Créations, métiers d’art et savoir-faire transmis.'],
]

export default async function CulturePage() {
  const supabase = await createClient()
  const { data: cultures } = supabase ? await supabase.from('niger_cultures').select('id,title,slug,language,traditions,history,cover_url').eq('published',true).order('title') : { data: [] }

  return <><Header/><main className="page"><div className="container">
    <div className="kicker">Identité & patrimoine</div><h1>Culture du Niger</h1>
    <p className="lead">Une porte d’entrée vers la diversité culturelle, les traditions et les savoir-faire du Niger.</p>
    <div className="detailGrid">{sections.map(([icon,title,text])=><section className="detailCard" key={title}><span>{icon}</span><h2>{title}</h2><p>{text}</p></section>)}</div>
    <section className="sectionInner"><div className="sectionHead"><div><div className="kicker">Contenus publiés</div><h2>Découvrir les cultures</h2></div></div>
      {!cultures?.length ? <div className="emptyState"><span className="emptyIcon">✦</span><div><h2>La mémoire culturelle se construit</h2><p className="muted">Les fiches culturelles validées par l’administration apparaîtront ici.</p></div></div> :
      <div className="grid">{cultures.map((culture)=><article className="card" key={culture.id}><div className="cardimg" style={culture.cover_url?{backgroundImage:`url(${culture.cover_url})`}:undefined}/><div className="cardbody"><span className="tag">{culture.language || 'Culture'}</span><h3>{culture.title}</h3><p>{culture.history || culture.traditions || 'Traditions et patrimoine culturel du Niger.'}</p></div></article>)}</div>}
    </section>
    <div className="notice"><strong>Construisons cette mémoire ensemble.</strong><p>Les contenus culturels peuvent être proposés par des contributeurs puis vérifiés avant publication.</p></div>
  </div></main><Footer/></>
}
