import Link from 'next/link'
import { redirect } from 'next/navigation'
import { clearAdminSession, isAdminAuthenticated } from '../../lib/admin-auth'
import AdminNavigation from './navigation'
import './editor.css'

export const dynamic = 'force-dynamic'

async function logout() {
  'use server'
  await clearAdminSession()
  redirect('/admin-login')
}

export default async function AdminLayout({children}: {children: React.ReactNode}) {
  if (!(await isAdminAuthenticated())) redirect('/admin-login?next=/admin')
  return <div className="editorShell">
    <header className="editorBar"><Link href="/admin"><span aria-hidden="true" className="editorMark">N</span>Le Niger et ses Merveilles</Link>
      <div><Link href="/">Voir le site</Link><form action={logout}><button>Déconnexion</button></form></div>
    </header>
    <div className="editorGrid"><aside><AdminNavigation/></aside><div className="editorContent">{children}</div></div>
  </div>
}
