import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { embed, toVectorLiteral } from "@/lib/embeddings"
import { scamCheck } from "@/lib/scam-check"
import type { TablesInsert } from "@/types/supabase"

const SCAM_CONFIDENCE_THRESHOLD = 0.8

function asTrimmedString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0
  )
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
  const title = asTrimmedString(body?.title)

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const company = asTrimmedString(body?.company)
  const type = asTrimmedString(body?.type)
  const description = asTrimmedString(body?.description)
  const requiredSkills = asStringArray(body?.required_skills)
  const stipendText = asTrimmedString(body?.stipend_text)
  const seats = Number.isFinite(body?.seats) ? Number(body.seats) : null
  const deadline = asTrimmedString(body?.deadline)

  // Keep the AI feed working for opportunities posted through this form:
  // match_opportunities() (0004_match_fn.sql) only considers rows with a
  // non-null embedding.
  const embedding = await embed(
    [title, description, requiredSkills.join(" ")].filter(Boolean).join(" ")
  )

  // Best-effort: if the scam check itself fails, don't block a legitimate
  // posting on a Gemini hiccup.
  let flags: string[] = []
  let blocked = false
  try {
    const result = await scamCheck({
      title,
      company,
      description,
      stipend_text: stipendText,
    })
    flags = result.flags
    blocked = result.isScam && result.confidence > SCAM_CONFIDENCE_THRESHOLD
  } catch {
    blocked = false
  }

  // recruiter_id always comes from the session, never the request body —
  // RLS (opportunities_insert_owner) would reject a mismatched value
  // anyway, but failing fast here gives a clearer error.
  const payload: TablesInsert<"opportunities"> = {
    recruiter_id: user.id,
    title,
    company,
    type,
    description,
    required_skills: requiredSkills.length ? requiredSkills : null,
    stipend_text: stipendText,
    seats,
    deadline,
    embedding: toVectorLiteral(embedding),
    status: blocked ? "blocked" : "active",
  }

  const { data, error } = await supabase
    .from("opportunities")
    .insert(payload)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (blocked) {
    return NextResponse.json(
      { error: "Listing blocked", flags },
      { status: 422 }
    )
  }

  return NextResponse.json({ opportunity: data }, { status: 201 })
}
