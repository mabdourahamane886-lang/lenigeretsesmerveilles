import { isAdminAuthenticated } from '../lib/admin-auth'
import styles from './home-mobile.module.css'
import Image from 'next/image'
import PublicationActions from './publications/publication-actions'
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
import wonders from '../data/wonders'
import { getPublicationExcerpt, getPublicationTitle } from '../lib/publications/format'
import { nigerMedia } from '../data/media'
import RegionCards from '../components/regions/region-cards'
import { createAdminClient } from '../lib/supabase/admin'

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

type HomePublication = {
  pinned_at: string | null
  id: string
  author_name?: string | null
  content?: string | null
  media_url?: string | null
  media_type?: string | null
  location?: string | null
  published_at?: string | null
}

type ExplorerCard = {
  href: string
  icon: typeof Compass
  label: string
  title: string
  text: string
  image?: string
  alt: string
  collage?: string[]
}

const staticWonders: HomeWonder[] = wonders.map((wonder, index) => ({
  id: `static-${index}`,
  name: wonder.name,
  type: wonder.type,
  text: wonder.text,
  image: wonder.image,
  source: wonder.credit ? `${wonder.credit.author} · ${wonder.credit.license}` : null,
}))

const explorerCards: ExplorerCard[] = [
  { href: '/regions', icon: Compass, label: 'Territoires', title: 'Les 8 régions', text: 'Découvrez les huit régions, leurs villes, leurs paysages et leurs particularités.', image: nigerMedia.agadez.image, alt: 'Paysage d’Agadez, Niger' },
  { href: '/merveilles', icon: Sparkles, label: 'Patrimoine', title: 'Les merveilles', text: 'Sites naturels, monuments, paysages et lieux de mémoire à découvrir.', image: nigerMedia.tenere.image, alt: 'Paysage du désert du Ténéré, Niger' },
  { href: '/culture', icon: BookOpenText, label: 'Identité', title: 'Culture & traditions', text: 'Rencontrez les peuples du Niger à travers leurs langues, leurs savoir-faire, leurs arts et leurs traditions.', image: nigerMedia.touareg.image, alt: 'Femme touarègue, photographie illustrant les cultures du Niger' },
  { href: '/gastronomie', icon: Utensils, label: 'Saveurs', title: 'Gastronomie', text: 'Goûtez aux spécialités régionales et découvrez les produits, recettes et traditions culinaires.', image: nigerMedia.gastronomie.image, alt: nigerMedia.gastronomie.alt },
  { href: '/evenements', icon: CalendarDays, label: 'Agenda', title: 'Les rendez-vous', text: 'Retrouvez les festivals, fêtes, rencontres culturelles et autres rendez-vous annoncés.', image: nigerMedia.parcW.image, alt: 'Paysage du Parc national du W, Niger' },
  { href: '/media', icon: Camera, label: 'Images', title: 'Photothèque', text: 'Explorez les photographies du Niger avec leurs légendes, leurs sources et leurs crédits.', collage: [nigerMedia.agadez.image, nigerMedia.zinder.image, nigerMedia.tenere.image, nigerMedia.parcW.image], alt: 'Collage de paysages et patrimoines du Niger' },
]

