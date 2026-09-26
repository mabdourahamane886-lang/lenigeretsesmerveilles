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
  Plus,
  ExternalLink,
  ShieldCheck,
  Database,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { isAdminAuthenticated, clearAdminSession, getAdminEmail } from '../../lib/admin-auth'
import { createAdminClient } from '../../lib/supabase/admin'
import { redirect } from 'next/navigation'

type RecentArticle = {
  id: string | number
  title: string
  slug: string | null
  published: boolean | null
  created_at: string
}

type RecentEvent = {
  id: string | number
  name: string
  slug: string | null
  published: boolean | null
  starts_at: string | null
}

const modules = [
  { icon: Landmark, title: 'Merveilles', href: '/admin/merveilles', description: 'Créer et publier les patrimoines et sites remarquables.' },
  { icon: Map, title: 'Régions', href: '/admin/regions', description: 'Gérer les huit régions et leurs informations.' },
  { icon: UsersRound, title: 'Cultures', href: '/admin/cultures', description: 'Peuples, langues, traditions et patrimoine culturel.' },
  { icon: ChefHat, title: 'Gastronomie', href: '/admin/gastronomie', description: 'Plats, produits, histoires et recettes.' },
  { icon: CalendarDays, title: 'Événements', href: '/admin/evenements', description: 'Festivals, rencontres et rendez-vous.' },
  { icon: FileText, title: 'Articles', href: '/admin/articles', description: 'Publications et contenus éditoriaux.' },
  { icon: Camera, title: 'Médias', href: '/admin/medias', description: 'Photos, vidéos, sources et crédits.' },
  { icon: Megaphone, title: 'Publicités', href: '/admin/publicites', description: 'Campagnes, annonces et programmation.' },
  { icon: MessageSquareText, title: 'Contributions', href: '/admin/contributions', description: 'Modérer les contenus proposés par la communauté.' },
]

async function logoutAction() {
  'use server'
  await clearAdminSession()
  redirect('/admin-login')
}

