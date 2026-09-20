import type {Metadata} from 'next'
import {createClient} from '../../../lib/supabase/server'
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const supabase=await createClient();const {data}=supabase?await supabase.from('niger_regions').select('name,description,cover_url').eq('slug',slug).maybeSingle():{data:null};return {title:data?.name||'Région du Niger',description:data?.description||'Découvrez le patrimoine, la culture et les territoires de cette région du Niger.',openGraph:{title:data?.name||'Région du Niger',description:data?.description||'Explorer le Niger',images:data?.cover_url?[{url:data.cover_url}]:undefined}}}
export default function Layout({children}:{children:React.ReactNode}){return children}
