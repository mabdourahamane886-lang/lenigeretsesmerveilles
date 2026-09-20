import type { MetadataRoute } from 'next'
import { createClient } from '../lib/supabase/server'

const baseUrl = 'https://lenigeretsesmerveilles.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const staticRoutes = [
    '', '/regions', '/merveilles', '/culture', '/gastronomie',
    '/evenements', '/media', '/carte', '/articles', '/recherche',
    '/contribution', '/a-propos', '/methodologie', '/explorer',
  ].map((path) => ({
    url: baseUrl + path,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' as const : 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }))

  if (!supabase) return staticRoutes

  const [{ data: regions }, { data: wonders }, { data: articles }, { data: events }] = await Promise.all([
    supabase.from('niger_regions').select('slug'),
    supabase.from('niger_wonders').select('slug,updated_at').eq('published', true),
    supabase.from('niger_articles').select('slug,updated_at,published_at').eq('published', true),
    supabase.from('niger_events').select('slug,updated_at').eq('published', true),
  ])

  return [
    ...staticRoutes,
    ...(regions ?? []).map((item) => ({ url: baseUrl + '/regions/' + item.slug, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...(wonders ?? []).filter((item) => item.slug).map((item) => ({ url: baseUrl + '/merveilles/' + item.slug, lastModified: item.updated_at ? new Date(item.updated_at) : new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...(articles ?? []).filter((item) => item.slug).map((item) => ({ url: baseUrl + '/articles/' + item.slug, lastModified: item.updated_at ? new Date(item.updated_at) : item.published_at ? new Date(item.published_at) : new Date(), changeFrequency: 'monthly' as const, priority: 0.75 })),
    ...(events ?? []).filter((item) => item.slug).map((item) => ({ url: baseUrl + '/evenements/' + item.slug, lastModified: item.updated_at ? new Date(item.updated_at) : new Date(), changeFrequency: 'weekly' as const, priority: 0.75 })),
  ]
}
