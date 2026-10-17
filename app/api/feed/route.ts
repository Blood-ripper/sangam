import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { embed, toVectorLiteral } from "@/lib/embeddings"
import { geminiJSON } from "@/lib/gemini"
import type { Database } from "@/types/supabase"

type MatchedOpportunity =
  Database["public"]["Functions"]["match_opportunities"]["Returns"][number]

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("skills, goal")
    .eq("id", user.id)
    .maybeSingle()

  const queryText =
    `${(profile?.skills ?? []).join(" ")} ${profile?.goal ?? ""}`.trim() ||
    "internship or job opportunity"

  const embedding = await embed(queryText)

  const { data: opportunities, error } = await supabase.rpc(
    "match_opportunities",
    {
      query_embedding: toVectorLiteral(embedding),
      match_count: 20,
    }
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = opportunities ?? []

  if (rows.length === 0) {
    return NextResponse.json({ opportunities: [], matchReasons: {} })
  }

  // Best-effort: one batched Gemini call for every card's match reason.
  // The feed still works (minus the reason text) if this fails.
  let matchReasons: Record<string, string> = {}
  try {
    matchReasons = await geminiJSON<Record<string, string>>(
      buildMatchReasonPrompt(queryText, rows)
    )
  } catch {
    matchReasons = {}
  }

  return NextResponse.json({ opportunities: rows, matchReasons })
}

function buildMatchReasonPrompt(
  candidateProfile: string,
  opportunities: MatchedOpportunity[]
) {
  const list = opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    company: o.company,
    required_skills: o.required_skills,
    description: o.description,
  }))

  return [
    "You are matching a candidate to job/internship opportunities.",
    `Candidate profile (skills + goal): ${candidateProfile || "(none given)"}`,
    "Opportunities (JSON):",
    JSON.stringify(list),
    "",
    'Return a single JSON object mapping each opportunity\'s "id" to a',
    "one-sentence reason it's a good match for this candidate. Use every",
    "id exactly once. Respond with JSON only, no other text.",
  ].join("\n")
}
