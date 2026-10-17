import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { embed, toVectorLiteral } from "@/lib/embeddings"
import type { TablesInsert } from "@/types/supabase"

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
    status: "active",
  }

  const { data, error } = await supabase
    .from("opportunities")
    .insert(payload)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ opportunity: data }, { status: 201 })
}
