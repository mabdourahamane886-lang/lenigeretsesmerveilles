import {notFound} from 'next/navigation'
import Link from 'next/link'
import {ArrowLeft,MapPin,ExternalLink} from 'lucide-react'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import Breadcrumbs from '../../../components/site/breadcrumbs'
import ShareButton from '../../../components/site/share-button'
import {JsonLd,VerifiedBadge} from '../../../components/site/pro-meta'
import {createClient} from '../../../lib/supabase/server'

export const dynamic='force-dynamic'
export default async function WonderPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const supabase=await createClient(); if(!supabase) notFound()
 const {data:item}=await supabase.from('niger_wonders').select('*').eq('slug',slug).eq('published',true).maybeSingle(); if(!item) notFound()
 const json:any={'@context':'https://schema.org','@type':'TouristAttraction','name':item.name,'description':item.description||item.short_description,'image':item.cover_url,'address':{'@type':'PostalAddress','addressCountry':'NE'},'url':'https://lenigeretsesmerveilles.vercel.app/merveilles/'+slug}
 return <><Header/><main className="page"><div className="container narrowEvent"><Breadcrumbs items={[{label:'Merveilles',href:'/merveilles'},{label:item.name}]}/><JsonLd data={json}/>
 {item.cover_url&&<div className="proArticleHero" style={{backgroundImage:'linear-gradient(180deg,rgba(4,39,27,.05),rgba(4,39,27,.90)),url('+item.cover_url+')'}}><VerifiedBadge/><h1>{item.name}</h1></div>}
 {!item.cover_url&&<><span className="kicker">Patrimoine du Niger</span><h1>{item.name}</h1></>}
 <div className="proseCard articleProse"><div className="prose"><p>{item.short_description}</p><h2>Description</h2><p>{item.description||'Cette fiche patrimoniale sera enrichie avec des informations documentaires vérifiées.'}</p>{item.history&&<><h2>Histoire</h2><p>{item.history}</p></>}{item.location&&<p><MapPin size={16}/> {item.location}</p>}</div><div className="articleShare"><ShareButton title={item.name}/></div></div>
 <Link className="proBack" href="/merveilles"><ArrowLeft size={15}/> Toutes les merveilles</Link>
 </div></main><Footer/></>
}
