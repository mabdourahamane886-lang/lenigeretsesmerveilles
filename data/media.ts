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
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger%2C_Agadez_%2828%29%2C_grand_mosque%2C_old_city.jpg?width=1800',
    source: 'Wikimedia Commons', author: 'Vincent van Zeijst', license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Niger,_Agadez_(28),_grand_mosque,_old_city.jpg',
    alt: 'Grande Mosquée du centre historique d’Agadez, Niger',
  },
  tenere: {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Zibar_sand_dunes.jpg?width=1200',
    source: 'Wikimedia Commons', author: 'NASA', license: 'Domaine public',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Zibar_sand_dunes.jpg',
    alt: 'Dunes du désert du Ténéré, Niger',
  },
  niamey: {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger_River_%C3%A0_Niamey.jpg?width=1800',
    source: 'Wikimedia Commons', author: 'Barke11', license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Niger_River_à_Niamey.jpg',
    alt: 'Fleuve Niger à Niamey, Niger',
  },
  zinder: {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Zinder_%286328132791%29.jpg?width=1800',
    source: 'Wikimedia Commons', author: 'Roland', license: 'CC BY-SA 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Zinder_(6328132791).jpg',
    alt: 'Palais du Sultan à Zinder, Niger',
  },
  parcW: {
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Niger_Parc_W_%28358428379%29.jpg?width=1600',
    source: 'Wikimedia Commons', author: 'Mathieu Dessus', license: 'CC BY-SA 2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Niger_Parc_W_(358428379).jpg',
    alt: 'Parc national du W du Niger',
  },
}

export function mediaCredit(media?: NigerMedia) {
  return media ? `${media.source} · ${media.author} · ${media.license}` : null
}