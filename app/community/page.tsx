"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"
import {
  getLikeState,
  getViewer,
  listPosts,
  type AuthorInfo,
  type LikeState,
  type Post,
} from "@/lib/db/posts"
import { Composer } from "@/components/posts/composer"
import { MediaView } from "@/components/posts/media-view"
import { PostActions } from "@/components/posts/post-actions"
import { CommentsSheet } from "@/components/posts/comments-sheet"

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ""
  }
}

function PostCard({
  post,
  signedIn,
  count,
  liked,
}: {
  post: Post
  signedIn: boolean
  count: number
  liked: boolean
}) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  return (
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
        <p className="text-sm whitespace-pre-wrap break-words">{post.caption}</p>
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
        signedIn={signedIn}
        onOpenComments={() => setCommentsOpen(true)}
      />

      <CommentsSheet
        postId={post.id}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        signedIn={signedIn}
      />
    </article>
  )
}

export default function CommunityPage() {
  const [viewer, setViewer] = useState<AuthorInfo | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [likes, setLikes] = useState<LikeState>({ counts: {}, likedByMe: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.resolve().then(async () => {
      try {
        const [v, p] = await Promise.all([getViewer(), listPosts("post")])
        if (!active) return
        setViewer(v)
        setPosts(p)
        const ls = await getLikeState(p.map((x) => x.id))
        if (active) setLikes(ls)
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Could not load the community feed.")
      } finally {
        if (active) setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  function handlePosted(post: Post) {
    setPosts((prev) => [post, ...prev])
    setLikes((prev) => ({
      counts: { ...prev.counts, [post.id]: 0 },
      likedByMe: { ...prev.likedByMe, [post.id]: false },
    }))
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="font-heading mb-1 text-2xl font-semibold">Community</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Share updates, resources, and questions with the Sangam network.
      </p>

      {viewer ? (
        <Composer kind="post" onPosted={handlePosted} className="mb-6" />
      ) : (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <a href="/auth" className="font-medium text-primary hover:underline">
            Sign in
          </a>{" "}
          to share a post.
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No posts yet. Start the conversation.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              signedIn={!!viewer}
              count={likes.counts[post.id] ?? 0}
              liked={likes.likedByMe[post.id] ?? false}
            />
          ))}
        </div>
      )}
    </main>
  )
}
