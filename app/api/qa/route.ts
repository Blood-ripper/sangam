import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const opportunityId = searchParams.get("opportunityId")
  const ideaId = searchParams.get("ideaId")

  if (!opportunityId && !ideaId) {
    return NextResponse.json(
      { error: "opportunityId or ideaId is required" },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const query = supabase
    .from("qa_posts")
    .select("*, author:profiles(name)")
    .order("upvotes", { ascending: false })

  const { data: posts, error } = opportunityId
    ? await query.eq("opportunity_id", opportunityId)
    : await query.eq("idea_id", ideaId!)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ posts: posts ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as {
    opportunityId?: string
    ideaId?: string
    body?: string
  } | null

  if (!body?.body?.trim() || (!body.opportunityId && !body.ideaId)) {
    return NextResponse.json(
      { error: "body and one of opportunityId/ideaId are required" },
      { status: 400 }
    )
  }

  const { data: post, error } = await supabase
    .from("qa_posts")
    .insert({
      opportunity_id: body.opportunityId ?? null,
      idea_id: body.ideaId ?? null,
      author_id: user.id,
      body: body.body.trim(),
    })
    .select("*, author:profiles(name)")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post }, { status: 201 })
}
