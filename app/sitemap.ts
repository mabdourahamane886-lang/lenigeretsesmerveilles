import type { MetadataRoute } from 'next'
import { createClient } from '../lib/supabase/server'

const baseUrl = 'https://lenigeretsesmerveilles.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const staticRoutes = [
    '', '/regions', '/merveilles', '/culture', '/gastronomie', '/evenements',
    '/media', '/media/explorer', '/carte', '/articles', '/recherche', '/explorer',
    '/contribution', '/a-propos', '/methodologie', '/contact', '/signaler',
    '/autour-de-moi', '/favoris', '/plan-du-site', '/mentions-legales',
    '/politique-confidentialite',
  ].map((path) => ({
    url: baseUrl + path,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' as const : 'weekly' as const,
    priority: path === '' ? 1 : 0.65,
  }))

  if (!supabase) return staticRoutes

  const [{ data: regions }, { data: wonders }, { data: articles }, { data: events }, { data: cultures }, { data: gastronomy }, { data: media }] = await Promise.all([
    supabase.from('niger_regions').select('slug'),
    supabase.from('niger_wonders').select('slug,updated_at').eq('published', true),
    supabase.from('niger_articles').select('slug,updated_at,published_at').eq('published', true),
    supabase.from('niger_events').select('slug,updated_at').eq('published', true),
    supabase.from('niger_cultures').select('slug,updated_at').eq('published', true),
    supabase.from('niger_gastronomy').select('slug,updated_at').eq('published', true),
    supabase.from('niger_media').select('id,created_at').eq('published', true),
  ])

  return [
    ...staticRoutes,
    ...(regions ?? []).filter((x) => x.slug).map((x) => ({ url: baseUrl + '/regions/' + x.slug, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...(wonders ?? []).filter((x) => x.slug).map((x) => ({ url: baseUrl + '/merveilles/' + x.slug, lastModified: x.updated_at ? new Date(x.updated_at) : new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...(articles ?? []).filter((x) => x.slug).map((x) => ({ url: baseUrl + '/articles/' + x.slug, lastModified: x.updated_at ? new Date(x.updated_at) : x.published_at ? new Date(x.published_at) : new Date(), changeFrequency: 'monthly' as const, priority: 0.75 })),
    ...(events ?? []).filter((x) => x.slug).map((x) => ({ url: baseUrl + '/evenements/' + x.slug, lastModified: x.updated_at ? new Date(x.updated_at) : new Date(), changeFrequency: 'weekly' as const, priority: 0.75 })),
    ...(cultures ?? []).filter((x) => x.slug).map((x) => ({ url: baseUrl + '/culture/' + x.slug, lastModified: x.updated_at ? new Date(x.updated_at) : new Date(), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...(gastronomy ?? []).filter((x) => x.slug).map((x) => ({ url: baseUrl + '/gastronomie/' + x.slug, lastModified: x.updated_at ? new Date(x.updated_at) : new Date(), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...(media ?? []).filter((x) => x.id).map((x) => ({ url: baseUrl + '/media/' + x.id, lastModified: x.created_at ? new Date(x.created_at) : new Date(), changeFrequency: 'monthly' as const, priority: 0.5 })),
  ]
}
