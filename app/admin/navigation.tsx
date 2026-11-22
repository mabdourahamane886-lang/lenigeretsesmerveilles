'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, CalendarDays, Camera, Compass, CookingPot, FileText, House, Landmark, Map, Megaphone, MessagesSquare } from 'lucide-react'

const links = [
  { href: '/admin', title: 'Vue d’ensemble', icon: House },
  { href: '/admin/publications', title: 'Publications', icon: MessagesSquare },
  { href: '/admin/articles', title: 'Articles', icon: FileText },
  { href: '/admin/medias', title: 'Photothèque', icon: Camera },
  { href: '/admin/evenements', title: 'Événements', icon: CalendarDays },
  { href: '/admin/regions', title: 'Régions', icon: Map },
  { href: '/admin/merveilles', title: 'Merveilles', icon: Compass },
  { href: '/admin/cultures', title: 'Cultures', icon: Landmark },
  { href: '/admin/gastronomie', title: 'Gastronomie', icon: CookingPot },
  { href: '/admin/contributions', title: 'Contributions', icon: BookOpen },
  { href: '/admin/publicites', title: 'Campagnes', icon: Megaphone },
]

export default function AdminNavigation() {
  const pathname = usePathname()
  return <nav className="editorNav" aria-label="Rubriques de l’administration">
    {links.map(({href, title, icon: Icon}) =>
      <Link href={href} key={href} aria-current={pathname === href ? 'page' : undefined}><Icon size={17} aria-hidden="true"/>{title}</Link>
    )}
  </nav>
}
