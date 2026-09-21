'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AroundClient() {
  const [status, setStatus] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  function locate() {
    if (!navigator.geolocation) {
      setStatus('La géolocalisation n’est pas disponible sur cet appareil.')
      return
    }

    setStatus('Localisation en cours…')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setStatus('Position obtenue. Les contenus géographiques peuvent maintenant être rapprochés de votre zone.')
      },
      () => setStatus('Localisation refusée ou indisponible. Vous pouvez continuer sans partager votre position.')
    )
  }

  return (
    <main className="page">
      <div className="container">
        <span className="kicker">Découverte locale</span>
        <h1>Explorer autour de moi</h1>
        <p className="lead">
          Utilisez votre position uniquement si vous souhaitez rechercher des lieux et contenus proches.
          La position n’est pas enregistrée par cette page.
        </p>
        <button className="proButton proButtonDark" onClick={locate}>
          📍 Utiliser ma position
        </button>
        {status && (
          <div className="notice proNotice" style={{ marginTop: 18 }}>
            <strong>{status}</strong>
            {coords && (
              <p>
                Coordonnées disponibles dans cette session : {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}.
              </p>
            )}
          </div>
        )}
        <div className="themeGrid" style={{ marginTop: 24 }}>
          <Link className="themeCard" href="/carte">
            <h3>Carte du Niger</h3>
            <p>Explorer les territoires et les points documentés.</p>
          </Link>
          <Link className="themeCard" href="/evenements">
            <h3>Événements</h3>
            <p>Voir l’agenda culturel publié.</p>
          </Link>
          <Link className="themeCard" href="/merveilles">
            <h3>Merveilles</h3>
            <p>Découvrir les lieux et patrimoines.</p>
          </Link>
        </div>
      </div>
    </main>
  )
}
