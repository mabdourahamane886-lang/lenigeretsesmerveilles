import Link from 'next/link'
import { ArrowRight, BookOpenText, CalendarDays, ChefHat, MapPin, Search, Sparkles, UsersRound } from 'lucide-react'
import { createClient } from '../../lib/supabase/server'
import { regions as fallbackRegions } from '../../data/regions'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'

export const dynamic = 'force-dynamic'

type Result = { id: string; title: string; text: string; href: string; category: string }

const clean = (value: string) => value.trim().slice(0, 80)
const like = (value: string) => '%' + value.replace(/[%_]/g, '') + '%'

export default async function ExplorerPage({ searchParams }: { searchParams: Promise<{ q?: string; region?: string; type?: string }> }) {
  const params = await searchParams
  const q = clean(params.q || '')
  const region = clean(params.region || '')
  const type = clean(params.type || 'all')
  const supabase = await createClient()
  const results: Result[] = []

  if (supabase && q) {
    const pattern = like(q)
    const [w, a, e, c, g] = await Promise.all([
      (type === 'all' || type === 'merveilles') ? supabase.from('niger_wonders').select('id,name,slug,short_description,description').eq('published', true).or('name.ilike.' + pattern + ',short_description.ilike.' + pattern + ',description.ilike.' + pattern).limit(12) : Promise.resolve({ data: [] }),
      (type === 'all' || type === 'articles') ? supabase.from('niger_articles').select('id,title,slug,excerpt').eq('published', true).or('title.ilike.' + pattern + ',excerpt.ilike.' + pattern + ',content.ilike.' + pattern).limit(12) : Promise.resolve({ data: [] }),
      (type === 'all' || type === 'evenements') ? supabase.from('niger_events').select('id,name,slug,city,description').eq('published', true).or('name.ilike.' + pattern + ',city.ilike.' + pattern + ',description.ilike.' + pattern).limit(12) : Promise.resolve({ data: [] }),
      (type === 'all' || type === 'culture') ? supabase.from('niger_cultures').select('id,title,slug,history,traditions').eq('published', true).or('title.ilike.' + pattern + ',history.ilike.' + pattern + ',traditions.ilike.' + pattern).limit(12) : Promise.resolve({ data: [] }),
      (type === 'all' || type === 'gastronomie') ? supabase.from('niger_gastronomy').select('id,name,slug,description').eq('published', true).or('name.ilike.' + pattern + ',description.ilike.' + pattern + ',ingredients.ilike.' + pattern).limit(12) : Promise.resolve({ data: [] }),
    ])

    for (const item of w.data || []) results.push({ id: String(item.id), title: item.name, text: item.short_description || item.description || 'Merveille du Niger.', href: item.slug ? '/merveilles/' + item.slug : '/merveilles', category: 'Merveilles' })
    for (const item of a.data || []) results.push({ id: String(item.id), title: item.title, text: item.excerpt || 'Publication culturelle.', href: item.slug ? '/articles/' + item.slug : '/articles', category: 'Articles' })
    for (const item of e.data || []) results.push({ id: String(item.id), title: item.name, text: [item.city, item.description].filter(Boolean).join(' · ') || 'Événement au Niger.', href: item.slug ? '/evenements/' + item.slug : '/evenements', category: 'Agenda' })
    for (const item of c.data || []) results.push({ id: String(item.id), title: item.title, text: item.history || item.traditions || 'Culture du Niger.', href: item.slug ? '/culture/' + item.slug : '/culture', category: 'Culture' })
    for (const item of g.data || []) results.push({ id: String(item.id), title: item.name, text: item.description || 'Gastronomie nigérienne.', href: item.slug ? '/gastronomie/' + item.slug : '/gastronomie', category: 'Gastronomie' })
  }

  const filteredRegions = fallbackRegions.filter((item) => !region || item.slug === region)

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="contentHeader contentHeaderLarge">
            <div>
              <span className="kicker">Exploration avancée</span>
              <h1>Un point de départ pour découvrir le Niger.</h1>
              <p>Recherchez dans les contenus publiés et affinez votre exploration par région ou par univers.</p>
            </div>
            <div className="contentHeaderMark"><MapPin size={24}/><span>8 régions · plusieurs univers</span></div>
          </div>

          <form className="proSearchForm" action="/explorer">
            <Search size={19}/>
            <input name="q" defaultValue={q} placeholder="Agadez, Ténéré, tradition, festival…" aria-label="Rechercher"/>
            <input type="hidden" name="region" value={region}/>
            <input type="hidden" name="type" value={type}/>
            <button className="proButton proButtonDark">Explorer <ArrowRight size={15}/></button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ['all','Tout',''],
              ['merveilles','Merveilles','sparkles'],
              ['articles','Articles','book'],
              ['evenements','Agenda','calendar'],
              ['culture','Culture','users'],
              ['gastronomie','Gastronomie','food'],
            ].map(([value,label]) => (
              <Link key={value} href={'/explorer?q=' + encodeURIComponent(q) + '&region=' + encodeURIComponent(region) + '&type=' + value} className={'rounded-full border px-4 py-2 text-sm font-medium transition ' + (type === value ? 'border-[#0b6a43] bg-[#0b6a43] text-white' : 'border-[#d9ddd8] bg-white text-[#10241d]')}>
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="self-center text-sm font-semibold text-[#53615a]">Région :</span>
            <Link href={'/explorer?q=' + encodeURIComponent(q) + '&type=' + type} className="rounded-full border border-[#d9ddd8] bg-white px-3 py-2 text-sm">Toutes</Link>
            {filteredRegions.map((item) => (
              <Link key={item.slug} href={'/explorer?q=' + encodeURIComponent(q) + '&region=' + item.slug + '&type=' + type} className="rounded-full border border-[#d9ddd8] bg-white px-3 py-2 text-sm">{item.name}</Link>
            ))}
          </div>

          {q ? (
            results.length ? (
              <section className="mt-10">
                <div className="mb-4 flex items-end justify-between gap-4"><div><span className="kicker">Résultats</span><h2>{results.length} résultat{results.length > 1 ? 's' : ''}</h2></div><span className="text-sm text-[#53615a]">Recherche : « {q} »</span></div>
                <div className="grid gap-4 md:grid-cols-2">
                  {results.map((item) => (
                    <Link href={item.href} key={item.category + item.id} className="group rounded-2xl border border-[#e2e5e0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-[#eef6f1] px-3 py-1 text-xs font-semibold text-[#0b6a43]">{item.category}</span><ArrowRight size={16} className="text-[#e37b27] transition group-hover:translate-x-1"/></div>
                      <h3 className="text-xl font-serif font-semibold text-[#10241d]">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#53615a]">{item.text}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : (
              <div className="catalogEmpty large mt-10"><Search size={24}/><div><strong>Aucun résultat pour « {q} ».</strong><span>Essayez un autre terme, une autre région ou un autre univers.</span></div></div>
            )
          ) : (
            <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                [Sparkles,'Merveilles','/merveilles','Patrimoine, paysages et lieux remarquables.'],
                [UsersRound,'Culture','/culture','Langues, traditions, histoire et savoir-faire.'],
                [ChefHat,'Gastronomie','/gastronomie','Plats, produits et mémoire culinaire.'],
                [CalendarDays,'Agenda','/evenements','Festivals, rencontres et rendez-vous.'],
              ].map(([Icon,title,href,text]) => {
                const IconComponent = Icon as typeof Sparkles
                return <Link href={href as string} key={title as string} className="rounded-2xl border border-[#e2e5e0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><IconComponent size={22} className="text-[#0b6a43]"/><h3 className="mt-4 text-xl font-serif font-semibold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-[#53615a]">{text as string}</p></Link>
              })}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