async function getDashboardData() {
  const supabase = createAdminClient()
  if (!supabase) {
    return { connected: false, stats: null, recentArticles: [], recentEvents: [], pendingContributions: 0 }
  }

  const count = async (table: string) => {
    try {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      return count ?? 0
    } catch {
      return 0
    }
  }

  const [
    merveilles,
    regions,
    articles,
    evenements,
    cultures,
    contributions,
    recentArticlesResult,
    recentEventsResult,
    pendingResult,
  ] = await Promise.all([
    count('niger_wonders'),
    count('niger_regions'),
    count('niger_articles'),
    count('niger_events'),
    count('niger_cultures'),
    count('niger_contributions'),
    supabase.from('niger_articles').select('id,title,slug,published,created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('niger_events').select('id,name,slug,published,starts_at').order('starts_at', { ascending: true }).limit(5),
    supabase.from('niger_contributions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    connected: true,
    stats: { merveilles, regions, articles, evenements, cultures, contributions },
    recentArticles: (recentArticlesResult.data || []) as RecentArticle[],
    recentEvents: (recentEventsResult.data || []) as RecentEvent[],
    pendingContributions: pendingResult.count ?? 0,
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin-login?next=/admin')

  const dashboard = await getDashboardData()
  const stats = dashboard.stats

  const statItems = [
    ['Merveilles', stats?.merveilles],
    ['Régions', stats?.regions],
    ['Articles', stats?.articles],
    ['Événements', stats?.evenements],
    ['Cultures', stats?.cultures],
    ['Contributions', stats?.contributions],
  ]

  return (
    <main className="adminPagePro">
      <div className="container">
        <header className="adminTopPro">
          <div>
            <span className="kicker">Centre de gestion • accès propriétaire</span>
            <h1>Le Niger et ses Merveilles</h1>
            <p>Console centrale pour piloter les contenus, les médias, les événements et la modération.</p>
          </div>
          <div className="adminHeaderActions">
            <Link className="proButton proButtonGhostOnLight" href="/">Voir le site <ExternalLink size={15} /></Link>
            <form action={logoutAction}>
              <button className="proButton proButtonGhostOnLight" type="submit"><LogOut size={15} /> Déconnexion</button>
            </form>
          </div>
        </header>

        <section className="adminWelcome">
          <div>
            <span className="proMiniLabel">Session sécurisée</span>
            <h2>Bienvenue, administrateur.</h2>
            <p>Connecté avec <strong>{getAdminEmail()}</strong>. Les écritures sensibles restent exécutées côté serveur.</p>
          </div>
          <div className="adminSecurityStatus">
            {dashboard.connected ? <><ShieldCheck size={18} /> Base de données connectée</> : <><AlertCircle size={18} /> Base de données indisponible</>}
          </div>
        </section>

        <section className="adminQuickActions" aria-label="Actions rapides">
          <div>
            <span className="proMiniLabel">Actions rapides</span>
            <h2>Publier en quelques secondes</h2>
          </div>
          <div className="adminQuickButtons">
            <Link href="/admin/articles" className="adminQuickButton"><Plus size={16} /> Nouvel article</Link>
            <Link href="/admin/evenements" className="adminQuickButton"><CalendarDays size={16} /> Nouvel événement</Link>
            <Link href="/admin/medias" className="adminQuickButton"><Camera size={16} /> 📷 Prendre une photo</Link>
            <Link href="/admin/contributions" className="adminQuickButton"><MessageSquareText size={16} /> Modérer</Link>
          </div>
        </section>

        <section className="adminStatsGrid" aria-label="Statistiques">
          {statItems.map(([label, value]) => (
            <div className="adminStatCard" key={label}>
              <span>{label}</span>
              <strong>{typeof value === 'number' ? value : '—'}</strong>
            </div>
          ))}
        </section>

        <section className="adminOverviewGrid">
          <div className="adminPanelPro">
            <div className="adminPanelHead">
              <div><span className="proMiniLabel">À traiter</span><h2>Modération</h2></div>
              <MessageSquareText size={20} />
            </div>
            <div className="adminPendingBox">
              <strong>{dashboard.pendingContributions}</strong>
              <span>contribution{dashboard.pendingContributions === 1 ? '' : 's'} en attente</span>
              <Link href="/admin/contributions">Ouvrir la modération <ArrowUpRight size={14} /></Link>
            </div>
          </div>

          <div className="adminPanelPro">
            <div className="adminPanelHead">
              <div><span className="proMiniLabel">État du système</span><h2>Contrôle</h2></div>
              <Database size={20} />
            </div>
            <div className="adminSystemRows">
              <div><span><CheckCircle2 size={15} /> Authentification</span><b>Active</b></div>
              <div><span><CheckCircle2 size={15} /> Base Supabase</span><b>{dashboard.connected ? 'Connectée' : 'À vérifier'}</b></div>
              <div><span><Clock3 size={15} /> Session</span><b>7 jours</b></div>
            </div>
          </div>
        </section>

        <section className="adminRecentGrid">
          <div className="adminPanelPro">
            <div className="adminPanelHead">
              <div><span className="proMiniLabel">Dernières publications</span><h2>Articles</h2></div>
              <Link className="textlink" href="/admin/articles">Tout voir <ArrowUpRight size={14} /></Link>
            </div>
            {dashboard.recentArticles.length === 0 ? (
              <p className="muted">Aucun article enregistré.</p>
            ) : (
              <div className="adminActivityList">
                {dashboard.recentArticles.map((item: RecentArticle) => (
                  <div className="adminActivityRow" key={item.id}>
                    <div><strong>{item.title}</strong><span>{formatDate(item.created_at)}</span></div>
                    <span className={item.published ? 'statusPill statusPublished' : 'statusPill'}>{item.published ? 'Publié' : 'Brouillon'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="adminPanelPro">
            <div className="adminPanelHead">
              <div><span className="proMiniLabel">Agenda</span><h2>Prochains événements</h2></div>
              <Link className="textlink" href="/admin/evenements">Gérer <ArrowUpRight size={14} /></Link>
            </div>
            {dashboard.recentEvents.length === 0 ? (
              <p className="muted">Aucun événement enregistré.</p>
            ) : (
              <div className="adminActivityList">
                {dashboard.recentEvents.map((item: RecentEvent) => (
                  <div className="adminActivityRow" key={item.id}>
                    <div><strong>{item.name}</strong><span>{formatDate(item.starts_at)}</span></div>
                    <span className={item.published ? 'statusPill statusPublished' : 'statusPill'}>{item.published ? 'Publié' : 'Brouillon'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="adminSectionTitle">
          <div><span className="proMiniLabel">Modules</span><h2>Gestion du contenu</h2></div>
          <BarChart3 size={20} />
        </div>

        <div className="adminModuleGrid">
          {modules.map(({ icon: Icon, title, href, description }) => (
            <Link href={href} className="adminModuleCard" key={href}>
              <span className="adminModuleIcon"><Icon size={19} /></span>
              <div><h2>{title}</h2><p>{description}</p></div>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
