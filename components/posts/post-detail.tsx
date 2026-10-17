"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import {
  addComment,
  getLikeState,
  getViewer,
  getPost,
  listComments,
  type AuthorInfo,
  type Comment,
  type Post,
} from "@/lib/db/posts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MediaView } from "@/components/posts/media-view"
import { PostActions } from "@/components/posts/post-actions"

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ""
  }
}

export function PostDetail({ id }: { id: string }) {
  const [viewer, setViewer] = useState<AuthorInfo | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const commentsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    Promise.resolve().then(async () => {
      try {
        const [v, p] = await Promise.all([getViewer(), getPost(id)])
        if (!active) return
        setViewer(v)
        if (!p) {
          setNotFound(true)
          return
        }
        setPost(p)
        const [ls, cs] = await Promise.all([
          getLikeState([p.id]),
          listComments(p.id),
        ])
        if (!active) return
        setCount(ls.counts[p.id] ?? 0)
        setLiked(ls.likedByMe[p.id] ?? false)
        setComments(cs)
      } catch {
        if (active) setNotFound(true)
      } finally {
        if (active) setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [id])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed || sending || !post) return
    setSending(true)
    setCommentError(null)
    try {
      const created = await addComment(post.id, trimmed)
      setComments((prev) => [...prev, created])
      setBody("")
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Could not post comment.")
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Sangam
      </Link>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : notFound || !post ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          This post could not be found.
        </p>
      ) : (
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <header className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">
              {post.author?.name ?? "Member"}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(post.created_at)}
            </span>
          </header>

          {post.caption && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {post.caption}
            </p>
          )}

          {post.media_url && post.media_type && (
            <MediaView
              mediaUrl={post.media_url}
              mediaType={post.media_type}
              caption={post.caption}
            />
          )}

          <PostActions
            postId={post.id}
            count={count}
            liked={liked}
            signedIn={!!viewer}
            onOpenComments={() =>
              commentsRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          />

          <div ref={commentsRef} className="mt-2 flex flex-col gap-3 border-t pt-3">
            <h2 className="text-sm font-medium">
              Comments{comments.length > 0 ? ` (${comments.length})` : ""}
            </h2>

            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
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
              </ul>
            )}

            {commentError && (
              <p className="text-xs text-destructive" role="alert">
                {commentError}
              </p>
            )}

            {viewer ? (
              <form onSubmit={submitComment} className="flex items-center gap-2">
                <Input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Add a comment…"
                  maxLength={1000}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sending || !body.trim()}
                >
                  {sending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link
                  href="/auth"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>{" "}
                to like or comment.
              </p>
            )}
          </div>
        </article>
      )}
    </main>
  )
}
