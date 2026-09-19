import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpenText, CalendarDays, UserRound } from 'lucide-react'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import { createClient } from '../../../lib/supabase/server'

export const dynamic='force-dynamic'

export default async function ArticleDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params
  const supabase=await createClient()
  if(!supabase) notFound()
  const {data:article}=await supabase.from('niger_articles').select('title,category,excerpt,content,cover_url,author_name,published_at').eq('slug',slug).eq('published',true).maybeSingle()
  if(!article) notFound()

  return (
    <>
      <Header />
      <main className="page">
        <div className="container narrowEvent">
          <Link className="proBack" href="/articles"><ArrowLeft size={15}/> Tous les articles</Link>
          {article.cover_url ? (
            <article className="proArticleHero" style={{backgroundImage:'linear-gradient(180deg,rgba(4,39,27,.05),rgba(4,39,27,.90)),url(' + article.cover_url + ')'}}>
              <span className="catalogPill">{article.category || 'Édition'}</span>
              <h1>{article.title}</h1>
              <div className="proDetailHeroMeta"><span><UserRound size={14}/>{article.author_name || 'Rédaction'}</span><span><CalendarDays size={14}/>{article.published_at ? new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(article.published_at)) : 'Publication récente'}</span></div>
            </article>
          ) : (
            <div className="plainArticleHeader"><span className="kicker">{article.category || 'Édition'}</span><h1>{article.title}</h1><div className="articleMeta">{article.author_name || 'Rédaction'}</div></div>
          )}
          {article.excerpt && <aside className="articleStandfirst"><BookOpenText size={19}/><div><span>En bref</span><p>{article.excerpt}</p></div></aside>}
          <article className="proseCard articleProse"><div className="prose">{article.content}</div></article>
        </div>
      </main>
      <Footer />
    </>
  )
}
