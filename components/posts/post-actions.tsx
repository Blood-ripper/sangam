"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Share2 } from "lucide-react"
import { cn } from "cn"
import { toggleLike } from "@/lib/db/posts"

export function PostActions({
  postId,
  count,
  liked,
  signedIn,
  onOpenComments,
  orientation = "horizontal",
  overlay = false,
}: {
  postId: string
  count: number
  liked: boolean
  signedIn: boolean
  onOpenComments?: () => void
  orientation?: "horizontal" | "vertical"
  overlay?: boolean
}) {
  const [likeCount, setLikeCount] = useState(count)
  const [isLiked, setIsLiked] = useState(liked)
  const [busy, setBusy] = useState(false)
  const [shareMsg, setShareMsg] = useState<string | null>(null)
  const [authPrompt, setAuthPrompt] = useState(false)

  async function handleLike() {
    if (!signedIn) {
      setAuthPrompt(true)
      return
    }
    if (busy) return
    // Optimistic flip.
    const next = !isLiked
    setIsLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    setBusy(true)
    try {
      const confirmed = await toggleLike(postId)
      if (confirmed !== next) {
        setIsLiked(confirmed)
        setLikeCount((c) => c + (confirmed ? 1 : -1) - (next ? 1 : -1))
      }
    } catch {
      // Roll back on failure.
      setIsLiked(!next)
      setLikeCount((c) => c + (next ? -1 : 1))
    } finally {
      setBusy(false)
    }
  }

  function handleComment() {
    if (!signedIn) {
      setAuthPrompt(true)
      return
    }
    onOpenComments?.()
  }

  async function handleShare() {
    const url = `${window.location.origin}/p/${postId}`
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Sangam", url })
        return
      } catch {
        // User dismissed the share sheet — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareMsg("Link copied")
    } catch {
      setShareMsg(url)
    }
    setTimeout(() => setShareMsg(null), 2000)
  }

  const vertical = orientation === "vertical"
  const btn = cn(
    "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
    vertical ? "flex-col gap-1" : "flex-row",
    overlay
      ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] hover:text-white/80"
      : "text-muted-foreground hover:text-foreground"
  )
  const iconSize = vertical ? "size-7" : "size-5"

  return (
    <div
      className={cn(
        "relative flex gap-5",
        vertical ? "flex-col items-center" : "flex-row items-center"
      )}
    >
      <button type="button" onClick={handleLike} className={btn} aria-pressed={isLiked}>
        <Heart
          className={cn(
            iconSize,
            isLiked && "fill-red-500 text-red-500"
          )}
        />
        <span>{likeCount}</span>
      </button>

      <button
        type="button"
        onClick={handleComment}
        className={btn}
        aria-label="Comments"
      >
        <MessageCircle className={iconSize} />
      </button>

      <button
        type="button"
        onClick={handleShare}
        className={btn}
        aria-label="Share"
      >
        <Share2 className={iconSize} />
      </button>

      {shareMsg && (
        <span
          role="status"
          className={cn(
            "absolute whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background",
            vertical ? "right-full top-0 mr-2" : "bottom-full left-0 mb-1"
          )}
        >
          {shareMsg}
        </span>
      )}

      {authPrompt && !signedIn && (
        <span
          className={cn(
            "absolute whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background",
            vertical ? "right-full top-10 mr-2" : "bottom-full left-0 mb-1"
          )}
        >
          <Link href="/auth" className="underline">
            Sign in
          </Link>{" "}
          to like/comment
        </span>
      )}
    </div>
  )
}
