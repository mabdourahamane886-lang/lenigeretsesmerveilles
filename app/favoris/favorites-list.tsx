'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Fav = { title: string; url: string }

export default function FavoritesList() {
  const [items, setItems] = useState<Fav[]>([])

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem('niger-favoris') || '[]'))
    } catch {}
  }, [])

  if (!items.length) {
    return (
      <div className="catalogEmpty large">
        <div>
          <strong>Aucun favori pour le moment.</strong>
          <span>Ajoutez des contenus depuis les pages que vous souhaitez retrouver rapidement.</span>
        </div>
        <Link className="proButton proButtonDark" href="/explorer">Explorer</Link>
      </div>
    )
  }

  return (
    <div className="catalogGrid">
      {items.map((x) => (
        <Link className="catalogCard" href={x.url} key={x.url}>
          <div className="catalogBody">
            <h3>{x.title}</h3>
            <span className="cardLink">Ouvrir <span>→</span></span>
          </div>
        </Link>
      ))}
    </div>
  )
}
