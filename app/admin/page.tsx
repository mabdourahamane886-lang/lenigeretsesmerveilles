import Link from 'next/link'
import { ArrowUpRight, CalendarDays, Camera, ChefHat, FileText, Landmark, Map, Megaphone, MessageSquareText, UsersRound } from 'lucide-react'

const modules=[
  {icon:Landmark,title:'Merveilles',href:'/admin/merveilles',description:'Créer et publier les patrimoines et sites remarquables.'},
  {icon:Map,title:'Régions',href:'/admin/regions',description:'Gérer les huit territoires et leurs informations.'},
  {icon:UsersRound,title:'Cultures',href:'/admin/cultures',description:'Peuples, langues, traditions et patrimoine culturel.'},
  {icon:ChefHat,title:'Gastronomie',href:'/admin/gastronomie',description:'Plats, produits, histoires et recettes.'},
  {icon:CalendarDays,title:'Événements',href:'/admin/evenements',description:'Festivals, rencontres et rendez-vous.'},
  {icon:FileText,title:'Articles',href:'/admin/articles',description:'Publications et contenus éditoriaux.'},
  {icon:Camera,title:'Médias',href:'/admin/medias',description:'Photos, sources et crédits.'},
  {icon:Megaphone,title:'Publicités',href:'/admin/publicites',description:'Campagnes, annonces et programmation.'},
  {icon:MessageSquareText,title:'Contributions',href:'/admin/contributions',description:'Modérer les contenus proposés par la communauté.'},
]

export default function AdminPage(){
  return (
    <main className="adminPagePro">
      <div className="container">
        <div className="adminTopPro"><div><span className="kicker">Centre de gestion</span><h1>Le Niger et ses Merveilles</h1><p>Une console de publication pensée pour garder le contenu, les médias et la modération sous contrôle.</p></div><Link className="proButton proButtonGhostOnLight" href="/">Voir le site <ArrowUpRight size={15}/></Link></div>
        <section className="adminWelcome"><div><span className="proMiniLabel">État de la plateforme</span><h2>La rédaction commence ici.</h2><p>Créez les contenus, vérifiez les contributions puis publiez. Les données visibles sur le site public proviennent de Supabase.</p></div><div className="adminWelcomeFlag">🇳🇪</div></section>
        <div className="adminModuleGrid">{modules.map(({icon:Icon,title,href,description})=><Link href={href} className="adminModuleCard" key={href}><span className="adminModuleIcon"><Icon size={19}/></span><div><h2>{title}</h2><p>{description}</p></div><ArrowUpRight size={16}/></Link>)}</div>
      </div>
    </main>
  )
}
