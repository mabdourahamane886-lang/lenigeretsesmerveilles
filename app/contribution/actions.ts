'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

const clean = (value: FormDataEntryValue | null, max = 5000) => String(value || '').trim().slice(0, max)

export async function submitContribution(formData: FormData) {
  if (clean(formData.get('website'), 200)) redirect('/contribution?sent=1')

  const name = clean(formData.get('name'), 120)
  const email = clean(formData.get('email'), 180)
  const category = clean(formData.get('type'), 60) || 'découverte'
  const title = clean(formData.get('title'), 180)
  const description = clean(formData.get('description'), 5000)
  const history = clean(formData.get('history'), 5000)
  const location = clean(formData.get('location'), 250)

  if (!name || !title || !description) redirect('/contribution?error=missing')

  const supabase = await createClient()
  if (!supabase) redirect('/contribution?error=config')

  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('niger_contributions').insert({
    user_id: user?.id ?? null,
    contributor_name: name,
    contributor_email: email || null,
    category,
    title,
    description,
    history,
    location: location || null,
    status: 'pending',
    media: [],
  })

  if (error) redirect('/contribution?error=submit')
  redirect('/contribution?sent=1')
}
