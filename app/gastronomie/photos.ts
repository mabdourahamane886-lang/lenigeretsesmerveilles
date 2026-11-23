export const brochettesPhoto = '/images/gastronomie/brochettes-filingue.webp'
export const tamarinPhoto = '/images/gastronomie/tamarin.webp'

export function isTamarin(name: string) {
  return /\b(?:jus|boisson)\b.*\btamarin\b/i.test(name)
}

export function gastronomyPhoto(name: string, image: string | null) {
  if (isTamarin(name)) return tamarinPhoto
  if (/\bbrochettes?\b/i.test(name)) return brochettesPhoto
  return image
}
