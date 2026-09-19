import Link from 'next/link'
import Header from '../components/site/header'
import Footer from '../components/site/footer'
import wonders from '../data/wonders'
import { regions as fallbackRegions } from '../data/regions'
import { createClient } from '../lib/supabase/server'

type HomeWonder = {
  id: string
  name: string
  type: string
  text: string
  image?: string | null
  source?: string | null
}

type HomeEvent = {
  id: string
  slug: string
  name: string
  city?: string | null
  starts_at?: string | null
  description?: string | null
}

const staticWonders: HomeWonder[] = wonders.map((wonder, index) => ({
  id: `static-${index}`,
  name: wonder.name,
  type: wonder.type,
  text: wonder.text,
  image: wonder.image,
  source: wonder.credit ? `${wonder.credit.source} · ${wonder.credit.author} · ${wonder.credit.license}` : null,
}))

async function getHomeData() {
  const supabase = await createClient()
  if (!supabase) return { wonders: staticWonders, regions: fallbackRegions, events: [] as HomeEvent[] }

  const [{ data: publishedWonders }, { data: regions }, { data: events }] = await Promise.all([
    supabase.from('niger_wonders').select('id,name,short_description,description,cover_url,published,featured').eq('published', true).order('featured', { ascending: false }).order('name').limit(6),
    supabase.from('niger_regions').select('id,name,slug,description').order('name'),
    supabase.from('niger_events').select('id,name,slug,city,starts_at,description,published').eq('published', true).gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
  ])

  const homeWonders: HomeWonder[] = publishedWonders?.length
    ? publishedWonders.map((wonder) => ({
        id: String(wonder.id),
        name: wonder.name,
        type: 'Patrimoine',
        text: wonder.short_description || wonder.description || 'Découvrez cette merveille du Niger.',
        image: wonder.cover_url,
      }))
    : staticWonders

  return { wonders: homeWonders, regions: regions?.length ? regions : fallbackRegions, events: events || [] }
}

