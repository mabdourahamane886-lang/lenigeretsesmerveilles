import Link from 'next/link'
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Camera,
  ChevronRight,
  Compass,
  Send,
  Sparkles,
  Utensils,
} from 'lucide-react'
import Header from '../components/site/header'
import Footer from '../components/site/footer'
import wonders from '../data/wonders'
import { nigerMedia } from '../data/media'
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

type HomeArticle = {
  id: string
  title: string
  slug: string
  category?: string | null
  excerpt?: string | null
  cover_url?: string | null
  author_name?: string | null
  published_at?: string | null
}

const staticWonders: HomeWonder[] = wonders.map((wonder, index) => ({
  id: `static-${index}`,
  name: wonder.name,
  type: wonder.type,
  text: wonder.text,
  image: wonder.image,
  source: wonder.credit ? `${wonder.credit.source} · ${wonder.credit.author} · ${wonder.credit.license}` : null,
}))

const explorerCards = [
  { href: '/regions', icon: Compass, label: 'Territoires', title: 'Les 8 régions', text: 'Parcourez le Niger territoire par territoire.', image: nigerMedia.agadez.image, alt: 'Paysage d’Agadez, Niger' },
  { href: '/merveilles', icon: Sparkles, label: 'Patrimoine', title: 'Les merveilles', text: 'Paysages, villes historiques et lieux remarquables.', image: nigerMedia.tenere.image, alt: 'Paysage du désert du Ténéré, Niger' },
  { href: '/culture', icon: BookOpenText, label: 'Identité', title: 'Culture & traditions', text: 'Langues, savoir-faire, histoire et pratiques.', image: nigerMedia.zinder.image, alt: 'Patrimoine culturel de Zinder, Niger' },
  { href: '/gastronomie', icon: Utensils, label: 'Saveurs', title: 'Gastronomie', text: 'Découvrez les spécialités et récits culinaires.', image: nigerMedia.niamey.image, alt: 'Fleuve Niger à Niamey, Niger' },
  { href: '/evenements', icon: CalendarDays, label: 'Agenda', title: 'Les rendez-vous', text: 'Festivals, rencontres et événements à venir.', image: nigerMedia.parcW.image, alt: 'Paysage du Parc national du W, Niger' },
  { href: '/media', icon: Camera, label: 'Images', title: 'Photothèque', text: 'Images documentées, crédits et licences.', image: nigerMedia.niamey.image, alt: 'Paysage du Niger à Niamey' },
]

