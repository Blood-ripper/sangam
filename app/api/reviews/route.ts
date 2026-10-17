import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { geminiJSON } from "@/lib/gemini"

const VALID_TARGET_TYPES = ["recruiter", "startup", "mentor"] as const

export async function GET(request: Request) {
  const supabase = await createClient()
  const url = new URL(request.url)
  const targetId = url.searchParams.get("target_id")
  const targetType = url.searchParams.get("target_type") ?? "recruiter"

  if (!targetId) {
    return NextResponse.json(
      { error: "target_id is required" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, body, verified, created_at, reviewer:profiles(name)")
    .eq("target_id", targetId)
    .eq("target_type", targetType)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reviews: data ?? [] })
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
  const targetId = body?.target_id
  const targetType = body?.target_type
  const rating = Number(body?.rating)
  const reviewBody = body?.body

  if (
    typeof targetId !== "string" ||
    typeof targetType !== "string" ||
    !(VALID_TARGET_TYPES as readonly string[]).includes(targetType) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    typeof reviewBody !== "string" ||
    !reviewBody.trim()
  ) {
    return NextResponse.json(
      { error: "target_id, target_type, rating (1-5), and body are required" },
      { status: 400 }
    )
  }

  if (targetType !== "recruiter") {
    // The only linkage rule implemented so far is seeker-applied-to-
    // recruiter's-opportunity. Startup/mentor reviews need their own
    // linkage rule before this route can accept them.
    return NextResponse.json(
      { error: "Only recruiter reviews are supported right now" },
      { status: 400 }
    )
  }

  const { data: recruiterOpportunities } = await supabase
    .from("opportunities")
    .select("id")
    .eq("recruiter_id", targetId)

  const opportunityIds = (recruiterOpportunities ?? []).map((o) => o.id)

  let linked = false
  if (opportunityIds.length > 0) {
    const { data: application } = await supabase
      .from("applications")
      .select("id")
      .eq("seeker_id", user.id)
      .in("opportunity_id", opportunityIds)
      .maybeSingle()
    linked = !!application
  }

  if (!linked) {
    return NextResponse.json(
      { error: "Only candidates who applied can review" },
      { status: 403 }
    )
  }

  try {
    const moderation = await geminiJSON<{
      isFake: boolean
      isAbusive: boolean
      reason: string
    }>(buildModerationPrompt(reviewBody))

    if (moderation.isFake || moderation.isAbusive) {
      return NextResponse.json({ error: moderation.reason }, { status: 422 })
    }
  } catch {
    // Best-effort: don't block a legitimate review on a Gemini hiccup.
  }

  // verified is always true here: insertion already required a linked
  // applications row, so every review this route accepts is from a
  // confirmed applicant.
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      reviewer_id: user.id,
      target_id: targetId,
      target_type: targetType,
      rating,
      body: reviewBody,
      verified: true,
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ review }, { status: 201 })
}

function buildModerationPrompt(reviewBody: string) {
  return [
    "Moderate this review of a recruiter, written by a candidate who",
    "applied through a job platform.",
    `Review text: "${reviewBody}"`,
    "",
    "Return a JSON object with exactly these keys:",
    '- "isFake": boolean, true if the review reads as fabricated or',
    "  implausible rather than a genuine account of an interaction.",
    '- "isAbusive": boolean, true if it contains harassment, hate speech,',
    "  or other abusive language.",
    '- "reason": a short string explaining the flag, or empty if neither',
    "  applies.",
    "",
    "Respond with JSON only, no other text.",
  ].join("\n")
}