export default async function Home() {
  const { wonders: homeWonders, regions, events } = await getHomeData()

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="heroGlow heroGlowOne" />
          <div className="heroGlow heroGlowTwo" />
          <div className="container heroContent">
            <span className="eyebrow">✦ Plateforme culturelle & touristique du Niger</span>
            <h1>Le Niger se découvre. <em>Il se raconte.</em></h1>
            <p>Un espace moderne pour explorer les régions, les paysages, les patrimoines, les traditions et les histoires qui font la richesse du Niger.</p>
            <div className="actions">
              <Link className="btn primary" href="/merveilles">Explorer les merveilles <span>→</span></Link>
              <Link className="btn ghost" href="/regions">Découvrir les 8 régions</Link>
            </div>
            <div className="heroMeta">
              <span>🇳🇪 Créé pour valoriser le Niger</span><span>•</span><span>Patrimoine · Culture · Tourisme</span>
            </div>
          </div>
        </section>

        <section className="container statShell" aria-label="Chiffres clés">
          <div className="stats">
            <div className="stat"><strong>8</strong><span>Régions à explorer</span></div>
            <div className="stat"><strong>{homeWonders.length}+</strong><span>Merveilles de départ</span></div>
            <div className="stat"><strong>01</strong><span>Plateforme culturelle</span></div>
            <div className="stat"><strong>24/7</strong><span>Guide numérique</span></div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="sectionHead">
              <div><div className="kicker">Sélection éditoriale</div><h2>Les merveilles du Niger</h2><p className="sectionLead">Des lieux, paysages et patrimoines à découvrir, partager et préserver.</p></div>
              <Link className="textlink" href="/merveilles">Voir tout <span>→</span></Link>
            </div>
            <div className="grid wonderGrid">
              {homeWonders.map((wonder) => (
                <article className="card wonderCard" key={wonder.id}>
                  <div className="cardimg" style={wonder.image ? { backgroundImage: `url(${wonder.image})` } : undefined}>
                    <span className="imageBadge">🇳🇪 Niger</span>
                  </div>
                  <div className="cardbody">
                    <span className="tag">{wonder.type}</span>
                    <h3>{wonder.name}</h3>
                    <p>{wonder.text}</p>
                    {wonder.source && <span className="imageCredit">{wonder.source}</span>}
                    <Link className="cardLink" href="/merveilles">Découvrir <span>↗</span></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section sectionSoft">
          <div className="container">
            <div className="sectionHead">
              <div><div className="kicker">Explorer par territoire</div><h2>Les 8 régions du Niger</h2><p className="sectionLead">Chaque région possède ses paysages, ses histoires et ses savoir-faire.</p></div>
              <Link className="textlink" href="/regions">Tout explorer <span>→</span></Link>
            </div>
            <div className="regionGrid">
              {regions.map((region, index) => (
                <Link className="region regionLight" href={`/regions/${region.slug}`} key={region.slug}>
                  <span className="regionNumber">{String(index + 1).padStart(2, '0')}</span>
                  <b>{region.name}</b>
                  <span>{region.description || 'Explorer le patrimoine et les merveilles de cette région.'}</span>
                  <strong>Explorer <span>→</span></strong>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {events.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="sectionHead">
                <div><div className="kicker">Agenda du Niger</div><h2>Les prochains rendez-vous</h2><p className="sectionLead">Événements culturels, festivals et rencontres publiés sur la plateforme.</p></div>
                <Link className="textlink" href="/evenements">Tout l’agenda <span>→</span></Link>
              </div>
              <div className="eventGrid homeEventGrid">
                {events.map((event) => (
                  <article className="eventCard" key={event.id}>
                    <div className="eventImage homeEventImage">
                      <span className="eventBadge">🇳🇪 Niger</span>
                      <span className="eventDate">{event.starts_at ? new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(event.starts_at)) : 'À confirmer'}</span>
                    </div>
                    <div className="eventBody">
                      <div className="eventMeta">{event.city || 'Niger'}</div>
                      <h2>{event.name}</h2>
                      <p>{event.description || 'Découvrez cet événement au Niger.'}</p>
                      <Link className="cardLink" href={`/evenements/${event.slug}`}>Voir l’événement <span>→</span></Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <div className="featureFeature">
              <div className="featureVisual">
                <div className="featureOverlay" />
                <div className="featureCopy">
                  <span className="tag tagLight">Culture & patrimoine</span>
                  <h2>Une diversité à raconter, une mémoire à préserver.</h2>
                  <p>Peuples, langues, artisanat, gastronomie, musique, histoire et traditions.</p>
                </div>
              </div>
              <div className="featurePanel">
                <div className="kicker">Ce que vous pouvez explorer</div>
                <div className="listitem"><span className="listIcon">◉</span><div><b>Peuples & traditions</b><span className="muted">Histoires, langues, vêtements et savoir-faire.</span></div></div>
                <div className="listitem"><span className="listIcon">◆</span><div><b>Gastronomie</b><span className="muted">Plats, produits locaux et traditions culinaires.</span></div></div>
                <div className="listitem"><span className="listIcon">✦</span><div><b>Événements</b><span className="muted">Festivals, rencontres et rendez-vous culturels.</span></div></div>
                <div className="listitem"><span className="listIcon">↗</span><div><b>Contributions</b><span className="muted">Partagez des découvertes et participez à la mémoire numérique.</span></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta">
              <div><div className="kicker">Une plateforme vivante</div><h2>Le Niger, sur une seule plateforme.</h2><p className="muted">Explorez, apprenez et contribuez à une mémoire numérique consacrée au Niger.</p></div>
              <div className="actions"><Link className="btn primary" href="/carte">Voir la carte</Link><Link className="btn darkbtn" href="/contribution">Contribuer au projet</Link></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
