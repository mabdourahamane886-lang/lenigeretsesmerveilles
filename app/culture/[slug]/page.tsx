import {notFound} from 'next/navigation'
import Link from 'next/link'
import {ArrowLeft,BookOpenText} from 'lucide-react'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import Breadcrumbs from '../../../components/site/breadcrumbs'
import ShareButton from '../../../components/site/share-button'
import {JsonLd,VerifiedBadge} from '../../../components/site/pro-meta'
import {createClient} from '../../../lib/supabase/server'
export const dynamic='force-dynamic'
export default async function CultureDetail({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const supabase=await createClient(); if(!supabase) notFound()
 const {data:item}=await supabase.from('niger_cultures').select('*').eq('slug',slug).eq('published',true).maybeSingle(); if(!item) notFound()
 return <><Header/><main className="page"><div className="container narrowEvent"><Breadcrumbs items={[{label:'Culture',href:'/culture'},{label:item.title}]}/><JsonLd data={{'@context':'https://schema.org','@type':'Article','headline':item.title,'description':item.history||item.traditions,'image':item.cover_url,'url':'https://lenigeretsesmerveilles.vercel.app/culture/'+slug}}/>
 {item.cover_url&&<div className="proArticleHero" style={{backgroundImage:'linear-gradient(180deg,rgba(4,39,27,.05),rgba(4,39,27,.90)),url('+item.cover_url+')'}}><VerifiedBadge/><h1>{item.title}</h1></div>}
 {!item.cover_url&&<><span className="kicker">Culture & mémoire</span><h1>{item.title}</h1></>}
 <aside className="articleStandfirst"><BookOpenText size={19}/><div><span>Fiche culturelle</span><p>{item.language||'Patrimoine culturel du Niger'}</p></div></aside>
 <article className="proseCard articleProse"><div className="prose">{item.history&&<><h2>Histoire</h2><p>{item.history}</p></>}{item.traditions&&<><h2>Traditions</h2><p>{item.traditions}</p></>}</div><div className="articleShare"><ShareButton title={item.title}/></div></article>
 <Link className="proBack" href="/culture"><ArrowLeft size={15}/> Retour à la culture</Link>
 </div></main><Footer/></>
}
