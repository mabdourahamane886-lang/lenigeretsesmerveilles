import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  ChefHat,
  FileText,
  Landmark,
  Map,
  Megaphone,
  MessageSquareText,
  UsersRound,
  LogOut,
  BarChart3,
} from 'lucide-react'
import { isAdminAuthenticated, clearAdminSession, getAdminEmail } from '../../lib/admin-auth'
import { createAdminClient } from '../../lib/supabase/admin'
import { redirect } from 'next/navigation'

const modules = [
  { icon: Landmark, title: 'Merveilles', href: '/admin/merveilles', description: 'Créer et publier les patrimoines et sites remarquables.' },
  { icon: Map, title: 'Régions', href: '/admin/regions', description: 'Gérer les huit régions et leurs informations.' },
  { icon: UsersRound, title: 'Cultures', href: '/admin/cultures', description: 'Peuples, langues, traditions et patrimoine culturel.' },
  { icon: ChefHat, title: 'Gastronomie', href: '/admin/gastronomie', description: 'Plats, produits, histoires et recettes.' },
  { icon: CalendarDays, title: 'Événements', href: '/admin/evenements', description: 'Festivals, rencontres et rendez-vous.' },
  { icon: FileText, title: 'Articles', href: '/admin/articles', description: 'Publications et contenus éditoriaux.' },
  { icon: Camera, title: 'Médias', href: '/admin/medias', description: 'Photos, sources et crédits.' },
  { icon: Megaphone, title: 'Publicités', href: '/admin/publicites', description: 'Campagnes, annonces et programmation.' },
  { icon: MessageSquareText, title: 'Contributions', href: '/admin/contributions', description: 'Modérer les contenus proposés par la communauté.' },
]

async function logoutAction() {
  'use server'
  await clearAdminSession()
  redirect('/admin-login')
}

async function getStats() {
  const supabase = createAdminClient()
  if (!supabase) return null

  const tables = [
    ['niger_wonders', 'merveilles'],
    ['niger_regions', 'regions'],
    ['niger_articles', 'articles'],
    ['niger_events', 'evenements'],
    ['niger_cultures', 'cultures'],
    ['niger_contributions', 'contributions'],
  ] as const

  const entries = await Promise.all(
    tables.map(async ([table, key]) => {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      return [key, count ?? 0] as const
    }),
  )

  return Object.fromEntries(entries) as Record<string, number>
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin-login?next=/admin')
  const stats = await getStats()

  return (
    <main className="adminPagePro">
      <div className="container">
        <header className="adminTopPro">
          <div>
            <span className="kicker">Centre de gestion • accès propriétaire</span>
            <h1>Le Niger et ses Merveilles</h1>
            <p>Console centrale pour gérer les contenus du site public, les médias et la modération.</p>
          </div>
          <div className="adminHeaderActions">
            <Link className="proButton proButtonGhostOnLight" href="/">Voir le site <ArrowUpRight size={15}/></Link>
            <form action={logoutAction}>
              <button className="proButton proButtonGhostOnLight" type="submit"><LogOut size={15}/> Déconnexion</button>
            </form>
          </div>
        </header>

        <section className="adminWelcome">
          <div>
            <span className="proMiniLabel">Session sécurisée</span>
            <h2>Bienvenue, administrateur.</h2>
            <p>Connecté avec <strong>{getAdminEmail()}</strong>. Toutes les écritures passent par le serveur et la clé Supabase secrète.</p>
          </div>
          <div className="adminWelcomeFlag">🇳🇪</div>
        </section>

        <section className="adminStatsGrid" aria-label="Statistiques">
          {[
            ['Merveilles', stats?.merveilles],
            ['Régions', stats?.regions],
            ['Articles', stats?.articles],
            ['Événements', stats?.evenements],
            ['Cultures', stats?.cultures],
            ['Contributions', stats?.contributions],
          ].map(([label, value]) => (
            <div className="adminStatCard" key={label}>
              <span>{label}</span>
              <strong>{typeof value === 'number' ? value : '—'}</strong>
            </div>
          ))}
        </section>

        <div className="adminSectionTitle">
          <div><span className="proMiniLabel">Modules</span><h2>Gestion du contenu</h2></div>
          <BarChart3 size={20}/>
        </div>

        <div className="adminModuleGrid">
          {modules.map(({ icon: Icon, title, href, description }) => (
            <Link href={href} className="adminModuleCard" key={href}>
              <span className="adminModuleIcon"><Icon size={19}/></span>
              <div><h2>{title}</h2><p>{description}</p></div>
              <ArrowUpRight size={16}/>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
