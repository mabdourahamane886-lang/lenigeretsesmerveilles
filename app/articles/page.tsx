import Link from 'next/link'
import { ArrowRight, BookOpenText } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data } = supabase
    ? await supabase.from('niger_articles').select('id,title,slug,category,excerpt,cover_url,author_name,published_at').eq('published', true).order('published_at', { ascending: false })
    : { data: [] }

  const articles = data ?? []
  const featured = articles[0] ?? null

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="contentHeader contentHeaderLarge">
            <div><span className="kicker">Édition</span><h1>Le Niger, à travers les récits.</h1><p>Articles, histoire, patrimoine, culture et regards documentés sur les territoires nigériens.</p></div>
            <div className="contentHeaderMark"><BookOpenText size={24}/><span>Journal culturel</span></div>
          </div>

          {!featured ? (
            <div className="catalogEmpty large"><BookOpenText size={25}/><div><strong>La rédaction prépare ses premières publications.</strong><span>Les articles validés depuis l’administration apparaîtront ici.</span></div></div>
          ) : (
            <>
              <section className="featuredArticle">
                <div className="featuredArticleImage" style={featured.cover_url ? { backgroundImage: 'url(' + featured.cover_url + ')' } : undefined} />
                <div className="featuredArticleBody">
                  <span className="proMiniLabel">{featured.category || 'À la une'}</span>
                  <h2>{featured.title}</h2>
                  <p>{featured.excerpt || 'Découvrez cette publication consacrée au Niger.'}</p>
                  <div className="articleMeta">{featured.author_name || 'Rédaction'}{featured.published_at ? ' · ' + new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(featured.published_at)) : ''}</div>
                  <Link className="proButton proButtonDark" href={'/articles/' + featured.slug}>Lire l’article <ArrowRight size={15}/></Link>
                </div>
              </section>

              {articles.length > 1 && (
                <section className="catalogSection">
                  <div className="contentHeader"><div><span className="kicker">Dernières publications</span><h2>À lire maintenant</h2></div></div>
                  <div className="proArticleGrid">
                    {articles.slice(1).map(article => (
                      <Link href={'/articles/' + article.slug} className="proArticleTile" key={article.id}>
                        <div className="proArticleTileImage" style={article.cover_url ? { backgroundImage: 'url(' + article.cover_url + ')' } : undefined} />
                        <div className="proArticleTileBody">
                          <span className="proMiniLabel">{article.category || 'Édition'}</span>
                          <h3>{article.title}</h3>
                          <p>{article.excerpt || 'Lire cette publication consacrée au Niger.'}</p>
                          <small>{article.author_name || 'Rédaction'}{article.published_at ? ' · ' + new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(article.published_at)) : ''}</small>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
