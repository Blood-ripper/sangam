import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// For use in Client Components. Session is persisted via cookies (not
// localStorage) so the server can read it too.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
