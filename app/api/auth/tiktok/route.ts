import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "../../../../lib/admin-auth"
import { tiktokClientKey, tiktokRedirectUri } from "../../../../lib/tiktok"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin-login?next=/admin/publications", request.url))
  }

  const state = crypto.randomUUID()
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/")
  url.searchParams.set("client_key", tiktokClientKey())
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "user.info.basic,video.upload")
  url.searchParams.set("redirect_uri", tiktokRedirectUri())
  url.searchParams.set("state", state)

  const response = NextResponse.redirect(url)
  response.cookies.set("niger_tiktok_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/tiktok/callback",
    maxAge: 600,
  })
  return response
}
