import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as {
    pollId?: string
    vote?: boolean
  } | null

  if (!body?.pollId || typeof body.vote !== "boolean") {
    return NextResponse.json(
      { error: "pollId and vote are required" },
      { status: 400 }
    )
  }

  const { data: poll, error } = await supabase.rpc("cast_poll_vote", {
    p_poll_id: body.pollId,
    p_vote: body.vote,
  })

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You already voted on this poll" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ poll })
}
