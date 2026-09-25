import Link from 'next/link'
import { ArrowRight, BookOpenText, Drum, HandHeart, Languages } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

const sections = [
  { icon: Languages, title: 'Langues & peuples', text: 'Une diversité linguistique et humaine à documenter avec précision.' },
  { icon: HandHeart, title: 'Traditions & savoir-faire', text: 'Des pratiques transmises, adaptées et préservées au fil des générations.' },
  { icon: Drum, title: 'Musique & célébrations', text: 'Rythmes, cérémonies, festivals et formes d’expression culturelle.' },
  { icon: BookOpenText, title: 'Histoire & mémoire', text: 'Des récits qui permettent de mieux comprendre les territoires.' },
]

export default async function CulturePage() {
  const supabase = await createClient()
  const { data: cultures } = supabase
    ? await supabase.from('niger_cultures').select('id,title,slug,language,traditions,history,cover_url').eq('published', true).order('title')
    : { data: [] }

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <section className="cultureHero">
            <div><span className="kicker">Identité & patrimoine</span><h1>La culture du Niger est un territoire à part entière.</h1><p>Explorez les langues, les peuples, les traditions, l’artisanat, la mémoire et les pratiques qui donnent au Niger sa richesse culturelle.</p><Link className="proButton proButtonPrimary" href="/contribution">Participer à la mémoire culturelle <ArrowRight size={15}/></Link></div>
            <div className="cultureHeroMark"><span><span className="proNigerFlag" aria-label="Niger" role="img"><i /><i /><i /></span></span><small>Culture · Mémoire · Transmission</small></div>
          </section>

          <section className="catalogSection">
            <div className="contentHeader"><div><span className="kicker">Explorer par thème</span><h2>Quatre portes d’entrée.</h2></div></div>
            <div className="themeGrid">{sections.map(({ icon: Icon, title, text }) => <article className="themeCard" key={title}><span className="themeIcon"><Icon size={19}/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
          </section>

          <section className="catalogSection">
            <div className="contentHeader"><div><span className="kicker">Contenus publiés</span><h2>Découvrir les cultures.</h2><p>Des fiches culturelles publiées et vérifiées par l’administration.</p></div></div>
            {!cultures?.length ? (
              <div className="catalogEmpty large"><BookOpenText size={24}/><div><strong>La mémoire culturelle se construit.</strong><span>Les premières fiches vérifiées apparaîtront ici.</span></div></div>
            ) : (
              <div className="catalogGrid">{cultures.map(culture => <article className="catalogCard" key={culture.id}><div className="catalogImage" style={culture.cover_url ? {backgroundImage:'url(' + culture.cover_url + ')'} : undefined}><span className="catalogPill">{culture.language || 'Culture'}</span></div><div className="catalogBody"><h3>{culture.title}</h3><p>{culture.history || culture.traditions || 'Traditions et patrimoine culturel du Niger.'}</p><span className="cardLink">Lire la fiche <ArrowRight size={14}/></span></div></article>)}</div>
            )}
          </section>

          <section className="notice proNotice"><strong>Une plateforme nourrie par la communauté.</strong><p>Vous pouvez proposer une tradition, un récit, une langue, un artisanat ou une source documentaire. Chaque contenu est vérifié avant publication.</p><Link className="textlink" href="/contribution">Contribuer <ArrowRight size={15}/></Link></section>
        </div>
      </main>
      <Footer />
    </>
  )
}
