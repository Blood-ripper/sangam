// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (same behavior, new name/export — see node_modules/next/dist/docs/
// 01-app/03-api-reference/03-file-conventions/proxy.md). middleware.ts is
// deprecated and would not run, so the auth flow lives here instead.
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

const PROTECTED_PATHS = [
  "/feed",
  "/onboarding",
  "/idea-lab",
  "/opportunities",
  "/recruiter",
]

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

export async function proxy(request: NextRequest) {
  // Mutated below whenever Supabase needs to write refreshed session
  // cookies; starts as a pass-through so unauthenticated/public requests
  // still get a response.
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session on every request that reaches this proxy (see
  // the matcher below). getUser() revalidates the token with Supabase
  // and triggers setAll above if it needed refreshing.
  const { data: { user } } = await supabase.auth.getUser()

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  return response
}

export const config = {
  // Runs on every request except Next.js internals and common static
  // assets — this is how /, /auth, /auth/callback and /_next "pass
  // through": they're simply never in PROTECTED_PATHS above, so the
  // session still gets refreshed but no redirect happens.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
