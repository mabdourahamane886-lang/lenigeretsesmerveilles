import Link from 'next/link'

const modules = [
  ['🏛️','Merveilles','/admin/merveilles','Créer et publier les sites touristiques.'],
  ['🗺️','Régions','/admin/regions','Gérer les 8 régions du Niger.'],
  ['👥','Cultures','/admin/cultures','Peuples, traditions, langues et patrimoine.'],
  ['🍲','Gastronomie','/admin/gastronomie','Plats, origines et recettes.'],
  ['🎭','Événements','/admin/evenements','Festivals et rendez-vous culturels.'],
  ['📰','Articles','/admin/articles','Actualités et contenus éditoriaux.'],
  ['📸','Médias','/admin/medias','Photos et vidéos authentiques du Niger.'],
  ['📢','Publicités','/admin/publicites','Créer et programmer des campagnes.'],
  ['✍️','Contributions','/admin/contributions','Valider les contenus proposés.'],
]

export default function AdminPage() {
  return <main className="section"><div className="container">
    <div className="adminHero"><div><span className="kicker">Administration</span><h1>Le Niger et ses Merveilles 🇳🇪</h1><p className="muted">Centre de gestion des contenus, médias et publicités.</p></div><Link className="btn ghost" href="/">Voir le site</Link></div>
    <div className="adminGrid">{modules.map(([icon,title,href,description])=><Link className="adminCard" href={href} key={href}><span className="adminIcon">{icon}</span><div><h2>{title}</h2><p>{description}</p></div><span>→</span></Link>)}</div>
  </div></main>
}
