import Link from 'next/link'
import { ArrowRight, BookOpenText, CalendarDays, Clock3 } from 'lucide-react'
import { createAdminClient } from '../../lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Article = {
  id: string
  title: string
  slug: string
  category?: string | null
  excerpt?: string | null
  cover_url?: string | null
  author_name?: string | null
  published_at?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return 'Publication récente'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function ArticlesPage() {
  const supabase = createAdminClient()
  const { data, count } = supabase
    ? await supabase
        .from('niger_articles')
        .select('id,title,slug,category,excerpt,cover_url,author_name,published_at', { count: 'exact' })
        .eq('published', true)
        .order('published_at', { ascending: false })
    : { data: [], count: 0 }

  const articles = (data ?? []) as Article[]
  const featured = articles[0] ?? null
  const remaining = articles.slice(1)

  return (
    <main className="editorialPage">
      <section className="editorialMasthead">
        <div className="container editorialMastheadInner">
          <div className="editorialEyebrow"><span /> LE JOURNAL · LE NIGER ET SES MERVEILLES</div>
          <h1>Le Niger, <em>à travers ses récits.</em></h1>
          <p>Histoires, patrimoine, culture et regards documentés. Des contenus pour découvrir le Niger avec curiosité et profondeur.</p>
          <div className="editorialMastheadMeta">
            <span><BookOpenText size={15} /> {count ?? articles.length} article{(count ?? articles.length) > 1 ? 's' : ''} publié{(count ?? articles.length) > 1 ? 's' : ''}</span>
            <span><CalendarDays size={15} /> Édition numérique</span>
          </div>
        </div>
      </section>

      <div className="container editorialContent">
        {!featured ? (
          <section className="editorialEmpty">
            <BookOpenText size={30} />
            <span className="proMiniLabel">Le journal se prépare</span>
            <h2>Les prochains récits du Niger arrivent bientôt.</h2>
            <p>Les articles validés par la rédaction seront présentés ici. En attendant, partez à la découverte des régions et des patrimoines du pays.</p>
            <Link className="proButton proButtonDark" href="/regions">Explorer les régions <ArrowRight size={16} /></Link>
          </section>
        ) : (
          <>
            <section className="editorialFeatured">
              <Link href={'/articles/' + featured.slug} className="editorialFeaturedImage" style={featured.cover_url ? { backgroundImage: 'url(' + featured.cover_url + ')' } : undefined} aria-label={'Lire ' + featured.title}>
                <span className="editorialImageLabel">À LA UNE</span>
              </Link>
              <div className="editorialFeaturedCopy">
                <span className="proMiniLabel">{featured.category || 'DOSSIER'}</span>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt || 'Un récit pour mieux comprendre les territoires, les patrimoines et les histoires du Niger.'}</p>
                <div className="editorialByline">
                  <span>{featured.author_name || 'La rédaction'}</span>
                  <span><CalendarDays size={14} /> {formatDate(featured.published_at)}</span>
                </div>
                <Link className="editorialReadLink" href={'/articles/' + featured.slug}>Lire le dossier <ArrowRight size={17} /></Link>
              </div>
            </section>

            {remaining.length > 0 && (
              <section className="editorialArchive">
                <div className="editorialSectionHead">
                  <div><span className="proMiniLabel">LES DERNIÈRES PARUTIONS</span><h2>À lire et à découvrir</h2></div>
                  <span className="editorialCount">{remaining.length} autre{remaining.length > 1 ? 's' : ''} article{remaining.length > 1 ? 's' : ''}</span>
                </div>
                <div className="editorialGrid">
                  {remaining.map((article, index) => (
                    <article className="editorialCard" key={article.id}>
                      <Link href={'/articles/' + article.slug} className="editorialCardImage" style={article.cover_url ? { backgroundImage: 'url(' + article.cover_url + ')' } : undefined} aria-label={'Lire ' + article.title}>
                        <span>{article.category || 'CULTURE'}</span>
                      </Link>
                      <div className="editorialCardBody">
                        <div className="editorialCardMeta"><span>N° {String(index + 2).padStart(2, '0')}</span><span><Clock3 size={12} /> {formatDate(article.published_at)}</span></div>
                        <h3><Link href={'/articles/' + article.slug}>{article.title}</Link></h3>
                        <p>{article.excerpt || 'Découvrez ce récit consacré aux richesses du Niger.'}</p>
                        <div className="editorialCardFoot"><span>{article.author_name || 'La rédaction'}</span><Link href={'/articles/' + article.slug} aria-label={'Lire ' + article.title}><ArrowRight size={17} /></Link></div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
