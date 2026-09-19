import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import { createClient } from '../../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  if (!supabase) notFound()
  const { data: article } = await supabase.from('niger_articles').select('title,category,excerpt,content,cover_url,author_name,published_at').eq('slug',slug).eq('published',true).maybeSingle()
  if (!article) notFound()

  return <><Header/><main className="page"><div className="container narrowEvent"><Link className="back" href="/articles">← Tous les articles</Link>
    {article.cover_url ? <div className="articleHero" style={{backgroundImage:`linear-gradient(180deg,rgba(5,45,32,.05),rgba(5,45,32,.9)),url(${article.cover_url})`}}><span className="tag tagLight">{article.category}</span><h1>{article.title}</h1></div> : <><div className="kicker">{article.category}</div><h1>{article.title}</h1></>}
    <p className="articleMeta">{article.author_name}{article.published_at ? ' · ' + new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(article.published_at)) : ''}</p>
    {article.excerpt && <div className="notice"><strong>En bref</strong><p>{article.excerpt}</p></div>}
    <div className="contentCard articleContent"><div className="prose">{article.content}</div></div>
  </div></main><Footer/></>
}