async function getHomeData() {
  const supabase = await createClient()
  if (!supabase) {
    return {
      wonders: staticWonders,
      regions: fallbackRegions,
      events: [] as HomeEvent[],
      articles: [] as HomeArticle[],
    }
  }

  const [{ data: publishedWonders }, { data: regions }, { data: events }, { data: articles }] = await Promise.all([
    supabase
      .from('niger_wonders')
      .select('id,name,short_description,description,cover_url,published,featured')
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('name')
      .limit(6),
    supabase.from('niger_regions').select('id,name,slug,description').order('name'),
    supabase
      .from('niger_events')
      .select('id,name,slug,city,starts_at,description,published')
      .eq('published', true)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at')
      .limit(3),
    supabase
      .from('niger_articles')
      .select('id,title,slug,category,excerpt,cover_url,author_name,published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(3),
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

  return {
    wonders: homeWonders,
    regions: regions?.length ? regions : fallbackRegions,
    events: events || [],
    articles: articles || [],
  }
}

function formatDate(value?: string | null) {
  if (!value) return 'À venir'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export default async function Home() {
  const { wonders: homeWonders, regions, events, articles } = await getHomeData()
  const featuredWonder = homeWonders[0]

  return (
    <>
      <Header />

      <main>
        <section className="proHero">
          <div className="proHeroBackdrop" style={{ backgroundImage: `url(${nigerMedia.agadez.image})` }} />
          <div className="proHeroShade" />
          <div className="container proHeroGrid">
            <div className="proHeroCopy">
              <div className="proEyebrow">
                <span className="proEyebrowDot" />
                Plateforme culturelle & touristique du Niger
              </div>
              <h1>Le Niger, <em>raconté</em> autrement.</h1>
              <p>
                Explorez les régions, les paysages, les patrimoines, les cultures et les rendez-vous
                qui donnent au Niger toute sa profondeur.
              </p>
              <div className="proHeroActions">
                <Link className="proButton proButtonPrimary" href="/merveilles">
                  Commencer l’exploration <ArrowRight size={17} />
                </Link>
                <Link className="proButton proButtonGhost" href="/regions">
                  Voir les régions
                </Link>
              </div>
              <div className="proHeroProof">
                <span><strong>08</strong> régions</span>
                <span><strong>∞</strong> histoires à raconter</span>
                <span><strong>🇳🇪</strong> une mémoire à préserver</span>
              </div>
            </div>

            <div className="proHeroPanel">
              <div className="proHeroPanelImage" style={{ backgroundImage: `url(${nigerMedia.niamey.image})` }}>
                <span className="proHeroPanelBadge">À découvrir</span>
                <span className="proHeroPanelPlace">Niamey · Fleuve Niger</span>
              </div>
              <div className="proHeroPanelBody">
                <div>
                  <span className="proMiniLabel">Le Niger en une minute</span>
                  <h2>Un territoire, des cultures, mille visages.</h2>
                </div>
                <Link className="proRoundLink" href="/culture" aria-label="Découvrir la culture du Niger">
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container proStatBar" aria-label="Repères de la plateforme">
          <div><strong>08</strong><span>régions</span></div>
          <div><strong>{homeWonders.length}+</strong><span>merveilles de départ</span></div>
          <div><strong>{events.length || 0}</strong><span>rendez-vous à venir</span></div>
          <div><strong>{articles.length || 0}</strong><span>articles publiés</span></div>
        </section>

        <section className="section proSection">
          <div className="container">
            <div className="proSectionIntro">
              <div>
                <div className="kicker">Explorer par univers</div>
                <h2>Tout le Niger, en quelques gestes.</h2>
              </div>
              <p>Une navigation pensée pour passer rapidement d’un territoire à une histoire, d’un patrimoine à un événement.</p>
            </div>

            <div className="proExplorerGrid">
              {explorerCards.map(({ href, icon: Icon, label, title, text, image, alt }) => (
                <Link href={href} className="proExplorerCard" key={href}>
                  <div
                    className="proExplorerCardMedia"
                    style={{ backgroundImage: `linear-gradient(180deg, rgba(5,45,32,.08) 5%, rgba(5,45,32,.78) 100%), url(${image})` }}
                    role="img"
                    aria-label={alt}
                  />
                  <div className="proExplorerCardContent">
                    <div className="proExplorerTop">
                      <span className="proExplorerIcon"><Icon size={18} /></span>
                      <ChevronRight size={16} />
                    </div>
                    <span className="proMiniLabel">{label}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="proDarkSection">
          <div className="container">
            <div className="proSectionIntro proSectionIntroLight">
              <div>
                <div className="kicker">Sélection éditoriale</div>
                <h2>Les merveilles qui ouvrent le voyage.</h2>
              </div>
              <Link className="proInlineLink proInlineLinkLight" href="/merveilles">Voir toute la sélection <ArrowRight size={16} /></Link>
            </div>

            <div className="proWonderFeature">
              <article className="proWonderMain">
                <div className="proWonderImage" style={featuredWonder?.image ? { backgroundImage: `url(${featuredWonder.image})` } : undefined}>
                  <span className="proMediaPill">{featuredWonder?.type || 'Patrimoine'}</span>
                  <span className="proMediaCredit">{featuredWonder?.source || 'Wikimedia Commons'}</span>
                </div>
                <div className="proWonderBody">
                  <span className="proMiniLabel">À la une</span>
                  <h3>{featuredWonder?.name || 'Découvrez le Niger'}</h3>
                  <p>{featuredWonder?.text || 'Explorez les patrimoines et paysages qui composent la richesse du Niger.'}</p>
                  <Link className="proInlineLink" href="/merveilles">Découvrir cette sélection <ArrowRight size={16} /></Link>
                </div>
              </article>

              <div className="proWonderSide">
                {homeWonders.slice(1, 3).map((wonder) => (
                  <article className="proMiniStory" key={wonder.id}>
                    <div className="proMiniStoryImage" style={wonder.image ? { backgroundImage: `url(${wonder.image})` } : undefined} />
                    <div>
                      <span className="proMiniLabel">{wonder.type}</span>
                      <h3>{wonder.name}</h3>
                      <p>{wonder.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section proSection">
          <div className="container">
            <div className="proSectionIntro">
              <div>
                <div className="kicker">Les territoires</div>
                <h2>8 régions, 8 portes d’entrée.</h2>
              </div>
              <Link className="proInlineLink" href="/regions">Explorer les régions <ArrowRight size={16} /></Link>
            </div>

            <div className="proRegionGrid">
              {regions.map((region, index) => (
                <Link href={`/regions/${region.slug}`} className="proRegionCard" key={region.slug}>
                  <span className="proRegionNumber">{String(index + 1).padStart(2, '0')}</span>
                  <div className="proRegionName">{region.name}</div>
                  <p>{region.description || 'Découvrir le patrimoine et les cultures de cette région.'}</p>
                  <span className="proRegionArrow"><ArrowRight size={16} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {(events.length > 0 || articles.length > 0) && (
          <section className="section proSection proTintSection">
            <div className="container">
              <div className="proEditorialLayout">
                <div className="proEditorialCopy">
                  <div className="kicker">La vie du Niger</div>
                  <h2>Ce qui se passe. Ce qui se raconte.</h2>
                  <p>
                    L’agenda et les publications donnent un rythme à la plateforme :
                    découvrez les prochains rendez-vous et les histoires récemment publiées.
                  </p>
                  <div className="proEditorialLinks">
                    <Link href="/evenements" className="proEditorialLink"><CalendarDays size={18} /><span><b>Agenda</b><small>{events.length ? `${events.length} rendez-vous à venir` : 'Les événements arrivent bientôt'}</small></span><ArrowRight size={17} /></Link>
                    <Link href="/articles" className="proEditorialLink"><BookOpenText size={18} /><span><b>Articles</b><small>{articles.length ? `${articles.length} publications récentes` : 'La rédaction prépare les premiers contenus'}</small></span><ArrowRight size={17} /></Link>
                  </div>
                </div>

                <div className="proEditorialVisual" style={{ backgroundImage: `url(${nigerMedia.zinder.image})` }}>
                  <div className="proEditorialOverlay" />
                  <div className="proEditorialQuote">
                    <span>🇳🇪</span>
                    <strong>Le patrimoine n’est vivant que lorsqu’il est transmis.</strong>
                  </div>
                </div>
              </div>

              {articles.length > 0 && (
                <div className="proArticleRow">
                  {articles.map((article) => (
                    <Link href={`/articles/${article.slug}`} className="proArticleCard" key={article.id}>
                      <div className="proArticleImage" style={article.cover_url ? { backgroundImage: `url(${article.cover_url})` } : undefined} />
                      <div className="proArticleBody">
                        <span className="proMiniLabel">{article.category || 'Édition'}</span>
                        <h3>{article.title}</h3>
                        <p>{article.excerpt || 'Lire cette publication consacrée au Niger.'}</p>
                        <small>{article.author_name || 'Rédaction'}{article.published_at ? ` · ${formatDate(article.published_at)}` : ''}</small>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="section proSection">
          <div className="container">
            <div className="proContribution">
              <div className="proContributionMark"><Send size={21} /></div>
              <div>
                <span className="proMiniLabel">Participer</span>
                <h2>Vous connaissez une histoire qui mérite d’être racontée ?</h2>
                <p>Proposez une merveille, un événement, une histoire culturelle ou une ressource. Les contributions sont vérifiées avant publication.</p>
              </div>
              <Link className="proButton proButtonDark" href="/contribution">Contribuer <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
