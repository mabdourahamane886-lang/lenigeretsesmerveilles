export function normalizePublicationContent(content?: string | null) {
  return (content || '')
    .replace(/\\+(?:r\\+n|n|r)/gi, '\n')
    .replace(/\\r\\n?/g, '\n')
    .replace(/\r\n?/g, '\n')
    .trim()
}

function getParagraphs(content?: string | null) {
  return normalizePublicationContent(content)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function getPublicationTitle(content?: string | null) {
  const first = getParagraphs(content)[0] || 'Publication du Niger'
  const sentence = first.split(/[.!?…](?:\s|$)/)[0]?.trim() || first
  return sentence.length > 72 ? sentence.slice(0, 69).trimEnd() + '…' : sentence
}

export function getPublicationBody(content?: string | null) {
  const paragraphs = getParagraphs(content)
  if (paragraphs.length > 1) return paragraphs.slice(1).join('\n\n')
  const first = paragraphs[0] || ''
  const title = getPublicationTitle(content)
  return first === title ? '' : first.slice(title.length).replace(/^[.!?…\s]+/, '').trim()
}

export function getPublicationExcerpt(content?: string | null, maxLength = 112) {
  const body = getPublicationBody(content) || normalizePublicationContent(content)
  const clean = body.replace(/\s+/g, ' ').trim()
  return clean.length > maxLength ? clean.slice(0, maxLength - 1).trimEnd() + '…' : clean
}
