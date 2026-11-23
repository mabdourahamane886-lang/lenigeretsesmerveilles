import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { regions, regionPhoto } from '../../data/regions'
import styles from './regions.module.css'

export default function RegionCards() {
  return (
    <ul className={styles.grid}>
      {regions.map(region => (
        <li key={region.slug}>
          <Link className={styles.card} href={`/regions/${region.slug}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Card images include external documentary photos. */}
            <img src={regionPhoto(region)} alt="" loading="lazy" decoding="async" />
            <span className={styles.caption}>
              <span>{region.name}</span>
              <ArrowUpRight size={21} aria-hidden="true" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
