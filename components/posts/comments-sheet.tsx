"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addComment, listComments, type Comment } from "@/lib/db/posts"

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ""
  }
}

export function CommentsSheet({
  postId,
  open,
  onOpenChange,
  signedIn,
}: {
  postId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  signedIn: boolean
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    let active = true
    // Deferred to a microtask so no setState runs synchronously in the effect
    // body (react-hooks/set-state-in-effect) — same pattern as the navbar.
    Promise.resolve().then(async () => {
      setLoading(true)
      setError(null)
      try {
        const rows = await listComments(postId)
        if (active) setComments(rows)
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Could not load comments.")
      } finally {
        if (active) setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [open, postId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed || sending) return
    setSending(true)
    setError(null)
    try {
      const created = await addComment(postId, trimmed)
      setComments((prev) => [...prev, created])
      setBody("")
      requestAnimationFrame(() =>
        listEndRef.current?.scrollIntoView({ behavior: "smooth" })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post comment.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80dvh] flex-col gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Comments{comments.length > 0 ? ` (${comments.length})` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No comments yet. Be the first.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {comments.map((c) => (
                <li key={c.id} className="flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">
                      {c.author?.name ?? "Member"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(c.created_at)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {c.body}
                  </p>
                </li>
              ))}
              <div ref={listEndRef} />
            </ul>
          )}
        </div>

        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}

        {signedIn ? (
          <form onSubmit={submit} className="flex items-center gap-2">
            <Input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment…"
              maxLength={1000}
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !body.trim()}>
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/auth" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            to comment.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
