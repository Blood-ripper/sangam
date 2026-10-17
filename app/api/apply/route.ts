import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const READY_THRESHOLD = 0.7

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const opportunityId = body?.opportunityId
  const force = body?.force === true

  if (typeof opportunityId !== "string") {
    return NextResponse.json(
      { error: "opportunityId is required" },
      { status: 400 }
    )
  }

  const [{ data: profile }, { data: opportunity }] = await Promise.all([
    supabase.from("profiles").select("skills").eq("id", user.id).maybeSingle(),
    supabase
      .from("opportunities")
      .select("id, required_skills")
      .eq("id", opportunityId)
      .maybeSingle(),
  ])

  if (!opportunity) {
    return NextResponse.json(
      { error: "Opportunity not found" },
      { status: 404 }
    )
  }

  const requiredSkills = opportunity.required_skills ?? []
  const missing = computeMissingSkills(profile?.skills ?? [], requiredSkills)
  const overlapRatio =
    requiredSkills.length === 0
      ? 1
      : (requiredSkills.length - missing.length) / requiredSkills.length

  if (overlapRatio < READY_THRESHOLD && !force) {
    return NextResponse.json({
      redirect: `/skill-gap/${opportunityId}`,
      missing,
    })
  }

  const { data: existing } = await supabase
    .from("applications")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .eq("seeker_id", user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ application: existing })
  }

  const { data: application, error } = await supabase
    .from("applications")
    .insert({ opportunity_id: opportunityId, seeker_id: user.id })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ application })
}

/** Case-insensitive set difference: required skills not present in profile skills. */
function computeMissingSkills(
  profileSkills: string[],
  requiredSkills: string[]
): string[] {
  const owned = new Set(profileSkills.map((s) => s.toLowerCase()))
  return requiredSkills.filter((skill) => !owned.has(skill.toLowerCase()))
}
