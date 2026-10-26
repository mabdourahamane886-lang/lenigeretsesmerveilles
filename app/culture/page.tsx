import Link from 'next/link'
import { ArrowRight, BookOpenText, Drum, HandHeart, Languages, HeartHandshake } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Culture et ethnies du Niger',
  description: 'Découvrez les cultures, les communautés, les langues, les traditions et le patrimoine vivant du Niger.',
  alternates: { canonical: '/culture' },
  openGraph: {
    title: 'Culture et ethnies du Niger',
    description: 'Explorez la diversité culturelle et les communautés du Niger.',
    url: '/culture',
    type: 'website' as const,
  },
}

const sections = [
  { icon: Languages, title: 'Langues & peuples', text: 'Une diversité linguistique et humaine à documenter avec précision.' },
  { icon: HandHeart, title: 'Traditions & savoir-faire', text: 'Des pratiques transmises, adaptées et préservées au fil des générations.' },
  { icon: Drum, title: 'Musique & célébrations', text: 'Rythmes, cérémonies, festivals et formes d’expression culturelle.' },
  { icon: BookOpenText, title: 'Histoire & mémoire', text: 'Des récits qui permettent de mieux comprendre les territoires.' },
]

const communities = [
  {
    name: 'Haoussa',
    aliases: 'Hausa',
    description: 'Une communauté majeure du sud du Niger, avec une riche tradition de textile, de broderie, de musique et de commerce.',
    image: 'https://assets.irinnews.org/s3fs-public/images/201104050821220219.jpg',
    credit: 'The New Humanitarian / IRIN — droits de réutilisation à vérifier avant republication.',
  },
  {
    name: 'Zarma-Songhaï',
    aliases: 'Zarma / Songhaï',
    description: 'Des communautés notamment présentes dans l’ouest du Niger, dont les langues, les arts, les récits et les pratiques sociales sont diverses.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/La%20danse%20Zarma%2001.jpg?width=1000',
    credit: '« La danse Zarma 01 » · Wikimedia Commons.',
  },
  {
    name: 'Touareg',
    aliases: 'Kel Tamasheq',
    description: 'Des communautés sahariennes et sahéliennes connues entre autres pour leurs langues, leur poésie, leur artisanat et leurs vêtements traditionnels.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mariage_Touareg_Niger3.jpg',
    credit: 'Mariage touareg au Niger · Wikimedia Commons ; vérifier la licence du fichier.',
  },
  {
    name: 'Peul / Fulbé',
    aliases: 'Fulani',
    description: 'Présentes dans plusieurs régions du Niger, les communautés peules possèdent des traditions variées, notamment autour de l’élevage, de la poésie et des célébrations.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger%2C%20Damari%20%2803%29%2C%20Peul%20girls%20in%20traditional%20clothes.jpg?width=1000',
    credit: 'Vincent van Zeijst · Wikimedia Commons · CC BY-SA 4.0.',
  },
  {
    name: 'Kanouri',
    aliases: 'Kanuri',
    description: 'Communautés historiquement liées à la région du lac Tchad, présentes notamment dans l’est du Niger. Les traditions vestimentaires varient selon les lieux et les familles.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/02/A_typical_kanuri_woman.jpg',
    credit: 'Photographie d’une femme kanouri · Wikimedia Commons ; vérifier le lieu et la licence du fichier.',
  },
  {
    name: 'Toubou',
    aliases: 'Tubu',
    description: 'Communautés du Sahara et du Sahel oriental, notamment dans la région de Diffa, avec des pratiques et des savoir-faire adaptés à des milieux arides.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger%2C%20Toubou%20people%20at%20Koul%C3%A9l%C3%A9%20%2801%29.jpg?width=1000',
    credit: 'NigerTZai / Vincent van Zeijst · Wikimedia Commons · CC BY-SA 4.0.',
  },
  {
    name: 'Gourmantché',
    aliases: 'Gourmanchéma',
    description: 'Communautés présentes dans l’ouest du Niger et au-delà des frontières, avec des langues et des pratiques culturelles qui varient selon les localités.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chant%20et%20danse%20gourmatch%C3%A9.jpg?width=1000',
    credit: '« Chant et danse gourmatché » · Wikimedia Commons.',
  },
  {
    name: 'Communautés arabes',
    aliases: 'Groupes arabophones du Niger',
    description: 'Plusieurs communautés arabophones vivent au Niger. Leurs histoires, leurs dialectes et leurs traditions ne se résument pas à une seule identité.',
    image: 'https://www.101lasttribes.com/logo_tribes/Diffa.jpg?community=diffa-arab',
    credit: 'Image référencée par 101 Last Tribes ; confirmer l’identification et obtenir l’autorisation de réutilisation.',
  },
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

          <section id="ethnies" className="catalogSection">
            <div className="contentHeader">
              <div><span className="kicker">Diversité humaine · Niger 🇳🇪</span><h2>Les peuples et les communautés du Niger</h2><p>Découvrez huit communautés et des repères culturels, dans le respect de leurs histoires et de leur diversité.</p></div>
            </div>
            <div className="notice proNotice" style={{marginBottom:24}}>
              <HeartHandshake size={22}/>
              <div><strong>Une galerie documentaire, pas des catégories figées.</strong><p>Les communautés ne sont pas toutes uniformes et plusieurs vivent de part et d’autre des frontières. Une tenue ou une photographie ne suffit pas à identifier l’origine d’une personne. Les crédits et licences des images doivent être respectés.</p></div>
            </div>
            <div className="catalogGrid">
              {communities.map((community) => (
                <article className="catalogCard" key={community.name}>
                  <div className="catalogImage" role="img" aria-label={'Photographie illustrative : ' + community.name} style={community.image ? { backgroundImage: 'url("' + community.image + '")' } : undefined}>
                    <span className="catalogPill">{community.aliases}</span>
                  </div>
                  <div className="catalogBody">
                    <h3>{community.name}</h3>
                    <p>{community.description}</p>
                    <small style={{display:'block',margin:'10px 0',color:'#58665f'}}>Crédit : {community.credit}</small>
                  </div>
                </article>
              ))}
            </div>
            <p style={{marginTop:16,color:'#58665f',fontSize:'.9rem'}}>Les images sont des références documentaires. Avant toute réutilisation éditoriale, vérifiez la source, la légende et la licence d’origine.</p>
          </section>

          <section className="catalogSection">
            <div className="contentHeader"><div><span className="kicker">Contenus publiés</span><h2>Découvrir les cultures.</h2><p>Des fiches culturelles publiées et vérifiées par l’administration.</p></div></div>
            {!cultures?.length ? (
              <div className="catalogEmpty large"><BookOpenText size={24}/><div><strong>La mémoire culturelle se construit.</strong><span>Les premières fiches vérifiées apparaîtront ici.</span></div></div>
            ) : (
              <div className="catalogGrid">{cultures.map(culture => <article className="catalogCard" key={culture.id}><div className="catalogImage" style={culture.cover_url ? {backgroundImage:'url(' + culture.cover_url + ')'} : undefined}><span className="catalogPill">{culture.language || 'Culture'}</span></div><div className="catalogBody"><h3>{culture.title}</h3><p>{culture.history || culture.traditions || 'Traditions et patrimoine culturel du Niger.'}</p><span className="cardLink">Lire la fiche <ArrowRight size={14}/></span></div></article>)}</div>
            )}
          </section>

          <section className="catalogSection">
            <div className="contentHeader"><div><span className="kicker">Traditions & patrimoine</span><h2>Un patrimoine vivant à transmettre.</h2><p>Vêtements traditionnels, danses, musiques, artisanat, cérémonies et récits contribuent à la richesse des cultures nigériennes.</p></div></div>
            <div className="themeGrid">{sections.slice(1).map(({ icon: Icon, title, text }) => <article className="themeCard" key={title}><span className="themeIcon"><Icon size={19}/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
          </section>

          <section className="notice proNotice"><strong>Une plateforme nourrie par la communauté.</strong><p>Vous pouvez proposer une tradition, un récit, une langue, un artisanat ou une source documentaire. Chaque contenu est vérifié avant publication.</p><Link className="textlink" href="/contribution">Contribuer <ArrowRight size={15}/></Link></section>
        </div>
      </main>
      <Footer />
    </>
  )
}
