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
    postId?: string
  } | null

  if (!body?.postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 })
  }

  const { data: post, error } = await supabase.rpc("add_qa_upvote", {
    p_post_id: body.postId,
  })

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You already upvoted this post" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post })
}
