import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { geminiJSON } from "@/lib/gemini"

const VALIDATED_THRESHOLD = 60

type IdeaCritique = {
  ideaPulse: number
  strengths: string[]
  risks: string[]
  pivotHints: string[]
  leanCanvasGaps: string[]
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const ideaId = body?.ideaId

  if (typeof ideaId !== "string") {
    return NextResponse.json({ error: "ideaId is required" }, { status: 400 })
  }

  const { data: idea } = await supabase
    .from("ideas")
    .select("title, problem, target_users, model")
    .eq("id", ideaId)
    .maybeSingle()

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 })
  }

  let critique: IdeaCritique
  try {
    critique = await geminiJSON<IdeaCritique>(buildCritiquePrompt(idea))
  } catch {
    return NextResponse.json(
      { error: "Could not generate a critique right now" },
      { status: 500 }
    )
  }

  const update: { idea_pulse: number; status?: string } = {
    idea_pulse: critique.ideaPulse,
  }
  if (critique.ideaPulse >= VALIDATED_THRESHOLD) {
    update.status = "validated"
  }

  const { data: updated, error } = await supabase
    .from("ideas")
    .update(update)
    .eq("id", ideaId)
    .select("id")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!updated) {
    return NextResponse.json(
      { error: "Not allowed to update this idea" },
      { status: 403 }
    )
  }

  return NextResponse.json(critique)
}

function buildCritiquePrompt(idea: {
  title: string | null
  problem: string | null
  target_users: string | null
  model: string | null
}) {
  return [
    "Critique this early-stage startup idea for an Indian student founder.",
    `Title: ${idea.title ?? "(untitled)"}`,
    `Problem: ${idea.problem ?? "(not given)"}`,
    `Target users: ${idea.target_users ?? "(not given)"}`,
    `Business model: ${idea.model ?? "(not given)"}`,
    "",
    "Return a JSON object with exactly these keys:",
    '- "ideaPulse": an integer 0-100 health score.',
    '- "strengths": array of short strings.',
    '- "risks": array of short strings.',
    '- "pivotHints": array of short strings suggesting possible pivots.',
    '- "leanCanvasGaps": array of short strings naming missing or weak Lean',
    "  Canvas sections (e.g. problem, solution, channels, revenue streams).",
    "",
    "Respond with JSON only, no other text.",
  ].join("\n")
}
