'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '../../lib/supabase/admin'
import { isAdminAuthenticated } from '../../lib/admin-auth'

const t=(f:FormData,n:string)=>String(f.get(n)||'').trim()||null
const on=(f:FormData,n:string)=>f.get(n)==='on'
const slugify=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
const num=(f:FormData,n:string)=>{const v=t(f,n);if(!v)return null;const x=Number(v);return Number.isFinite(x)?x:null}
const dt=(f:FormData,n:string)=>{const v=t(f,n);return v?new Date(v).toISOString():null}
async function db(){if(!(await isAdminAuthenticated()))throw new Error('Connexion administrateur requise.');const s=createAdminClient();if(!s)throw new Error('La connexion sécurisée à la base de données n’est pas configurée.');return s}
function refresh(...p:string[]){p.forEach((path)=>revalidatePath(path))}

async function uploadToSupabaseStorage(s:SupabaseClient,file:File,path:string){
 const bucket='niger-media'
 const {error}=await s.storage.from(bucket).upload(path,file,{contentType:file.type||'application/octet-stream',upsert:false,cacheControl:'31536000'})
 if(error) throw new Error(error.message)
 const {data}=s.storage.from(bucket).getPublicUrl(path)
 if(!data?.publicUrl) throw new Error('Aucune URL publique n’a été générée.')
 return {url:data.publicUrl}
}

export async function createMedia(f:FormData){
 if (!(await isAdminAuthenticated())) redirect('/admin-login?next=/admin/medias')

 const fail=(message:string)=>{
  redirect('/admin/medias?error='+encodeURIComponent(message))
 }

 const s=createAdminClient()
 if(!s){fail('La connexion sécurisée à la base de données n’est pas configurée.');return}

 const title=String(f.get('title')||'').trim()
 const credit=t(f,'credit')
 const url=t(f,'url')
 if(!title){fail('Le titre est obligatoire.');return}
 if(!credit){fail('Le crédit / la licence est obligatoire.');return}

 const category=String(f.get('media_category')||'photo')
 const selected=String(f.get('media_type')||'photo')
 if(!['photo','illustration','patrimoine','tourisme','culture','evenement'].includes(category)){
  fail('Catégorie média invalide.');return
 }

 const files=['media_file','photo_gallery_file','video_gallery_file','camera_file','video_camera_file','video_file','image_file']
  .map(n=>f.get(n))
  .filter((x):x is File=>x instanceof File&&x.size>0)

 let mediaUrl=url
 let mediaType=selected
 const file=files[0]

 if(file){
  const image=file.type.startsWith('image/')
  const video=file.type.startsWith('video/')
  if(!image&&!video){fail('Le fichier doit être une image ou une vidéo.');return}
  if(file.size>50*1024*1024){fail('Le fichier ne doit pas dépasser 50 Mo.');return}

  mediaType=video?'video':'photo'
  const ext=file.name.split('.').pop()?.toLowerCase()||(video?'mp4':'jpg')

  try{
   const uploaded=await uploadToSupabaseStorage(s,
    file,
    `gallery/${mediaType}/${new Date().getUTCFullYear()}/${Date.now()}-${slugify(title)}.${ext}`
   )
   mediaUrl=uploaded.url
  }catch(error){
   const message=error instanceof Error?error.message:'Échec de l’envoi du fichier.'
   fail('Upload du média impossible : '+message)
   return
  }
 }

 if(!mediaUrl){fail('Sélectionne une photo/vidéo ou indique une URL.');return}

 const {error}=await s.from('niger_media').insert({
  title,
  description:t(f,'description')||'',
  media_type:mediaType,
  media_category:category,
  url:mediaUrl,
  credit,
  region_id:t(f,'region_id'),
  wonder_id:t(f,'wonder_id'),
  published:on(f,'published')
 })

 if(error){
  fail('Impossible d’enregistrer le média : '+error.message)
  return
 }

 refresh('/admin/medias','/media','/')
 redirect('/admin/medias?success=1')
}

