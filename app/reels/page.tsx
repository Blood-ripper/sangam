"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Plus, Volume2, VolumeX } from "lucide-react"
import {
  canPostReel,
  getLikeState,
  getViewer,
  listPosts,
  type AuthorInfo,
  type LikeState,
  type Post,
} from "@/lib/db/posts"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Composer } from "@/components/posts/composer"
import { PostActions } from "@/components/posts/post-actions"
import { CommentsSheet } from "@/components/posts/comments-sheet"

function ReelItem({
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
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [commentsOpen, setCommentsOpen] = useState(false)

  // Play when at least 60% of the reel is on screen; pause otherwise.
  useEffect(() => {
    const el = containerRef.current
    const video = videoRef.current
    if (!el || !video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: [0, 0.6, 1] }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    const next = !muted
    video.muted = next
    setMuted(next)
  }

  return (
    <section
      ref={containerRef}
      className="relative flex h-full w-full snap-start snap-always items-center justify-center bg-black"
    >
      {post.media_url && post.media_type === "video" ? (
        <video
          ref={videoRef}
          src={post.media_url}
          muted
          loop
          playsInline
          onClick={toggleMute}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="px-6 text-center text-white/70">Unsupported reel</div>
      )}

      {/* Mute indicator */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white backdrop-blur"
      >
        {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
      </button>

      {/* Bottom-left author + caption overlay */}
      <div className="absolute bottom-6 left-4 max-w-[70%] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
        <p className="text-base font-semibold">
          {post.author?.name ?? "Member"}
        </p>
        {post.caption && (
          <p className="mt-1 text-sm whitespace-pre-wrap break-words">
            {post.caption}
          </p>
        )}
      </div>

      {/* Right-side actions column */}
      <div className="absolute right-4 bottom-6">
        <PostActions
          postId={post.id}
          count={count}
          liked={liked}
          signedIn={signedIn}
          orientation="vertical"
          overlay
          onOpenComments={() => setCommentsOpen(true)}
        />
      </div>

      <CommentsSheet
        postId={post.id}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        signedIn={signedIn}
      />
    </section>
  )
}

export default function ReelsPage() {
  const [viewer, setViewer] = useState<AuthorInfo | null>(null)
  const [reels, setReels] = useState<Post[]>([])
  const [likes, setLikes] = useState<LikeState>({ counts: {}, likedByMe: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)

  useEffect(() => {
    let active = true
    Promise.resolve().then(async () => {
      try {
        const [v, p] = await Promise.all([getViewer(), listPosts("reel")])
        if (!active) return
        setViewer(v)
        setReels(p)
        const ls = await getLikeState(p.map((x) => x.id))
        if (active) setLikes(ls)
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Could not load reels.")
      } finally {
        if (active) setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  function handlePosted(post: Post) {
    setReels((prev) => [post, ...prev])
    setLikes((prev) => ({
      counts: { ...prev.counts, [post.id]: 0 },
      likedByMe: { ...prev.likedByMe, [post.id]: false },
    }))
    setComposerOpen(false)
  }

  const mayPost = canPostReel(viewer?.role)

  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative">
      {mayPost && (
        <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
          <DialogTrigger asChild>
            <Button className="fixed right-4 bottom-4 z-30 shadow-lg" size="sm">
              <Plus className="size-4" />
              Post a reel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post a reel</DialogTitle>
            </DialogHeader>
            <Composer
              kind="reel"
              restrictToVideo
              onPosted={handlePosted}
              className="border-0 p-0"
            />
          </DialogContent>
        </Dialog>
      )}

      {error && (
        <p
          className="absolute inset-x-0 top-4 z-30 text-center text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}

      {reels.length === 0 ? (
        <div className="flex h-[calc(100dvh-4rem)] items-center justify-center text-muted-foreground">
          No reels yet.
        </div>
      ) : (
        <div className="h-[calc(100dvh-4rem)] snap-y snap-mandatory overflow-y-scroll">
          {reels.map((reel) => (
            <div key={reel.id} className="h-full">
              <ReelItem
                post={reel}
                signedIn={!!viewer}
                count={likes.counts[reel.id] ?? 0}
                liked={likes.likedByMe[reel.id] ?? false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
