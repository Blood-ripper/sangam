import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data: ideas, error } = await supabase
    .from("ideas")
    .select("*, founder:profiles(name)")
    .order("idea_pulse", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ideas: ideas ?? [] })
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
    title?: string
    problem?: string
    target_users?: string
    model?: string
  } | null

  if (!body?.title?.trim() || !body?.problem?.trim()) {
    return NextResponse.json(
      { error: "title and problem are required" },
      { status: 400 }
    )
  }

  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .insert({
      founder_id: user.id,
      title: body.title.trim(),
      problem: body.problem.trim(),
      target_users: body.target_users?.trim() || null,
      model: body.model?.trim() || null,
    })
    .select("*, founder:profiles(name)")
    .single()

  if (ideaError) {
    return NextResponse.json({ error: ideaError.message }, { status: 500 })
  }

  const { error: pollsError } = await supabase.from("polls").insert([
    { idea_id: idea.id, question: "Would you use it?" },
    { idea_id: idea.id, question: "Would you pay Rs 499/month?" },
  ])

  if (pollsError) {
    return NextResponse.json({ error: pollsError.message }, { status: 500 })
  }

  return NextResponse.json({ idea }, { status: 201 })
}
