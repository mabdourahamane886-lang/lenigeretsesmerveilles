import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '../admin-auth'
import { createAdminClient } from '../supabase/admin'

export const adminDatabase = cache(async () => {
  if (!(await isAdminAuthenticated())) redirect('/admin-login?next=/admin')
  const database = createAdminClient()
  if (!database) throw new Error('Connexion à la base indisponible.')
  return database
})
