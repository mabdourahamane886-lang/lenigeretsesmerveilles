import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient()

  if (!supabase) redirect('/admin-login?error=config')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin-login?next=/admin')

  const { data: admin } = await supabase
    .from('niger_admins')
    .select('user_id,role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (!admin) {
    await supabase.auth.signOut()
    redirect('/admin-login?error=unauthorized')
  }

  return children
}
