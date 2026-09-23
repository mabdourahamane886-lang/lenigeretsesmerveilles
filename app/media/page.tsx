import Link from 'next/link'
import { ArrowRight, Camera, ExternalLink } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const supabase = await createClient()
  const { data: media } = supabase ? await supabase.from('niger_media').select('id,title,description,url,credit,media_type,media_category,created_at').eq('published', true).order('created_at', {ascending:false}) : {data:[]}

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="contentHeader contentHeaderLarge"><div><span className="kicker">Photothèque</span><h1>Voir le Niger.</h1><p>Les nouveaux médias envoyés depuis l’administration sont publiés sur Smooth Bundle pour une diffusion CDN rapide, tandis que Supabase conserve les métadonnées.</p></div><div className="contentHeaderMark"><Camera size={24}/><span>Sources documentées</span></div></div>

          {!media?.length ? (
            <div className="catalogEmpty large"><Camera size={25}/><div><strong>La photothèque est en cours de constitution.</strong><span>Les médias validés depuis l’administration apparaîtront ici.</span></div></div>
          ) : (
            <div className="galleryMasonry">{media.map((item,index)=>{const date=item.created_at?new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(item.created_at)):'';return <figure className={'galleryCard galleryCard-' + (index % 4)} key={item.id}>{item.media_type === 'video' ? <video src={item.url} controls preload="metadata" style={{width:'100%',display:'block',aspectRatio:'4/3',objectFit:'cover'}} aria-label={item.title}/> : <img src={item.url} alt={item.title} loading="lazy"/>}<figcaption><div><strong>{item.title}</strong><span>{item.description || 'Média documentaire du Niger.'}</span>{date && <small style={{display:'block',marginTop:6,opacity:.72}}>{date}</small>}</div><div className="galleryCredit"><small>{item.credit || 'Crédit non renseigné'}</small><ExternalLink size={12}/></div></figcaption></figure>})}</div>
          )}

          <section className="proPhotoNotice"><Camera size={21}/><div><strong>Une image n’est jamais sans contexte.</strong><p>La plateforme conserve les crédits et les informations de licence pour les médias référencés.</p></div><Link className="textlink" href="/contribution">Proposer une image <ArrowRight size={15}/></Link></section>
        </div>
      </main>
      <Footer />
    </>
  )
}
