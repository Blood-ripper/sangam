import { createClient } from "@/lib/supabase/client"

export type DashboardProfile = {
  name: string | null
  role: string | null
  college: string | null
  course: string | null
  university: string | null
  year: number | null
  goal: string | null
  skills: string[] | null
  email_verified: boolean
  hire_proof_score: number
}

export type MyApplication = {
  id: string
  status: string
  applied_at: string
  hire_confirmed: boolean
  opportunity: { id: string; title: string | null; company: string | null; type: string | null } | null
}

/** The signed-in user's profile and applications (RLS scopes both to them). Null when signed out. */
export async function getMyDashboard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: applications }] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, role, college, course, university, year, goal, skills, email_verified, hire_proof_score")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("applications")
      .select("id, status, applied_at, hire_confirmed, opportunity:opportunities(id, title, company, type)")
      .eq("seeker_id", user.id)
      .order("applied_at", { ascending: false }),
  ])

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: (profile ?? null) as DashboardProfile | null,
    applications: (applications ?? []) as unknown as MyApplication[],
  }
}