export async function createArticle(f:FormData){
 const s=await db(),title=String(f.get('title')||'').trim(),content=String(f.get('content')||'').trim();if(!title||!content)throw new Error('Le titre et le contenu sont obligatoires.')
 const base=slugify(title)||`publication-${Date.now()}`,{data:old}=await s.from('niger_articles').select('id').eq('slug',base).maybeSingle(),slug=old?`${base}-${Date.now().toString().slice(-6)}`:base
 const published=on(f,'published');const {error}=await s.from('niger_articles').insert({title,slug,excerpt:t(f,'excerpt')||'',content,category:t(f,'category')||'culture',region_id:t(f,'region_id'),cover_url:t(f,'cover_url'),author_name:t(f,'author_name')||'Le Niger et ses Merveilles',published,published_at:published?new Date().toISOString():null})
 if(error)throw new Error(`Impossible d’enregistrer la publication : ${error.message}`);refresh('/admin/articles','/articles','/');return{slug}
}

export async function createWonder(f:FormData){const s=await db(),name=String(f.get('name')||'').trim();if(!name)throw new Error('Le nom est obligatoire.');const base=slugify(name)||`merveille-${Date.now()}`,{data:old}=await s.from('niger_wonders').select('id').eq('slug',base).maybeSingle(),slug=old?`${base}-${Date.now().toString().slice(-6)}`:base;const {error}=await s.from('niger_wonders').insert({name,slug,category_id:t(f,'category_id'),region_id:t(f,'region_id'),short_description:t(f,'short_description')||'',description:t(f,'description')||'',history:t(f,'history')||'',why_visit:t(f,'why_visit')||'',latitude:num(f,'latitude'),longitude:num(f,'longitude'),cover_url:t(f,'cover_url'),video_url:t(f,'video_url'),published:on(f,'published'),featured:on(f,'featured')});if(error)throw new Error(`Impossible d’enregistrer la merveille : ${error.message}`);refresh('/admin/merveilles','/merveilles','/')}

export async function createRegion(f:FormData){const s=await db(),name=String(f.get('name')||'').trim();if(!name)throw new Error('Le nom de la région est obligatoire.');const {error}=await s.from('niger_regions').insert({name,slug:slugify(name),description:t(f,'description')||'',cover_url:t(f,'cover_url')});if(error)throw new Error(`Impossible d’enregistrer la région : ${error.message}`);refresh('/admin/regions','/regions','/')}

export async function createCulture(f:FormData){const s=await db(),title=String(f.get('title')||'').trim();if(!title)throw new Error('Le titre est obligatoire.');const {error}=await s.from('niger_cultures').insert({title,slug:`${slugify(title)||'culture'}-${Date.now().toString().slice(-6)}`,region_id:t(f,'region_id'),language:t(f,'language'),traditions:t(f,'traditions'),clothing:t(f,'clothing'),gastronomy:t(f,'gastronomy'),music_dance:t(f,'music_dance'),crafts:t(f,'crafts'),festivals:t(f,'festivals'),history:t(f,'history'),cover_url:t(f,'cover_url'),published:on(f,'published')});if(error)throw new Error(`Impossible d’enregistrer la culture : ${error.message}`);refresh('/admin/cultures','/culture','/')}

export async function createGastronomy(f:FormData){const s=await db(),name=String(f.get('name')||'').trim();if(!name)throw new Error('Le nom du plat est obligatoire.');const {error}=await s.from('niger_gastronomy').insert({name,region_id:t(f,'region_id'),description:t(f,'description')||'',ingredients:t(f,'ingredients')||'',preparation:t(f,'preparation')||'',history:t(f,'history')||'',image_url:t(f,'image_url'),video_url:t(f,'video_url'),published:on(f,'published')});if(error)throw new Error(`Impossible d’enregistrer le plat : ${error.message}`);refresh('/admin/gastronomie','/gastronomie','/')}

