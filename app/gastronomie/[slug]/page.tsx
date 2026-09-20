import {notFound} from 'next/navigation'
import Link from 'next/link'
import {ArrowLeft,ChefHat,Utensils} from 'lucide-react'
import Header from '../../../components/site/header'
import Footer from '../../../components/site/footer'
import Breadcrumbs from '../../../components/site/breadcrumbs'
import ShareButton from '../../../components/site/share-button'
import {JsonLd,VerifiedBadge} from '../../../components/site/pro-meta'
import {createClient} from '../../../lib/supabase/server'
export const dynamic='force-dynamic'
export default async function FoodDetail({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const supabase=await createClient(); if(!supabase) notFound()
 const {data:item}=await supabase.from('niger_gastronomy').select('*').eq('slug',slug).eq('published',true).maybeSingle(); if(!item) notFound()
 return <><Header/><main className="page"><div className="container narrowEvent"><Breadcrumbs items={[{label:'Gastronomie',href:'/gastronomie'},{label:item.name}]}/><JsonLd data={{'@context':'https://schema.org','@type':'Recipe','name':item.name,'description':item.description,'image':item.image_url,'recipeIngredient':item.ingredients?String(item.ingredients).split(/[,;\\n]+/).map((x:string)=>x.trim()).filter(Boolean):[],'recipeInstructions':item.preparation||undefined,'url':'https://lenigeretsesmerveilles.vercel.app/gastronomie/'+slug}}/>
 {item.image_url&&<div className="proArticleHero" style={{backgroundImage:'linear-gradient(180deg,rgba(4,39,27,.05),rgba(4,39,27,.90)),url('+item.image_url+')'}}><VerifiedBadge/><h1>{item.name}</h1></div>}
 {!item.image_url&&<><span className="kicker">Gastronomie nigérienne</span><h1>{item.name}</h1></>}
 <article className="proseCard articleProse"><div className="prose"><p>{item.description}</p>{item.history&&<><h2>Histoire</h2><p>{item.history}</p></>}{item.ingredients&&<><h2><ChefHat size={18}/> Ingrédients</h2><p>{item.ingredients}</p></>}{item.preparation&&<><h2><Utensils size={18}/> Préparation</h2><p>{item.preparation}</p></>}</div><div className="articleShare"><ShareButton title={item.name}/></div></article>
 <Link className="proBack" href="/gastronomie"><ArrowLeft size={15}/> Retour à la gastronomie</Link>
 </div></main><Footer/></>
}
