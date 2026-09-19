import Link from 'next/link'
import { ArrowRight, Camera, ExternalLink } from 'lucide-react'
import Header from '../../components/site/header'
import Footer from '../../components/site/footer'
import { createClient } from '../../lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const supabase = await createClient()
  const { data: media } = supabase ? await supabase.from('niger_media').select('id,title,description,url,credit').eq('published', true).order('created_at', {ascending:false}) : {data:[]}

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div className="contentHeader contentHeaderLarge"><div><span className="kicker">Photothèque</span><h1>Voir le Niger.</h1><p>Une collection d’images utilisées sur la plateforme, accompagnées de leurs sources et crédits.</p></div><div className="contentHeaderMark"><Camera size={24}/><span>Sources documentées</span></div></div>

          {!media?.length ? (
            <div className="catalogEmpty large"><Camera size={25}/><div><strong>La photothèque est en cours de constitution.</strong><span>Les médias validés depuis l’administration apparaîtront ici.</span></div></div>
          ) : (
            <div className="galleryMasonry">{media.map((item,index)=><figure className={'galleryCard galleryCard-' + (index % 4)} key={item.id}><img src={item.url} alt={item.title} loading="lazy"/><figcaption><div><strong>{item.title}</strong><span>{item.description || 'Image documentaire du Niger.'}</span></div><div className="galleryCredit"><small>{item.credit || 'Crédit non renseigné'}</small><ExternalLink size={12}/></div></figcaption></figure>)}</div>
          )}

          <section className="proPhotoNotice"><Camera size={21}/><div><strong>Une image n’est jamais sans contexte.</strong><p>La plateforme conserve les crédits et les informations de licence pour les médias référencés.</p></div><Link className="textlink" href="/contribution">Proposer une image <ArrowRight size={15}/></Link></section>
        </div>
      </main>
      <Footer />
    </>
  )
}
