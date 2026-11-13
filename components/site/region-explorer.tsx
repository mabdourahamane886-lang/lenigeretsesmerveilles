'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowUpRight, Search, MapPin } from 'lucide-react'

export type RegionCardItem = {
  id: string
  name: string
  slug: string
  image?: string | null
  description?: string | null
}

export default function RegionExplorer({ regions }: { regions: RegionCardItem[] }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('fr')
    if (!normalized) return regions
    return regions.filter((region) =>
      [region.name, region.description, region.slug].some((value) =>
        value?.toLocaleLowerCase('fr').includes(normalized),
      ),
    )
  }, [query, regions])

  return (
    <div>
      <div className="regionExplorerTools">
        <label className="regionSearch">
          <Search size={19} aria-hidden="true" />
          <span className="sr-only">Rechercher une région</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une région…"
          />
          <span className="regionSearchCount">{filtered.length}/8</span>
        </label>
        <p className="regionExplorerHint">Huit régions, huit identités à découvrir.</p>
      </div>

      {filtered.length ? (
        <div className="regionShowcaseGrid">
          {filtered.map((region) => {
            const number = String(regions.findIndex((item) => item.slug === region.slug) + 1).padStart(2, '0')
            return (
              <article className="regionShowcaseCard" key={region.id}>
                <Link href={`/regions/${region.slug}`} className="regionShowcaseLink" aria-label={`Explorer la région de ${region.name}`}>
                  <div className="regionShowcaseVisual">
                    {region.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={region.image} alt={`Paysage et patrimoine de la région de ${region.name}, Niger`} loading="lazy" />
                    ) : <div className="regionShowcaseFallback" />}
                    <div className="regionShowcaseShade" />
                    <span className="regionShowcaseNumber">{number} <i /> 08</span>
                    <span className="regionShowcaseLocation"><MapPin size={13} /> Niger · Afrique de l’Ouest</span>
                    <span className="regionShowcaseArrow" aria-hidden="true"><ArrowUpRight size={21} /></span>
                    <div className="regionShowcaseCopy">
                      <span className="regionShowcaseEyebrow">Explorer le territoire</span>
                      <h2>{region.name}</h2>
                      <p>{region.description || 'Découvrez les paysages, les traditions et le patrimoine de cette région.'}</p>
                    </div>
                  </div>
                  <div className="regionShowcaseFooter">
                    <span>Découvrir la région</span>
                    <span className="regionShowcaseFooterArrow"><ArrowUpRight size={17} /></span>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="regionNoResults">
          <strong>Aucune région trouvée.</strong>
          <span>Essayez un autre nom ou un autre mot-clé.</span>
          <button type="button" onClick={() => setQuery('')}>Effacer la recherche</button>
        </div>
      )}
    </div>
  )
}