async function getHomeData() {
  const supabase = createAdminClient()
  if (!supabase) {
    return {
      wonders: staticWonders,
      events: [] as HomeEvent[],
      articles: [] as HomeArticle[],
      publications: [] as HomePublication[],
      articlesCount: 0,
    }
  }

  const [{ data: publishedWonders }, { data: events }, { data: articles }, { data: publications }, { count: articlesCount }] = await Promise.all([
    supabase
      .from('niger_wonders')
      .select('id,name,short_description,description,cover_url,published,featured')
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('name')
      .limit(6),
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
    supabase
      .from('niger_publications')
      .select('id,author_name,content,media_url,media_type,location,published_at,pinned_at')
      .eq('published', true)
      .eq('visibility', 'public')
      .order('pinned_at', { ascending: false, nullsFirst: false })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .order('id')
      .limit(3),
    supabase.from('niger_articles').select('*', { count: 'exact', head: true }).eq('published', true),
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
    events: events || [],
    articles: articles || [],
    publications: publications || [],
    articlesCount: articlesCount ?? 0,
  }
}

function formatDate(value?: string | null) {
  if (!value) return 'À venir'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

export default async function Home() {
  const [{ wonders: homeWonders, events, articles, publications, articlesCount }, canPin] = await Promise.all([getHomeData(), isAdminAuthenticated()])
  const featuredWonder = homeWonders[0]

  return (
    <>

      <main className="homePageWide">
        <section className={styles.panorama} aria-labelledby="home-title">
          <Image
            className={styles.panoramaPhoto}
            src="/images/accueil/fleuve-niger-niamey.webp"
            alt={nigerMedia.niamey.alt}
            fill
            priority
            sizes="100vw"
          />
          <div className={`container ${styles.panoramaContent}`}>
            <div className="proHeroCopy">
              <h1 id="home-title" className={styles.headline}>Le Niger, terre de merveilles.</h1>
              <p>Des portes du Sahara aux rives du fleuve, découvrez huit régions et les cultures qui les font vivre.</p>
              <Link className={styles.action} href="#univers">Parcourir les univers <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
            <aside className={styles.mission} aria-labelledby="home-mission">
              <h2 id="home-mission">Notre mission</h2>
              <p>Documenter et transmettre les paysages, les savoir-faire et les histoires du Niger.</p>
              <Link className={styles.sideLink} href="/a-propos">Découvrir le projet <ArrowRight size={15} aria-hidden="true" /></Link>
            </aside>
          </div>
        </section>

        <section id="univers" className="section proSection" aria-labelledby="univers-title">
          <div className="container">
            <div className={styles.editorialIntro}>
              <span className="kicker">Les univers du Niger</span>
              <div>
                <h2 id="univers-title">Huit régions, des histoires à découvrir.</h2>
                <p>Explorez les paysages du pays, les traditions de ses communautés et les saveurs qui se partagent autour d’une table.</p>
                <nav className={styles.quickLinks} aria-label="Accès rapides aux univers">
                  <Link href="/regions">Régions</Link>
                  <Link href="/culture">Culture</Link>
                  <Link href="/gastronomie">Gastronomie</Link>
                  <Link href="/publications">Publications</Link>
                  <Link href="/application">Ouvrir l’application</Link>
                </nav>
              </div>
            </div>

            <div className="proExplorerGrid">
              {explorerCards.map(({ href, icon: Icon, label, title, text, image, alt, collage }) => (
                <Link href={href} className="proExplorerCard" key={href}>
                  {collage ? (
                    <div
                      className="proExplorerCardMedia"
                      role="img"
                      aria-label={alt}
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '2px', overflow: 'hidden' }}
                    >
                      {collage.map((src, index) => (
                        <span key={src + index} style={{ backgroundImage: `linear-gradient(rgba(5,45,32,.08), rgba(5,45,32,.18)), url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="proExplorerCardMedia"
                      style={{ backgroundImage: `linear-gradient(180deg, rgba(5,45,32,.08) 5%, rgba(5,45,32,.78) 100%), url(${image})` }}
                      role="img"
                      aria-label={alt}
                    />
                  )}
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
                <h2>Des merveilles naturelles, historiques et culturelles.</h2>
              </div>
              <Link className="proInlineLink proInlineLinkLight" href="/merveilles">Explorer toutes les merveilles <ArrowRight size={16} /></Link>
            </div>

            <div className="proWonderFeature">
              <article className="proWonderMain">
                <div className="proWonderImage" style={featuredWonder?.image ? { backgroundImage: `url(${featuredWonder.image})` } : undefined}>
                  <span className="proMediaPill">{featuredWonder?.type || 'Patrimoine'}</span>
                  <span className="proMediaCredit">{featuredWonder?.source || ''}</span>
                </div>
                <div className="proWonderBody">
                  <span className="proMiniLabel">À la une</span>
                  <h3>{featuredWonder?.name || 'Découvrez le Niger'}</h3>
                  <p>{featuredWonder?.text || 'Explorez les patrimoines et paysages qui composent la richesse du Niger.'}</p>
                  <Link className="proInlineLink" href="/merveilles">En savoir plus <ArrowRight size={16} /></Link>
                </div>
              </article>

              <div className="proWonderSide">
                {homeWonders.slice(2, 3).map((wonder) => (
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
                <h2>Huit régions, huit territoires à explorer.</h2>
              </div>
              <Link className="proInlineLink" href="/regions">Explorer les régions <ArrowRight size={16} /></Link>
            </div>

            <RegionCards />
          </div>
        </section>

        <section className="section proSection proTintSection">
            <div className="container">
              <div className="proEditorialLayout">
                <div className="proEditorialCopy">
                  <div className="kicker">Actualités & récits</div>
                  <h2>Suivez les événements et les histoires du pays.</h2>
                  <p>
                    Consultez les rendez-vous annoncés, retrouvez les articles de la rédaction et suivez les initiatives
                    qui font l’actualité culturelle et touristique du Niger.
                  </p>
                  <div className="proEditorialLinks">
                    <Link href="/evenements" className="proEditorialLink"><CalendarDays size={18} /><span><b>Agenda</b><small>{events.length ? `${events.length} rendez-vous à venir` : 'Aucun événement annoncé pour le moment'}</small></span><ArrowRight size={17} /></Link>
                    <Link href="/articles" className="proEditorialLink"><BookOpenText size={18} /><span><b>Articles</b><small>{articlesCount ? `${articlesCount} articles publiés` : 'Les premiers articles seront publiés ici'}</small></span><ArrowRight size={17} /></Link>
                  </div>
                </div>

                <div className="proEditorialVisual" style={{ backgroundImage: `url(${nigerMedia.zinder.image})` }}>
                  <div className="proEditorialOverlay" />
                  <div className="proEditorialQuote">
                    <span><span className="proNigerFlag" aria-label="Niger" role="img"><i /><i /><i /></span></span>
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
              {!events.length && !articles.length && (
                <div
                  className="proEmptyEditorial"
                  style={{
                    marginTop: '28px',
                    padding: 'clamp(22px, 4vw, 36px)',
                    border: '1px solid rgba(11, 93, 59, .14)',
                    borderRadius: '20px',
                    background: '#fff',
                  }}
                >
                  <span className="proMiniLabel">La plateforme évolue</span>
                  <h3 style={{ margin: '10px 0 8px', fontSize: 'clamp(20px, 3vw, 28px)' }}>
                    De nouveaux récits et rendez-vous seront bientôt au programme.
                  </h3>
                  <p style={{ maxWidth: '680px', margin: '0 0 18px', lineHeight: 1.7 }}>
                    En attendant les prochaines publications, parcourez les régions, découvrez les cultures et les traditions,
                    ou interrogez Merveilles IA pour approfondir votre découverte du Niger.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <Link className="proButton proButtonPrimary" href="/culture">Explorer la culture <ArrowRight size={16} /></Link>
                    <Link className="proButton proButtonDark" href="/assistant">Découvrir Merveilles IA <Sparkles size={16} /></Link>
                    <Link className="proButton proButtonGhost" href="/contribution">Proposer un contenu <Send size={16} /></Link>
                  </div>
                </div>
              )}
            </div>
          </section>

        {publications.length > 0 && (
          <section className="section proSection">
            <div className="container">
              <div className="proSectionIntro">
                <div>
                  <div className="kicker">Publications</div>
                  <h2>Les publications récentes à suivre.</h2>
                </div>
                <Link className="proInlineLink" href="/publications">Voir toutes les publications <ArrowRight size={16} /></Link>
              </div>
              <div className="proArticleRow">
                {publications.map((publication) => (
                  <article className="proArticleCard proPublicationCard" key={publication.id}>
                    {publication.media_url && publication.media_type === 'photo' && (
                      <img src={publication.media_url} alt={getPublicationTitle(publication.content)} className="proArticleImage" style={{objectFit:'cover'}} />
                    )}
                    {publication.media_url && publication.media_type === 'video' && (
                      <video src={publication.media_url} controls preload="metadata" className="proArticleImage" style={{objectFit:'cover'}} />
                    )}
                    <div className="proArticleBody">
                      <div className={styles.publicationHeader}>
                        <span className="proMiniLabel">{publication.location || 'Niger'}</span>
                        <PublicationActions id={publication.id} title={getPublicationTitle(publication.content)} pinned={Boolean(publication.pinned_at)} canPin={canPin} />
                      </div>
                      <h3>{getPublicationTitle(publication.content)}</h3>
                      <p>{getPublicationExcerpt(publication.content, 92) || publication.author_name || 'Le Niger et ses Merveilles'}</p>
                      <small>{publication.author_name || 'Le Niger et ses Merveilles'}</small>
                      <small>{publication.published_at ? formatDate(publication.published_at) : ''}</small>
                      <Link className="proInlineLink" href={`/publications/${encodeURIComponent(publication.id)}`} aria-label={`Ouvrir la publication : ${getPublicationTitle(publication.content)}`}>
                        Lire la publication <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section proSection homeDiscoverSection">
          <div className="container">
            <div className="proSectionIntro">
              <div><div className="kicker">Mémoire & identité</div><h2>Des cultures vivantes, une mémoire à partager.</h2></div>
              <p>Découvrez la diversité des communautés du Niger, leurs langues, leurs expressions artistiques et leurs savoir-faire, dans le respect des sources et des traditions.</p>
            </div>
            <div className="homeEditorialGrid">
              <Link href="/culture" className="homeEditorialCard homeCultureCard" style={{ '--home-card-image': `url("${nigerMedia.zinder.image}")` } as React.CSSProperties}>
                <span className="homeEditorialTag">Identités & savoir-faire</span><h3>Les cultures et les savoir-faire du Niger</h3>
                <p>Découvrez la diversité des communautés, leurs langues, leurs arts, leurs savoir-faire et les traditions transmises de génération en génération.</p><span className="homeEditorialCta">Explorer la culture <ArrowRight size={16}/></span>
              </Link>
              <Link href="/gastronomie" className="homeEditorialCard homeFoodCard" style={{ '--home-card-image': `url("${nigerMedia.gastronomie.image}")` } as React.CSSProperties}>
                <span className="homeEditorialTag">Saveurs & transmission</span><h3>Les saveurs du Niger</h3>
                <p>Des céréales aux sauces, des recettes familiales aux spécialités régionales : découvrez les goûts et les habitudes culinaires du pays.</p><span className="homeEditorialCta">Découvrir les saveurs <ArrowRight size={16}/></span>
              </Link>
              <Link href="/merveilles" className="homeEditorialCard homeHeritageCard" style={{ '--home-card-image': `url("${nigerMedia.agadez.image}")` } as React.CSSProperties}>
                <span className="homeEditorialTag">Histoire & territoires</span><h3>Les lieux emblématiques du Niger</h3>
                <p>Explorez les paysages, les sites historiques et les espaces naturels, en découvrant leur histoire et les informations disponibles.</p><span className="homeEditorialCta">Voir les merveilles <ArrowRight size={16}/></span>
              </Link>
            </div>
          </div>
        </section>

        <section className="section proSection">
          <div className="container">
            <div className="proContribution">
              <div className="proContributionMark"><Send size={21} /></div>
              <div>
                <span className="proMiniLabel">Participer</span>
                <h2>Vous connaissez un lieu, une tradition ou une histoire à faire découvrir ?</h2>
                <p>Partagez une information, une photographie, un site remarquable, un événement ou un témoignage culturel. Les propositions sont examinées par l’équipe avant leur éventuelle publication.</p>
              </div>
              <Link className="proButton proButtonDark" href="/contribution">Contribuer <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      </main>

    </>
  )
}