export async function createEvent(f:FormData){const s=await db(),name=String(f.get('name')||'').trim();if(!name)throw new Error('Le nom de l’événement est obligatoire.');const slug=`${slugify(name)||'evenement'}-${Date.now().toString().slice(-6)}`;const {error}=await s.from('niger_events').insert({name,slug,region_id:t(f,'region_id'),city:t(f,'city'),starts_at:dt(f,'starts_at'),ends_at:dt(f,'ends_at'),description:t(f,'description')||'',program:t(f,'program')||'',location:t(f,'location'),image_url:t(f,'image_url'),published:on(f,'published')});if(error)throw new Error(`Impossible d’enregistrer l’événement : ${error.message}`);refresh('/admin/evenements','/evenements','/');return{slug}}

export async function createAdvertisement(f:FormData){const s=await db(),name=String(f.get('name')||'').trim(),title=String(f.get('title')||'').trim();if(!name||!title)throw new Error('Le nom et le titre sont obligatoires.');const {error}=await s.from('niger_advertisements').insert({name,title,body:t(f,'body')||'',media_url:t(f,'media_url'),media_type:t(f,'media_url')?'image':'text',cta_label:t(f,'cta_label'),destination_url:t(f,'destination_url'),starts_at:dt(f,'starts_at'),ends_at:dt(f,'ends_at'),placement:t(f,'placement')||'home',active:on(f,'active')});if(error)throw new Error(`Impossible d’enregistrer la campagne : ${error.message}`);refresh('/admin/publicites','/')}

export async function reviewContribution(f:FormData){const s=await db(),id=t(f,'id'),status=t(f,'status');if(!id||!['pending','approved','rejected'].includes(status||''))throw new Error('Action de modération invalide.');const {error}=await s.from('niger_contributions').update({status,reviewer_notes:t(f,'reviewer_notes')}).eq('id',id);if(error)throw new Error(`Impossible de mettre à jour la contribution : ${error.message}`);refresh('/admin/contributions','/admin')}


export async function createPublication(f:FormData){
 const s=await db()
 const contentText=String(f.get('content')||'').trim()
 const visibility=String(f.get('visibility')||'public')
 if(!contentText && !f.get('media_file')) throw new Error('Ajoute un texte ou une photo/vidéo avant de publier.')
 if(!['public','private'].includes(visibility)) throw new Error('Visibilité invalide.')
 const mediaFile=f.get('media_file')
 const musicFile=f.get('music_file')
 let mediaUrl:string|null=null
 let mediaType:'none'|'photo'|'video'='none'
 let musicUrl:string|null=null
 if(mediaFile instanceof File && mediaFile.size>0){
   if(mediaFile.size>50*1024*1024) throw new Error('La photo ou vidéo ne doit pas dépasser 50 Mo.')
   if(!mediaFile.type.startsWith('image/') && !mediaFile.type.startsWith('video/')) throw new Error('Le média doit être une image ou une vidéo.')
   mediaType=mediaFile.type.startsWith('video/')?'video':'photo'
   const ext=mediaFile.name.split('.').pop()?.toLowerCase()||(mediaType==='video'?'mp4':'jpg')
   mediaUrl=(await uploadToSupabaseStorage(s,mediaFile,`publications/${mediaType}/${new Date().getUTCFullYear()}/${Date.now()}-${slugify(mediaFile.name)}.${ext}`)).url
 }
 if(musicFile instanceof File && musicFile.size>0){
   if(musicFile.size>25*1024*1024) throw new Error('Le fichier audio ne doit pas dépasser 25 Mo.')
   if(!musicFile.type.startsWith('audio/')) throw new Error('Le fichier Musique doit être un fichier audio.')
   const ext=musicFile.name.split('.').pop()?.toLowerCase()||'mp3'
   musicUrl=(await uploadToSupabaseStorage(s,musicFile,`publications/music/${new Date().getUTCFullYear()}/${Date.now()}-${slugify(musicFile.name)}.${ext}`)).url
 }
 const tagged=String(f.get('tagged_people')||'').split(',').map(v=>v.trim()).filter(Boolean).slice(0,20)
 const {error}=await s.from('niger_publications').insert({
   author_name:'Le Niger et ses Merveilles NE', content:contentText, media_url:mediaUrl, media_type:mediaType, music_url:musicUrl,
   tagged_people:tagged, location:t(f,'location'), mood:t(f,'mood'), activity:t(f,'activity'), allow_messages:on(f,'allow_messages'),
   visibility, published:true, published_at:new Date().toISOString(),
 })
 if(error) throw new Error('Impossible de publier : '+error.message)
 refresh('/admin/publications','/publications','/')
}


