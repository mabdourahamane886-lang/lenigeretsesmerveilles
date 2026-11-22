import Link from 'next/link'
import { ArrowRight, ChefHat, History, Utensils } from 'lucide-react'
import Header from '../../components/site/header'
import { createClient } from '../../lib/supabase/server'
import { nigerMedia } from '../../data/media'

export const dynamic = 'force-dynamic'

const platsNigériens = [
  { nom: 'Dambou', description: 'Couscous de riz accompagné de feuilles de moringa, une spécialité très appréciée au Niger.', fichier: 'Couscous de riz au légumes.jpg' },
  { nom: 'Kilichi', description: 'Viande finement préparée, assaisonnée et séchée, emblématique du savoir-faire nigérien.', fichier: 'Kilichi' },
  { nom: 'Masa', description: 'Galettes traditionnelles à base de céréales, dégustées notamment au petit-déjeuner.', fichier: 'Massa galette.jpg' },
  { nom: 'Plats au moringa', description: 'Feuilles de moringa cuisinées avec des ingrédients et assaisonnements locaux.', fichier: 'Plat végétairien à base de feuilles de moringa dans la ville de Niamey au Niger.jpg' },
  { nom: 'Brochettes', description: 'Viande grillée et relevée, proposée dans les rues et les lieux de restauration.', fichier: 'Brochettes de viande de boeuf au piment frais.jpg' },
  { nom: 'Toubani', description: 'Préparation populaire à base de haricots, servie avec son assaisonnement.', fichier: 'Toubani.jpg' },
  { nom: 'Jus de tamarin', description: 'Boisson traditionnelle préparée à partir du tamarin, appréciée pour sa fraîcheur.', fichier: 'Le boisson naturel de tamarin.jpg' },
  { nom: 'Waina', description: 'Petites galettes de riz cuites dans un moule spécial.', fichier: 'Waina chinkafa.jpg' },
]

export default async function GastronomiePage() {
  const supabase = await createClient()
  const { data: items } = supabase ? await supabase.from('niger_gastronomy').select('id,name,description,ingredients,preparation,image_url,history').eq('published', true).order('name') : { data: [] }

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="foodHero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,45,32,.94) 0%, rgba(5,45,32,.72) 55%, rgba(5,45,32,.22) 100%), url(${nigerMedia.gastronomie.image})` }}><div><span className="kicker">Saveurs du Niger</span><h1>Une cuisine, des territoires, des histoires.</h1><p>Découvrez les plats, produits, recettes et traditions culinaires publiés sur la plateforme.</p></div><div className="foodHeroIcon"><Utensils size={31}/><span>Gastronomie nigérienne</span></div></div>

          <section className="foodPhotoSection" aria-labelledby="food-photo-title">
            <div className="sectionHeading"><span className="kicker">Patrimoine culinaire</span><h2 id="food-photo-title">Les saveurs du Niger en images</h2><p>Quelques plats, préparations et boissons qui racontent la diversité de nos tables.</p></div>
            <div className="foodPhotoGrid">
              {platsNigériens.map((plat) => {
                const image = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(plat.fichier) + '?width=1000'
                return <article className="foodPhotoCard" key={plat.nom}>
                  <div className="foodPhotoVisual"><img src={image} alt={plat.nom + ' — spécialité culinaire du Niger'} loading="lazy" /></div>
                  <div className="foodPhotoText"><h3>{plat.nom}</h3><p>{plat.description}</p><small>Photo : Wikimedia Commons</small></div>
                </article>
              })}
            </div>
            <p className="foodPhotoCredit">Photographies issues de <a href="https://commons.wikimedia.org/wiki/Category:Cuisine_of_Niger" target="_blank" rel="noreferrer">Wikimedia Commons – Cuisine du Niger</a>. Les crédits et licences sont consultables sur chaque fiche de fichier.</p>
          </section>

          {!items?.length ? (
            <div className="catalogEmpty large"><ChefHat size={25}/><div><strong>La rubrique gastronomique se construit.</strong><span>Les spécialités validées par l’administration apparaîtront ici.</span></div><Link className="textlink" href="/contribution">Proposer une spécialité <ArrowRight size={14}/></Link></div>
          ) : (
            <div className="foodGrid">{items.map(item => <article className="foodCard" key={item.id}><div className="foodCardImage" style={item.image_url ? {backgroundImage:'url(' + item.image_url + ')'} : undefined}><span className="catalogPill">Gastronomie</span></div><div className="foodCardBody"><h2>{item.name}</h2><p>{item.description || 'Une spécialité du patrimoine culinaire nigérien.'}</p>{item.history && <div className="foodInfo"><History size={15}/><span><b>Histoire</b>{item.history}</span></div>}{item.ingredients && <div className="foodInfo"><ChefHat size={15}/><span><b>Ingrédients</b>{item.ingredients}</span></div>}{item.preparation && <details className="foodDetails"><summary>Voir la préparation</summary><p>{item.preparation}</p></details>}</div></article>)}</div>
          )}

          <section className="regionContribution foodContribution"><div className="regionContributionIcon"><Utensils size={20}/></div><div><span className="proMiniLabel">Mémoire culinaire</span><h2>Une recette familiale mérite aussi d’être documentée.</h2><p>Partagez une spécialité, son histoire ou sa préparation traditionnelle.</p></div><Link className="proButton proButtonDark" href="/contribution">Partager <ArrowRight size={15}/></Link></section>
        </div>
      </main>
      
    </>
  )
}
