export type NigerMedia = {
  image: string
  source: 'Wikimedia Commons'
  author: string
  license: string
  sourceUrl: string
  alt: string
}

export const nigerMedia: Record<string, NigerMedia> = {
  agadez: {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Grand_Mosque_Agadez.jpg?width=1800',
    source: 'Wikimedia Commons',
    author: 'Aminucrus',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Grand_Mosque_Agadez.jpg',
    alt: 'Grande Mosquée d’Agadez, Niger',
  },
  tenere: {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Zibar_sand_dunes.jpg?width=1600',
    source: 'Wikimedia Commons',
    author: 'NASA',
    license: 'Domaine public',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Zibar_sand_dunes.jpg',
    alt: 'Dunes de sable du Ténéré, Niger',
  },
  niamey: {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger%20river%20in%20Niamey.jpg?width=1800',
    source: 'Wikimedia Commons',
    author: 'diasUndKompott',
    license: 'CC BY-SA 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Niger_river_in_Niamey.jpg',
    alt: 'Fleuve Niger à Niamey',
  },
  zinder: {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Old_town_of_Zinder.jpg?width=1800',
    source: 'Wikimedia Commons',
    author: 'Roland',
    license: 'CC BY-SA 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Old_town_of_Zinder.jpg',
    alt: 'Vieille ville de Zinder, Niger',
  },
  tenereTree: {
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Le_reste_de_l%27arbre_du_T%C3%A9n%C3%A9r%C3%A9_au_mus%C3%A9e_national_du_Niger.jpg?width=1600",
    source: 'Wikimedia Commons',
    author: 'Amadouibrahim2',
    license: 'CC BY-SA 4.0',
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Le_reste_de_l%27arbre_du_Ténéré_au_musée_national_du_Niger.jpg",
    alt: 'Reste de l’arbre du Ténéré au Musée national du Niger',
  },
}

export function mediaCredit(media?: NigerMedia) {
  if (!media) return null
  return `${media.source} · ${media.author} · ${media.license}`
}
