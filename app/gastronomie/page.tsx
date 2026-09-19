import Link from 'next/link'
import { ArrowRight, ChefHat, History, Utensils } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function GastronomiePage() {
  const supabase = await createClient()
  const { data: items } = supabase ? await supabase.from('niger_gastronomy').select('id,name,description,ingredients,preparation,image_url,history').eq('published', true).order('name') : { data: [] }

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="foodHero"><div><span className="kicker">Saveurs du Niger</span><h1>Une cuisine, des territoires, des histoires.</h1><p>Découvrez les plats, produits, recettes et traditions culinaires publiés sur la plateforme.</p></div><div className="foodHeroIcon"><Utensils size={31}/><span>Gastronomie nigérienne</span></div></div>

          {!items?.length ? (
            <div className="catalogEmpty large"><ChefHat size={25}/><div><strong>La rubrique gastronomique se construit.</strong><span>Les spécialités validées par l’administration apparaîtront ici.</span></div><Link className="textlink" href="/contribution">Proposer une spécialité <ArrowRight size={14}/></Link></div>
          ) : (
            <div className="foodGrid">{items.map(item => <article className="foodCard" key={item.id}><div className="foodCardImage" style={item.image_url ? {backgroundImage:'url(' + item.image_url + ')'} : undefined}><span className="catalogPill">Gastronomie</span></div><div className="foodCardBody"><h2>{item.name}</h2><p>{item.description || 'Une spécialité du patrimoine culinaire nigérien.'}</p>{item.history && <div className="foodInfo"><History size={15}/><span><b>Histoire</b>{item.history}</span></div>}{item.ingredients && <div className="foodInfo"><ChefHat size={15}/><span><b>Ingrédients</b>{item.ingredients}</span></div>}{item.preparation && <details className="foodDetails"><summary>Voir la préparation</summary><p>{item.preparation}</p></details>}</div></article>)}</div>
          )}

          <section className="regionContribution foodContribution"><div className="regionContributionIcon"><Utensils size={20}/></div><div><span className="proMiniLabel">Mémoire culinaire</span><h2>Une recette familiale mérite aussi d’être documentée.</h2><p>Partagez une spécialité, son histoire ou sa préparation traditionnelle.</p></div><Link className="proButton proButtonDark" href="/contribution">Partager <ArrowRight size={15}/></Link></section>
        </div>
      </main>
      <Footer />
    </>
  )
}
