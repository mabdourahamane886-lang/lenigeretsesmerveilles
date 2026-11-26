import { isAdminAuthenticated } from '../../../lib/admin-auth'
import { publicationBucket, publicationKey, publicationPhotoPattern } from '../../../lib/publications/r2'
import { createAdminClient } from '../../../lib/supabase/admin'

export const dynamic = 'force-dynamic'
const types: Record<string,string> = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif','image/gif':'gif'}
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({error:'Accès interdit'},{status:403})
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({error:'Origine interdite'},{status:403})
  const bucket = await publicationBucket()
  if (!bucket) return Response.json({error:'R2 indisponible'},{status:503})
  const length = Number(request.headers.get('content-length'))
  if (length > 55 * 1024 * 1024) return Response.json({error:'Fichier trop volumineux'},{status:413})
  const form = await request.formData()
  const photo = form.get('photo'), preview = form.get('preview')
  if (!(photo instanceof File) || !(preview instanceof File) || !Object.hasOwn(types,photo.type) || !photo.size || photo.size > 50*1024*1024 || preview.type !== 'image/jpeg' || !preview.size || preview.size > 2*1024*1024)
    return Response.json({error:'Photo ou aperçu invalide'},{status:400})
  const folder = 'publications/photos/' + crypto.randomUUID()
  const path = folder + '/photo.' + types[photo.type]
  try {
    await bucket.put(publicationKey(path),await photo.arrayBuffer(),{httpMetadata:{contentType:photo.type}})
    await bucket.put(publicationKey(folder+'/partage.jpg'),await preview.arrayBuffer(),{httpMetadata:{contentType:'image/jpeg'}})
  } catch {
    await Promise.allSettled([bucket.delete(publicationKey(path)),bucket.delete(publicationKey(folder+'/partage.jpg'))])
    return Response.json({error:'Échec du transfert'},{status:502})
  }
  return Response.json({path:'r2:'+path})
}

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') || ''
  if (!publicationPhotoPattern.test(path)) return new Response(null,{status:404})
  const db = createAdminClient()
  if (!db) return new Response(null,{status:503})
  const folder = path.slice(0,path.lastIndexOf('/'))
  const candidates = ['jpg','png','webp','avif','gif'].map(ext=>'/api/publication-photo?path='+folder+'/photo.'+ext)
  const {data,error} = await db.from('niger_publications').select('id').in('media_url',candidates).eq('published',true).eq('visibility','public').limit(1)
  if (error) return new Response(null,{status:503})
  if (!data?.length && !(await isAdminAuthenticated())) return new Response(null,{status:404})
  const bucket = await publicationBucket()
  if (!bucket) return new Response(null,{status:503})
  const file = await bucket.get(publicationKey(path))
  if (!file) return new Response(null,{status:404})
  return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType || 'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}})
}
