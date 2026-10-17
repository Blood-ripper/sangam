import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { geminiJSON } from "@/lib/gemini"

type FreePathResource = {
  name: string
  url: string
  platform: "NPTEL" | "SWAYAM" | "YouTube"
}

type FreePathWeek = {
  week: number
  topic: string
  resources: FreePathResource[]
}

export type SkillGapResult = {
  missingSkills: string[]
  freePath: FreePathWeek[]
  proofTask: string
}

export class SkillGapError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/** Shared by the route below and the /skill-gap/[id] page, so both use the
 * same deterministic missing-skills logic as /api/apply. */
export async function getSkillGapData(
  opportunityId: string
): Promise<SkillGapResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new SkillGapError("Not signed in", 401)
  }

  const [{ data: profile }, { data: opportunity }] = await Promise.all([
    supabase.from("profiles").select("skills").eq("id", user.id).maybeSingle(),
    supabase
      .from("opportunities")
      .select("title, required_skills")
      .eq("id", opportunityId)
      .maybeSingle(),
  ])

  if (!opportunity) {
    throw new SkillGapError("Opportunity not found", 404)
  }

  const requiredSkills = opportunity.required_skills ?? []
  const owned = new Set((profile?.skills ?? []).map((s) => s.toLowerCase()))
  const missingSkills = requiredSkills.filter(
    (skill) => !owned.has(skill.toLowerCase())
  )

  const { freePath, proofTask } = await geminiJSON<{
    freePath: FreePathWeek[]
    proofTask: string
  }>(buildSkillGapPrompt(opportunity.title, missingSkills))

  return { missingSkills, freePath, proofTask }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const data = await getSkillGapData(id)
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof SkillGapError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json(
      { error: "Could not generate a skill-gap plan" },
      { status: 500 }
    )
  }
}

function buildSkillGapPrompt(
  opportunityTitle: string | null,
  missingSkills: string[]
) {
  return [
    "A candidate in India wants to close a skill gap before applying to:",
    `"${opportunityTitle ?? "this opportunity"}"`,
    `Missing skills: ${missingSkills.join(", ") || "none specified"}`,
    "",
    "Return a JSON object with exactly two keys:",
    '- "freePath": an array of exactly 2 objects (one per week), each',
    '  {"week": 1 | 2, "topic": string, "resources": [{"name": string,',
    '  "url": string, "platform": "NPTEL" | "SWAYAM" | "YouTube"}]}.',
    "  Resources must be free and realistically findable on the named",
    "  platform for an Indian student. 1-3 resources per week.",
    '- "proofTask": a single-sentence, concrete task the candidate can',
    "  complete in under a day to prove they picked up the missing skills.",
    "",
    "Respond with JSON only, no other text.",
  ].join("\n")
}
