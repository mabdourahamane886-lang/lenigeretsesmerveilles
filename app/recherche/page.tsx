import Link from 'next/link'
import { ArrowRight, BookOpenText, CalendarDays, ChefHat, Search, Sparkles, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

type SearchItem = {
  id: string
  name?: string | null
  title?: string | null
  slug?: string | null
  short_description?: string | null
  description?: string | null
  city?: string | null
  excerpt?: string | null
  history?: string | null
  traditions?: string | null
}

type SearchGroup = {
  key: string
  title: string
  icon: LucideIcon
  items: SearchItem[]
  href: (item: SearchItem) => string
  label: (item: SearchItem) => string
  text: (item: SearchItem) => string
}

const resultLabel = (item: SearchItem) => item.name || item.title || 'Contenu du Niger'
const resultText = (item: SearchItem) =>
  item.short_description ||
  item.description ||
  item.excerpt ||
  item.history ||
  item.traditions ||
  'Contenu consacré au Niger.'

export default async function RecherchePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const query = q.trim().slice(0, 80)
  const supabase = await createClient()

  let wonders: SearchItem[] = []
  let events: SearchItem[] = []
  let articles: SearchItem[] = []
  let cultures: SearchItem[] = []
  let gastronomy: SearchItem[] = []

  if (supabase && query) {
    const safe = query.replace(/[%_]/g, '')
    const like = '%' + safe + '%'
    const [w, e, a, c, g] = await Promise.all([
      supabase.from('niger_wonders').select('id,name,slug,short_description,description').eq('published', true).or('name.ilike.' + like + ',short_description.ilike.' + like + ',description.ilike.' + like).limit(8),
      supabase.from('niger_events').select('id,name,slug,city,description').eq('published', true).or('name.ilike.' + like + ',city.ilike.' + like + ',description.ilike.' + like).limit(8),
      supabase.from('niger_articles').select('id,title,slug,excerpt').eq('published', true).or('title.ilike.' + like + ',excerpt.ilike.' + like + ',content.ilike.' + like).limit(8),
      supabase.from('niger_cultures').select('id,title,slug,history,traditions').eq('published', true).or('title.ilike.' + like + ',history.ilike.' + like + ',traditions.ilike.' + like).limit(8),
      supabase.from('niger_gastronomy').select('id,name,slug,description').eq('published', true).or('name.ilike.' + like + ',description.ilike.' + like + ',ingredients.ilike.' + like).limit(8),
    ])
    wonders = (w.data || []) as SearchItem[]
    events = (e.data || []) as SearchItem[]
    articles = (a.data || []) as SearchItem[]
    cultures = (c.data || []) as SearchItem[]
    gastronomy = (g.data || []) as SearchItem[]
  }

  const groups: SearchGroup[] = [
    {
      key: 'wonders',
      title: 'Merveilles',
      icon: Sparkles,
      items: wonders,
      href: () => '/merveilles',
      label: resultLabel,
      text: resultText,
    },
    {
      key: 'events',
      title: 'Événements',
      icon: CalendarDays,
      items: events,
      href: (item) => item.slug ? '/evenements/' + item.slug : '/evenements',
      label: resultLabel,
      text: (item) => [item.city || 'Niger', resultText(item)].filter(Boolean).join(' · '),
    },
    {
      key: 'articles',
      title: 'Articles',
      icon: BookOpenText,
      items: articles,
      href: (item) => item.slug ? '/articles/' + item.slug : '/articles',
      label: resultLabel,
      text: resultText,
    },
    {
      key: 'cultures',
      title: 'Culture',
      icon: UsersRound,
      items: cultures,
      href: () => '/culture',
      label: resultLabel,
      text: resultText,
    },
    {
      key: 'gastronomy',
      title: 'Gastronomie',
      icon: ChefHat,
      items: gastronomy,
      href: () => '/gastronomie',
      label: resultLabel,
      text: resultText,
    },
  ]

  const total = groups.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <>
      <Header />
      <main className="page">
        <div className="container searchPage">
          <div className="searchIntro">
            <span className="kicker">Recherche</span>
            <h1>Trouvez votre prochaine découverte.</h1>
            <p>Recherchez une ville, une merveille, une tradition, un événement, un article ou une spécialité.</p>
          </div>

          <form className="proSearchForm">
            <Search size={19} />
            <input name="q" defaultValue={query} placeholder="Ex. Agadez, désert, festival…" aria-label="Recherche" />
            <button className="proButton proButtonDark">Rechercher <ArrowRight size={15} /></button>
          </form>

          {!query ? (
            <div className="searchSuggestions">
              <span>Essayez :</span>
              {['Agadez', 'Niamey', 'Ténéré', 'culture', 'festival'].map(item => (
                <Link href={'/recherche?q=' + encodeURIComponent(item)} key={item}>{item}</Link>
              ))}
            </div>
          ) : total === 0 ? (
            <div className="catalogEmpty large">
              <Search size={24} />
              <div><strong>Aucun résultat pour « {query} ».</strong><span>Essayez un autre terme ou une autre orthographe.</span></div>
              <Link className="textlink" href="/regions">Explorer les régions <ArrowRight size={14} /></Link>
            </div>
          ) : (
            <div className="searchGroupList">
              <div className="searchResultCount"><strong>{total}</strong> résultat{total > 1 ? 's' : ''} pour « {query} »</div>
              {groups.filter(group => group.items.length).map(({ key, title, icon: Icon, items, href, label, text }) => (
                <section className="searchGroup" key={key}>
                  <div className="searchGroupTitle"><span><Icon size={17} /><b>{title}</b></span><small>{items.length}</small></div>
                  <div className="searchGroupRows">
                    {items.map(item => (
                      <Link href={href(item)} className="searchResultRow" key={item.id}>
                        <div><strong>{label(item)}</strong><span>{text(item)}</span></div>
                        <ArrowRight size={16} />
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
