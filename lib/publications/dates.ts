const timeZone = 'Africa/Niamey'
const dayKey = new Intl.DateTimeFormat('sv-SE', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
const dayLabel = new Intl.DateTimeFormat('fr-FR', { timeZone, dateStyle: 'full' })
const clock = new Intl.DateTimeFormat('fr-FR', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export function publicationDate(publishedAt?: string | null, createdAt?: string | null) {
  for (const value of [publishedAt, createdAt]) {
    if (!value) continue
    const date = new Date(value)
    if (Number.isFinite(date.getTime())) return date
  }
  return null
}

export function publicationTime(date: Date, includeDay = false) {
  const time = clock.format(date).replace(':', ' h ')
  return includeDay ? `${dayLabel.format(date)} à ${time}` : time
}

export function groupPublications<T extends { published_at: string | null; created_at: string | null; pinned_at?: string | null }>(publications: T[], now = new Date()) {
  const today = dayKey.format(now)
  const yesterday = dayKey.format(new Date(now.getTime() - 86_400_000))
  const entries = publications.map(publication => ({
    publication,
    pinnedTime: publication.pinned_at ? Date.parse(publication.pinned_at) : NaN,
    date: publicationDate(publication.published_at, publication.created_at),
  }))
  entries.sort((a, b) => {
    const pinA = Number.isFinite(a.pinnedTime) ? a.pinnedTime : -Infinity
    const pinB = Number.isFinite(b.pinnedTime) ? b.pinnedTime : -Infinity
    if (pinA !== pinB) return pinB - pinA
    return (b.date?.getTime() ?? -Infinity) - (a.date?.getTime() ?? -Infinity)
  })

  const groups = new Map<string, { key: string; label: string; entries: typeof entries }>()
  for (const entry of entries) {
    const key = Number.isFinite(entry.pinnedTime) ? 'pinned' : entry.date ? dayKey.format(entry.date) : 'undated'
    let group = groups.get(key)
    if (!group) {
      const label = key === 'pinned' ? 'Publications épinglées' : key === today ? 'Aujourd’hui' : key === yesterday ? 'Hier'
        : entry.date ? dayLabel.format(entry.date) : 'Date inconnue'
      group = { key, label, entries: [] }
      groups.set(key, group)
    }
    group.entries.push(entry)
  }
  return [...groups.values()]
}