async function fetchCodaRows(){
 const token=process.env.CODA_API_TOKEN?.trim()
 const docId=process.env.CODA_PUBLICATIONS_DOC_ID?.trim()||'gi4RXbIIVE'
 const tableId=process.env.CODA_PUBLICATIONS_TABLE_ID?.trim()||'grid-iR0ZFog7KM'
 if(!token) throw new Error('La synchronisation Coda n’est pas configurée. Ajoute CODA_API_TOKEN dans les variables d’environnement du site.')
 const rows:any[]=[]
 let pageToken=''
 do{
   const url=new URL(\`https://coda.io/apis/v1/docs/\${docId}/tables/\${tableId}/rows\`)
   url.searchParams.set('useColumnNames','true')
   url.searchParams.set('valueFormat','simple')
   url.searchParams.set('limit','100')
   if(pageToken) url.searchParams.set('pageToken',pageToken)
   const response=await fetch(url.toString(),{headers:{Authorization:\`Bearer \${token}\`},cache:'no-store'})
   if(!response.ok) throw new Error(\`Coda a répondu HTTP \${response.status}. Vérifie le jeton Coda et les identifiants du document.\`)
   const body=await response.json()
   rows.push(...(body.items||[]))
   pageToken=body.nextPageToken||''
 }while(pageToken)
 return rows
}

function codaText(value:unknown){
 if(value==null) return ''
 if(typeof value==='string'||typeof value==='number'||typeof value==='boolean') return String(value)
 if(Array.isArray(value)) return value.map(codaText).filter(Boolean).join(', ')
 if(typeof value==='object'&&value&&'name' in value) return String((value as {name?:unknown}).name||'')
 return ''
}

export async function syncCodaPublications(){
 const s=await db()
 const rows=await fetchCodaRows()
 let created=0,updated=0
 for(const row of rows){
   const values=(row.values||{}) as Record<string,unknown>
   const title=codaText(values['Titre']).trim()
   const body=codaText(values['Contenu']).trim()
   const image=codaText(values['Image URL']).trim()||null
   const type=codaText(values['Type']).trim()
   const status=codaText(values['Statut']).trim()
   const visibility=codaText(values['Visibilité']).trim()||'public'
   const location=codaText(values['Lieu']).trim()||null
   const dateValue=codaText(values['Date de publication']).trim()
   if(!title&&!body) continue
   const published=status==='Publié' && visibility==='public'
   const content=title && body ? \`**\${title}**\\n\\n\${body}\` : (title||body)
   const mediaType=type==='video'?'video':type==='photo'?'photo':'none'
   const publishedAt=dateValue && !Number.isNaN(Date.parse(dateValue)) ? new Date(dateValue).toISOString() : new Date().toISOString()
   const payload={
     coda_row_id:String(row.id),
     author_name:'Le Niger et ses Merveilles NE',
     content,
     media_url:image,
     media_type:mediaType,
     music_url:null,
     tagged_people:[],
     location,
     mood:null,
     activity:null,
     allow_messages:false,
     visibility,
     published,
     published_at:published?publishedAt:null
   }
   const {data:existing,error:findError}=await s.from('niger_publications').select('id').eq('coda_row_id',String(row.id)).maybeSingle()
   if(findError) throw new Error('Lecture Supabase impossible : '+findError.message)
   if(existing){
     const {error}=await s.from('niger_publications').update(payload).eq('id',existing.id)
     if(error) throw new Error('Mise à jour de publication impossible : '+error.message)
     updated++
   }else{
     const {error}=await s.from('niger_publications').insert(payload)
     if(error) throw new Error('Création de publication impossible : '+error.message)
     created++
   }
 }
 refresh('/admin/publications','/publications','/')
 return {created,updated,total:rows.length}
}
