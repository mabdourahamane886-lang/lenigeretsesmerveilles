import Link from 'next/link'
import { ArrowRight, BookOpenText, HeartHandshake } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'

export const metadata = {
  title: 'Les ethnies du Niger',
  description: 'Découvrez les communautés du Niger, leurs cultures, leurs vêtements traditionnels et des photographies documentées.',
  alternates: { canonical: '/ethnies' },
  openGraph: {
    title: 'Les ethnies du Niger',
    description: 'Une galerie culturelle consacrée à la diversité humaine du Niger.',
    url: '/ethnies',
    type: 'website' as const,
  },
}

const communities = [
  {
    name: 'Haoussa',
    aliases: 'Hausa',
    description: 'Une communauté majeure du sud du Niger, avec une riche tradition de textile, de broderie, de musique et de commerce.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Hausa_traditional_wedding_and_dress_07.jpg',
    credit: 'Photographie de tenue traditionnelle haoussa · Wikimedia Commons (vérifier la licence sur la fiche du fichier)',
  },
  {
    name: 'Zarma-Songhaï',
    aliases: 'Zarma / Songhai',
    description: 'Des communautés notamment présentes dans l’ouest du Niger, dont les langues, les arts, les récits et les pratiques sociales sont diverses.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/La%20danse%20Zarma%2001.jpg?width=1000',
    credit: 'Photographie « La danse Zarma 01 » · Wikimedia Commons',
  },
  {
    name: 'Touareg',
    aliases: 'Kel Tamasheq',
    description: 'Des communautés sahariennes et sahéliennes connues entre autres pour leurs langues, leur poésie, leur artisanat et leurs vêtements traditionnels.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Mariage_Touareg_Niger3.jpg',
    credit: 'Mariage touareg au Niger · Wikimedia Commons (vérifier la licence sur la fiche du fichier)',
  },
  {
    name: 'Peul / Fulbé',
    aliases: 'Fulani',
    description: 'Présentes dans plusieurs régions du Niger, les communautés peules possèdent des traditions variées, notamment autour de l’élevage, de la poésie et des célébrations.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger%2C%20Damari%20%2803%29%2C%20Peul%20girls%20in%20traditional%20clothes.jpg?width=1000',
    credit: 'Vincent van Zeijst · Wikimedia Commons · CC BY-SA 4.0',
  },
  {
    name: 'Kanouri',
    aliases: 'Kanuri',
    description: 'Communautés historiquement liées à la région du lac Tchad, présentes notamment dans l’est du Niger. Les traditions vestimentaires varient selon les lieux et les familles.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/02/A_typical_kanuri_woman.jpg',
    credit: 'Photographie d’une femme kanouri · Wikimedia Commons (photo non confirmée comme prise au Niger ; vérifier la licence sur la fiche du fichier)',
  },
  {
    name: 'Toubou',
    aliases: 'Tubu',
    description: 'Communautés du Sahara et du Sahel oriental, notamment dans la région de Diffa, avec des pratiques et des savoir-faire adaptés à des milieux arides.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger%2C%20Toubou%20people%20at%20Koul%C3%A9l%C3%A9%20%2801%29.jpg?width=1000',
    credit: 'NigerTZai / Vincent van Zeijst · Wikimedia Commons · CC BY-SA 4.0',
  },
  {
    name: 'Gourmantché',
    aliases: 'Gourmanchéma',
    description: 'Communautés présentes dans l’ouest du Niger et au-delà des frontières, avec des langues et des pratiques culturelles qui varient selon les localités.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chant%20et%20danse%20gourmatch%C3%A9.jpg?width=1000',
    credit: 'Photographie « Chant et danse gourmatché » · Wikimedia Commons',
  },
  {
    name: 'Communautés arabes',
    aliases: 'Groupes arabophones du Niger',
    description: 'Plusieurs communautés arabophones vivent au Niger. Leurs histoires, leurs dialectes et leurs traditions ne se résument pas à une seule identité.',
    image: 'https://www.101lasttribes.com/logo_tribes/Diffa.jpg',
    credit: 'Photographie de référence sur les Arabes de Diffa · 101 Last Tribes (droits de réutilisation à confirmer)',
  },
]

export default function EthniesPage() {
  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <section className="cultureHero">
            <div>
              <span className="kicker">Diversité humaine · Niger 🇳🇪</span>
              <h1>Les peuples et les cultures du Niger</h1>
              <p>Une galerie pour découvrir différentes communautés du Niger, leurs traditions et leurs tenues. Les identités sont diverses et parfois partagées entre plusieurs pays : chaque photo est accompagnée de sa source lorsqu’elle est connue.</p>
              <a className="proButton proButtonPrimary" href="#galerie-ethnies">Explorer la galerie <ArrowRight size={15}/></a>
            </div>
            <div className="cultureHeroMark"><span><HeartHandshake size={36}/></span><small>Respect · Mémoire · Transmission</small></div>
          </section>

          <section className="notice proNotice" style={{marginTop:24}}>
            <strong>Une galerie documentaire, pas des catégories figées.</strong>
            <p>Les communautés ne sont pas toutes uniformes et les vêtements ne permettent pas, à eux seuls, d’identifier l’origine d’une personne. Les photos servent à documenter des pratiques culturelles ; les crédits et licences doivent être respectés.</p>
          </section>

          <section id="galerie-ethnies" className="catalogSection">
            <div className="contentHeader">
              <div><span className="kicker">Galerie par communauté</span><h2>Découvrir les peuples du Niger</h2><p>Les fiches sans photo vérifiée renvoient vers les collections documentaires pour éviter d’attribuer une image à tort.</p></div>
            </div>
            <div className="catalogGrid">
              {communities.map((community) => (
                <article className="catalogCard" key={community.name}>
                  <div className="catalogImage" style={community.image ? { backgroundImage: 'url("' + community.image + '")' } : undefined}>
                    <span className="catalogPill">{community.aliases}</span>
                  </div>
                  <div className="catalogBody">
                    <h3>{community.name}</h3>
                    <p>{community.description}</p>
                    {community.credit && <small style={{display:'block',margin:'10px 0',color:'#58665f'}}>Crédit : {community.credit}</small>}

                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="notice proNotice">
            <BookOpenText size={22}/>
            <div><strong>Aidez à enrichir cette galerie.</strong><p>Pour ajouter davantage de portraits de femmes et de filles du Niger, privilégiez des photos documentées, publiées avec autorisation ou sous une licence réutilisable, et accompagnées de leur crédit exact.</p><Link className="textlink" href="/contribution">Proposer une contribution <ArrowRight size={15}/></Link></div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
