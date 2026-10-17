import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { geminiJSON } from "@/lib/gemini"
import type { Database } from "@/types/supabase"

type MatchedOpportunity =
  Database["public"]["Functions"]["match_opportunities"]["Returns"][number]

export async function GET() {
  try {
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

    let rows: MatchedOpportunity[] = []

    // embed() loads an ONNX model via @xenova/transformers, which can fail
    // to load in some serverless environments (e.g. Vercel). Treat any
    // failure here, or from the RPC itself, as "no ranked matches" and
    // fall through to the plain-SELECT fallback below instead of 500ing.
    try {
      const { embed, toVectorLiteral } = await import("@/lib/embeddings")
      const embedding = await embed(queryText)

      const { data: opportunities, error } = await supabase.rpc(
        "match_opportunities",
        {
          query_embedding: toVectorLiteral(embedding),
          match_count: 20,
        }
      )

      if (error) {
        console.error("[feed] match_opportunities RPC failed:", error)
      } else {
        rows = opportunities ?? []
      }
    } catch (error) {
      console.error("[feed] embed() or match_opportunities RPC threw:", error)
    }

    let isFallback = false

    // RPC falls back to an empty list when embeddings aren't populated yet
    // (e.g. demo data seeded without running the embedding backfill), or
    // when embed()/the RPC call above failed outright. Fall back to a
    // plain, unranked list of active opportunities so the feed still shows
    // something.
    if (rows.length === 0) {
      isFallback = true
      const { data: fallbackOpportunities, error: fallbackError } =
        await supabase
          .from("opportunities")
          .select(
            "id, recruiter_id, title, company, type, description, required_skills, stipend_text, seats, deadline, status, created_at"
          )
          .eq("status", "active")
          .limit(20)

      if (fallbackError) {
        return NextResponse.json(
          { error: fallbackError.message },
          { status: 500 }
        )
      }

      rows = (fallbackOpportunities ?? []).map((o) => ({
        ...o,
        similarity: 0.5,
        hire_proof_score: 0,
        match_score: 0.5,
      })) as MatchedOpportunity[]
    }

    if (rows.length === 0) {
      return NextResponse.json({ opportunities: [], matchReasons: {} })
    }

    // Best-effort: one batched Gemini call for every card's match reason.
    // The feed still works, with a generic reason per card, if this fails
    // (or if these are unranked fallback rows with no real match to explain).
    let matchReasons: Record<string, string> = {}
    if (isFallback) {
      matchReasons = Object.fromEntries(
        rows.map((o) => [o.id, "Matches your profile's skills and goals."])
      )
    } else {
      try {
        matchReasons = await geminiJSON<Record<string, string>>(
          buildMatchReasonPrompt(queryText, rows)
        )
      } catch (error) {
        console.error(
          "[feed] Gemini match-reason generation failed, using generic reasons:",
          error
        )
        matchReasons = Object.fromEntries(
          rows.map((o) => [
            o.id,
            "Matches your profile's skills and goals.",
          ])
        )
      }
    }

    return NextResponse.json({ opportunities: rows, matchReasons })
  } catch (error) {
    console.error("[feed] Unhandled error:", error)
    return NextResponse.json(
      { error: "Could not load the feed." },
      { status: 500 }
    )
  }
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
