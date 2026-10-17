"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Database } from "@/types/supabase"

type QaPost = Database["public"]["Tables"]["qa_posts"]["Row"] & {
  author: { name: string | null } | null
}

type Props =
  | { opportunityId: string; ideaId?: undefined }
  | { ideaId: string; opportunityId?: undefined }

export function QASection(props: Props) {
  const opportunityId = "opportunityId" in props ? props.opportunityId : undefined
  const ideaId = "ideaId" in props ? props.ideaId : undefined

  const filterColumn = opportunityId ? "opportunity_id" : "idea_id"
  const filterValue = (opportunityId ?? ideaId)!
  const queryString = opportunityId
    ? `opportunityId=${opportunityId}`
    : `ideaId=${ideaId}`

  const [posts, setPosts] = useState<QaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState("")
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false

    fetch(`/api/qa?${queryString}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setPosts(json.posts ?? [])
      })
      .catch(() => {
        if (!cancelled) setError("Could not load questions.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [queryString])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`qa-${filterColumn}-${filterValue}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "qa_posts",
          filter: `${filterColumn}=eq.${filterValue}`,
        },
        (payload) => {
          const row = payload.new as Database["public"]["Tables"]["qa_posts"]["Row"]
          setPosts((prev) =>
            prev.some((p) => p.id === row.id)
              ? prev
              : [...prev, { ...row, author: null }]
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filterColumn, filterValue])

  async function submit() {
    if (!draft.trim() || posting) return
    setPosting(true)
    setError(null)

    const res = await fetch("/api/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, ideaId, body: draft.trim() }),
    })

    const json = await res.json().catch(() => ({}))

    if (res.ok) {
      setDraft("")
    } else {
      setError(json.error ?? "Could not post your question.")
    }

    setPosting(false)
  }

  async function upvote(postId: string) {
    if (upvoted.has(postId)) return

    const res = await fetch("/api/qa/upvote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    })

    if (res.ok || res.status === 409) {
      setUpvoted((prev) => new Set(prev).add(postId))
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
          )
        )
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Ask a question..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
        />
        <Button
          size="sm"
          onClick={submit}
          disabled={posting || !draft.trim()}
          className="self-end"
        >
          Post
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading questions...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No questions yet. Be the first to ask.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {posts
            .slice()
            .sort((a, b) => b.upvotes - a.upvotes)
            .map((post) => (
              <li
                key={post.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm">{post.body}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.author?.name ?? "Anonymous"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={upvoted.has(post.id) ? "default" : "outline"}
                  onClick={() => upvote(post.id)}
                >
                  ▲ {post.upvotes}
                </Button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
