import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "../../../../../lib/admin-auth"
import { createAdminClient } from "../../../../../lib/supabase/admin"
import { encryptTikTokTokens, tiktokClientKey, tiktokClientSecret, tiktokRedirectUri } from "../../../../../lib/tiktok"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const redirectBack = new URL("/admin/publications", request.url)
  const fail = (message: string) => {
    redirectBack.searchParams.set("tiktok_error", message)
    const response = NextResponse.redirect(redirectBack)
    response.cookies.delete("niger_tiktok_oauth_state")
    return response
  }

  if (!(await isAdminAuthenticated())) return fail("session_admin_expired")
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const expectedState = request.cookies.get("niger_tiktok_oauth_state")?.value
  if (!code || !state || !expectedState || state !== expectedState) return fail("oauth_state_invalid")
  if (request.nextUrl.searchParams.get("error")) return fail("authorization_denied")

  try {
    const body = new URLSearchParams({
      client_key: tiktokClientKey(),
      client_secret: tiktokClientSecret(),
      code,
      grant_type: "authorization_code",
      redirect_uri: tiktokRedirectUri(),
    })
    const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    })
    const payload = await tokenResponse.json() as {
      data?: { access_token?: string; refresh_token?: string; open_id?: string; expires_in?: number; refresh_expires_in?: number; scope?: string }
      error?: { code?: string; message?: string }
    }
    const data = payload.data
    if (!tokenResponse.ok || !data?.access_token || !data.refresh_token || !data.open_id) {
      return fail(payload.error?.code || "token_exchange_failed")
    }

    const tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      open_id: data.open_id,
      expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in || 86400),
      refresh_expires_at: Math.floor(Date.now() / 1000) + Number(data.refresh_expires_in || 31536000),
      scope: data.scope || "",
    }
    const encrypted = await encryptTikTokTokens(tokens)
    const supabase = createAdminClient()
    if (!supabase) return fail("supabase_server_not_configured")

    const { error } = await supabase.from("niger_social_accounts").upsert({
      platform: "tiktok",
      account_id: data.open_id,
      token_ciphertext: encrypted.ciphertext,
      token_iv: encrypted.iv,
      scopes: (data.scope || "").split(",").filter(Boolean),
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "platform,account_id" })

    if (error) return fail("token_storage_failed")
    redirectBack.searchParams.set("tiktok_connected", "1")
    const response = NextResponse.redirect(redirectBack)
    response.cookies.delete("niger_tiktok_oauth_state")
    return response
  } catch {
    return fail("oauth_callback_failed")
  }
}
