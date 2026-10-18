import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Handles the OAuth / magic-link redirect: exchanges the `code` query
// param for a session, then routes the user to onboarding or the feed
// depending on whether their profile already has a name.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .maybeSingle()

        return NextResponse.redirect(
          `${origin}${profile?.name ? "/dashboard" : "/onboarding"}`
        )
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth`)
}
