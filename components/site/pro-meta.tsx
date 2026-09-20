import Script from 'next/script'

export function JsonLd({data}:{data:Record<string, unknown>}) {
  return <Script id={'jsonld-'+Math.random().toString(36).slice(2)} type="application/ld+json" strategy="afterInteractive">{JSON.stringify(data)}</Script>
}

export function BreadcrumbJsonLd({items}:{items:{name:string,url:string}[]}) {
  return <JsonLd data={{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:item.url}))}} />
}

export function VerifiedBadge({sources=0}:{sources?:number}) {
  return <span className="catalogPill" title="Contenu vérifié par l'équipe éditoriale">✓ Vérifié{sources>0 ? ' · '+sources+' source'+(sources>1?'s':'') : ''}</span>
}
