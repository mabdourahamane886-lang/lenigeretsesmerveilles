import type {Metadata} from 'next'
import {createClient} from '../../../lib/supabase/server'
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const supabase=await createClient();const {data}=supabase?await supabase.from('niger_events').select('name,description,image_url').eq('slug',slug).eq('published',true).maybeSingle():{data:null};return {title:data?.name||'Événement au Niger',description:data?.description||'Agenda culturel du Niger.',openGraph:{title:data?.name||'Événement au Niger',description:data?.description||'Agenda culturel du Niger',images:data?.image_url?[{url:data.image_url}]:undefined}}}
export default function Layout({children}:{children:React.ReactNode}){return children}
