import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "../../../../lib/supabase/admin"
import { decryptTikTokTokens, encryptTikTokTokens, tiktokApiBase, tiktokClientKey, tiktokClientSecret } from "../../../../lib/tiktok"

export const runtime = "edge"
export const maxDuration = 60

type Tokens = {
  access_token: string
  refresh_token: string
  open_id: string
  expires_at: number
  refresh_expires_at: number
  scope: string
}

async function refreshAccessToken(tokens: Tokens): Promise<Tokens> {
  if (tokens.expires_at > Math.floor(Date.now() / 1000) + 300) return tokens
  if (tokens.refresh_expires_at <= Math.floor(Date.now() / 1000)) throw new Error("TikTok refresh token expired; reconnect the account.")

  const body = new URLSearchParams({
    client_key: tiktokClientKey(),
    client_secret: tiktokClientSecret(),
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
  })
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  })
  const result = await response.json() as { data?: { access_token?: string; refresh_token?: string; expires_in?: number; refresh_expires_in?: number; open_id?: string; scope?: string }; error?: { code?: string; message?: string } }
  if (!response.ok || !result.data?.access_token || !result.data.refresh_token) {
    throw new Error(result.error?.code || "TikTok token refresh failed.")
  }
  const now = Math.floor(Date.now() / 1000)
  return {
    access_token: result.data.access_token,
    refresh_token: result.data.refresh_token,
    open_id: result.data.open_id || tokens.open_id,
    expires_at: now + Number(result.data.expires_in || 86400),
    refresh_expires_at: now + Number(result.data.refresh_expires_in || 31536000),
    scope: result.data.scope || tokens.scope,
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.NIGER_MEDIA_CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  if (!supabase) return NextResponse.json({ error: "database_not_configured" }, { status: 500 })

  const { data: job, error: queueError } = await supabase
    .from("niger_publication_deliveries")
    .select("id,publication_id,platform,attempts")
    .eq("platform", "tiktok")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (queueError) return NextResponse.json({ error: "queue_read_failed", code: queueError.code, message: queueError.message }, { status: 500 })
  if (!job) return NextResponse.json({ ok: true, processed: 0 })

  const { data: claimed, error: claimError } = await supabase
    .from("niger_publication_deliveries")
    .update({ status: "processing", attempts: Number(job.attempts || 0) + 1, updated_at: new Date().toISOString(), last_error: null })
    .eq("id", job.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle()

  if (claimError || !claimed) return NextResponse.json({ ok: true, processed: 0, reason: "already_claimed" })

  try {
    const [{ data: publication, error: publicationError }, { data: account, error: accountError }] = await Promise.all([
      supabase.from("niger_publications").select("content,media_url,media_type").eq("id", job.publication_id).single(),
      supabase.from("niger_social_accounts").select("token_ciphertext,token_iv").eq("platform", "tiktok").order("connected_at", { ascending: false }).limit(1).maybeSingle(),
    ])
    if (publicationError || !publication) throw new Error("Publication introuvable.")
    if (accountError || !account) throw new Error("Compte TikTok non connecté.")
    if (publication.media_type !== "video" || !publication.media_url) {
      throw new Error("TikTok Inbox exige actuellement une vidéo pour ce connecteur. Les photos et publications texte restent en attente.")
    }

    let tokens = await decryptTikTokTokens(account.token_ciphertext, account.token_iv) as Tokens
    tokens = await refreshAccessToken(tokens)
    const refreshed = await encryptTikTokTokens(tokens)
    await supabase.from("niger_social_accounts").update({
      token_ciphertext: refreshed.ciphertext,
      token_iv: refreshed.iv,
      updated_at: new Date().toISOString(),
    }).eq("platform", "tiktok").eq("account_id", tokens.open_id)

    const mediaResponse = await fetch(publication.media_url, { cache: "no-store" })
    if (!mediaResponse.ok) throw new Error("Impossible de télécharger la vidéo depuis le stockage média.")
    const media = await mediaResponse.arrayBuffer()
    if (media.byteLength > 50 * 1024 * 1024) throw new Error("La vidéo dépasse la limite interne de 50 Mo.")
    const mime = mediaResponse.headers.get("content-type")?.split(";")[0] || "video/mp4"
    const initResponse = await fetch(`${tiktokApiBase()}/v2/post/publish/inbox/video/init/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.access_token}`, "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ source_info: { source: "FILE_UPLOAD", video_size: media.byteLength, chunk_size: media.byteLength, total_chunk_count: 1 } }),
      cache: "no-store",
    })
    const init = await initResponse.json() as { data?: { publish_id?: string; upload_url?: string }; error?: { code?: string; message?: string } }
    if (!initResponse.ok || init.error?.code !== "ok" || !init.data?.publish_id || !init.data.upload_url) {
      throw new Error(init.error?.code || "TikTok upload initialization failed.")
    }

    const uploadResponse = await fetch(init.data.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": mime,
        "Content-Length": String(media.byteLength),
        "Content-Range": `bytes 0-${media.byteLength - 1}/${media.byteLength}`,
      },
      body: media,
    })
    if (!uploadResponse.ok) throw new Error(`TikTok upload failed (HTTP ${uploadResponse.status}).`)

    await supabase.from("niger_publication_deliveries").update({
      status: "uploaded",
      external_post_id: init.data.publish_id,
      last_error: "Vidéo envoyée dans la boîte de réception TikTok. L'administrateur doit terminer la publication dans l'application TikTok.",
      updated_at: new Date().toISOString(),
    }).eq("id", job.id)

    return NextResponse.json({ ok: true, processed: 1, status: "uploaded_to_tiktok_inbox", publish_id: init.data.publish_id })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue."
    await supabase.from("niger_publication_deliveries").update({
      status: "failed",
      last_error: message.slice(0, 1000),
      updated_at: new Date().toISOString(),
    }).eq("id", job.id)
    return NextResponse.json({ ok: false, processed: 1, error: message }, { status: 200 })
  }
}
