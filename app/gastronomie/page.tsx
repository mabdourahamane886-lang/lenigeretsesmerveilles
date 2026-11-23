import Link from 'next/link'
import { ArrowRight, ChefHat, History, Utensils } from 'lucide-react'
import styles from './gallery.module.css'
import Header from '../../components/site/header'
import { createClient } from '../../lib/supabase/server'
import { brochettesPhoto, gastronomyPhoto } from './photos'

export const dynamic = 'force-dynamic'

const platsNigériens: { nom: string; description: string; image: string; fichier?: string; credit?: string; enhance?: boolean; license?: string; href?: string }[] = [
  { nom: 'Dambou', description: 'Couscous de riz accompagné de feuilles de moringa, une spécialité très appréciée au Niger.', image: '/images/gastronomie/dambou.webp', fichier: "Couscous de riz au légumes.jpg", credit: "Habibou Souley Hajara · CC BY-SA 4.0 · Redimensionnée" },
  { nom: 'Kilishi', description: 'Viande finement assaisonnée et séchée.', image: '/images/gastronomie/kilishi-niger.webp', enhance: true },
  { nom: "Galettes dorées", description: "Petites galettes dorées servies avec leur accompagnement.", image: '/images/gastronomie/galettes.webp', enhance: true, credit: "Tahoua Lélé Birnin Ader" },
  { nom: "Jus de tamarin", description: "Boisson traditionnelle préparée à partir du tamarin, appréciée pour sa saveur acidulée.", image: '/images/gastronomie/sauce.webp', enhance: true, credit: "La cuisine de Maria" },
  { nom: "Confiseries en carrés", description: "Petites bouchées sucrées présentées dans un panier.", image: '/images/gastronomie/confiseries.webp', enhance: true },
  { nom: "Tripes en sauce", description: "Tripes servies dans un bouillon relevé.", image: '/images/gastronomie/tripes.webp', enhance: true },
  { nom: "Fruits du marché", description: "Petits fruits orangés présentés sur un étal.", image: '/images/gastronomie/fruits.webp', enhance: true },
  { nom: "Cristaux ambrés", description: "Gros plan sur des morceaux translucides aux teintes ambrées.", image: '/images/gastronomie/gomme.webp', enhance: true },
  { nom: "Hibiscus séché", description: "Calices séchés utilisés pour préparer une infusion acidulée.", image: '/images/gastronomie/hibiscus.webp', enhance: true },
  { nom: "Préparation à la calebasse", description: "Préparation crémeuse servie dans une calebasse.", image: '/images/gastronomie/calebasse.webp', enhance: true, credit: "APTN et partenaires, d’après la photo fournie" },
  { nom: 'Masa', description: 'Galettes traditionnelles à base de céréales, dégustées notamment au petit-déjeuner.', image: '/images/gastronomie/masa.webp', fichier: "La galette à la nigérienne.jpg", credit: "Tawaye · CC BY-SA 4.0 · Redimensionnée" },
  { nom: 'Plats au moringa', description: 'Feuilles de moringa cuisinées avec des ingrédients et assaisonnements locaux.', image: '/images/gastronomie/moringa.webp', fichier: "Plat à base de feuilles de moringa dans la ville de Niamey au Niger.jpg", credit: "Saliousoft · CC BY-SA 4.0 · Redimensionnée" },
  { nom: 'Brochettes', description: 'À Filingué, les brochettes de viande cuisent autour d’un feu lent, près du marché central.', image: brochettesPhoto, fichier: 'Niger, Filingué (26), street scene.jpg', credit: 'NigerTZai · CC BY-SA 4.0 · Redimensionnée', license: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  { nom: 'Toubani', description: 'Préparation populaire à base de haricots, servie avec son assaisonnement.', image: '/images/gastronomie/toubani.webp', fichier: "Toubani.jpg", credit: "Didia07 · CC BY-SA 4.0 · Redimensionnée" },
  { nom: 'Waina', description: 'Petites galettes de riz cuites dans un moule spécial.', image: '/images/gastronomie/waina.webp', fichier: "Waina chinkafa.jpg", credit: "Abdoulgirafe · CC BY-SA 4.0 · Redimensionnée" },
]

export default async function GastronomiePage() {
  const supabase = await createClient()
  const { data: items } = supabase ? await supabase.from('niger_gastronomy').select('id,name,description,ingredients,preparation,image_url,history').eq('published', true).order('name') : { data: [] }

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <section id="galerie" className="foodPhotoSection" aria-labelledby="food-photo-title">
            <div className="sectionHeading"><span className="kicker">Patrimoine culinaire</span><h2 id="food-photo-title">Les saveurs du Niger en images</h2><p>Quelques plats, préparations et boissons qui racontent la diversité de nos tables.</p></div>
            <div className="foodPhotoGrid">
              {platsNigériens.map((plat) => {
                return <article className="foodPhotoCard" key={plat.nom}>
                  <div className="foodPhotoVisual">
                    <img className={plat.enhance ? styles.photo : undefined} src={plat.image} alt={plat.nom} loading="lazy" decoding="async" />
                  </div>
                  <div className="foodPhotoText"><h3>{plat.href ? <Link href={plat.href}>{plat.nom}</Link> : plat.nom}</h3><p>{plat.description}</p></div>
                </article>
              })}
            </div>
            <details className="foodPhotoCredit">
              <summary>Crédits photographiques</summary>
              <ul>{platsNigériens.filter(plat => plat.credit).map(plat => <li key={plat.nom}>
                {plat.fichier ? <a href={'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(plat.fichier.replaceAll(' ', '_'))}>{plat.nom}</a> : plat.nom} · {plat.credit}{plat.license && <> · <a href={plat.license}>Licence</a></>}
              </li>)}</ul>
            </details>
          </section>

          {!items?.length ? (
            <div className="catalogEmpty large"><ChefHat size={25}/><div><strong>La rubrique gastronomique se construit.</strong><span>Les spécialités validées par l’administration apparaîtront ici.</span></div><Link className="textlink" href="/contribution">Proposer une spécialité <ArrowRight size={14}/></Link></div>
          ) : (
            <div className="foodGrid">{items.map(item => {
              const image = gastronomyPhoto(item.name, item.image_url)
              return <article className="foodCard" key={item.id}><div className="foodCardImage" style={image ? {backgroundImage: 'url(' + image + ')'} : undefined}><span className="catalogPill">Gastronomie</span></div><div className="foodCardBody"><h2>{item.name}</h2><p>{item.description || 'Une spécialité du patrimoine culinaire nigérien.'}</p>{item.history && <div className="foodInfo"><History size={15}/><span><b>Histoire</b>{item.history}</span></div>}{item.ingredients && <div className="foodInfo"><ChefHat size={15}/><span><b>Ingrédients</b>{item.ingredients}</span></div>}{item.preparation && <details className="foodDetails"><summary>Voir la préparation</summary><p>{item.preparation}</p></details>}</div></article>
            })}</div>
          )}

          <section className="regionContribution foodContribution"><div className="regionContributionIcon"><Utensils size={20}/></div><div><span className="proMiniLabel">Mémoire culinaire</span><h2>Une recette familiale mérite aussi d’être documentée.</h2><p>Partagez une spécialité, son histoire ou sa préparation traditionnelle.</p></div><Link className="proButton proButtonDark" href="/contribution">Partager <ArrowRight size={15}/></Link></section>
        </div>
      </main>
      
    </>
  )
}
