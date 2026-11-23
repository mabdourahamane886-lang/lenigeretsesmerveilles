import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChefHat, Utensils } from 'lucide-react'
import Breadcrumbs from '../../../components/site/breadcrumbs'
import ShareButton from '../../../components/site/share-button'
import { JsonLd, VerifiedBadge } from '../../../components/site/pro-meta'
import { createClient } from '../../../lib/supabase/server'
import styles from '../gallery.module.css'
import { gastronomyPhoto, isTamarin, tamarinPhoto } from '../photos'

export const dynamic = 'force-dynamic'

export default async function FoodDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = supabase
    ? await supabase.from('niger_gastronomy').select('*').eq('slug', slug).eq('published', true).maybeSingle()
    : { data: null }
  const item = data ?? (slug === 'jus-de-tamarin' ? {
    name: 'Jus de tamarin',
    description: 'Boisson traditionnelle préparée à partir du tamarin, appréciée pour sa fraîcheur.',
    image_url: tamarinPhoto,
    ingredients: null,
    preparation: null,
    history: null,
  } : null)

  if (!item) notFound()

  const image = gastronomyPhoto(item.name, item.image_url)
  const tamarin = isTamarin(item.name)

  return (
    <main className="page">
      <div className="container narrowEvent">
        <Breadcrumbs items={[{ label: 'Gastronomie', href: '/gastronomie' }, { label: item.name }]} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Recipe',
          name: item.name,
          description: item.description,
          image,
          recipeIngredient: item.ingredients ? String(item.ingredients).split(/[,;\n]+/).map(value => value.trim()).filter(Boolean) : [],
          recipeInstructions: item.preparation || undefined,
          url: 'https://lenigeretsesmerveilles-ngr.vercel.app/gastronomie/' + slug,
        }} />
        {tamarin ? (
          <div className={styles.tamarinBanner}>
            <Image className={styles.bannerPhoto} src={tamarinPhoto} alt="" fill priority sizes="(max-width: 900px) 100vw, 900px" />
            <Image className={styles.bannerLogo} src="/images/gastronomie/logo.webp" alt="Le Niger et ses Merveilles" width={84} height={43} />
            <div className={styles.bannerCopy}><h1>{item.name}</h1></div>
          </div>
        ) : (
          <>
            {image && <div className="proArticleHero" style={{ backgroundImage: 'linear-gradient(180deg,rgba(4,39,27,.05),rgba(4,39,27,.90)),url(' + image + ')' }}><VerifiedBadge /><h1>{item.name}</h1></div>}
            <span className="kicker">Gastronomie nigérienne</span>
            <h1>{item.name}</h1>
          </>
        )}
        <article className="proseCard articleProse">
          <div className="prose">
            <p>{item.description}</p>
            {item.history && <><h2>Histoire</h2><p>{item.history}</p></>}
            {item.ingredients && <><h2><ChefHat size={18} /> Ingrédients</h2><p>{item.ingredients}</p></>}
            {item.preparation && <><h2><Utensils size={18} /> Préparation</h2><p>{item.preparation}</p></>}
          </div>
          {tamarin && <p className={styles.photoCredit}>Photo de <a href="https://commons.wikimedia.org/wiki/File:Le_boisson_naturel_de_tamarin.jpg">Tawaye</a>, redimensionnée · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>}
          <div className="articleShare"><ShareButton title={item.name} /></div>
        </article>
      </div>
    </main>
  )
}
