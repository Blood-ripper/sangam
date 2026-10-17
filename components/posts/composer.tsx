"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Upload, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  createPost,
  MAX_FILE_BYTES,
  type Post,
  type PostKind,
} from "@/lib/db/posts"

const ANY_ACCEPT =
  "image/*,video/mp4,video/webm,video/quicktime,application/pdf,.ppt,.pptx"
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime"

function humanSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function Composer({
  kind,
  restrictToVideo = false,
  onPosted,
  className,
}: {
  kind: PostKind
  restrictToVideo?: boolean
  onPosted?: (post: Post) => void
  className?: string
}) {
  const [caption, setCaption] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // Holds the current object URL so it can be revoked on replace / unmount.
  const previewUrlRef = useRef<string | null>(null)

  function setPreview(f: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }
    if (f && (f.type.startsWith("image/") || f.type.startsWith("video/"))) {
      const url = URL.createObjectURL(f)
      previewUrlRef.current = url
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  // Revoke any outstanding object URL when the composer unmounts.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setError(null)
    if (!f) {
      setFile(null)
      setPreview(null)
      setFileError(null)
      return
    }
    if (f.size > MAX_FILE_BYTES) {
      setFileError(`That file is ${humanSize(f.size)} — the limit is 10 MB.`)
      setFile(null)
      setPreview(null)
      return
    }
    setFileError(null)
    setFile(f)
    setPreview(f)
  }

  function clearFile() {
    setFile(null)
    setPreview(null)
    setFileError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (posting) return
    if (restrictToVideo && !file) {
      setError("Choose a video to post a reel.")
      return
    }
    if (!restrictToVideo && !caption.trim() && !file) {
      setError("Write something or attach a file.")
      return
    }
    setPosting(true)
    setError(null)
    try {
      const post = await createPost({ kind, caption, file })
      setCaption("")
      clearFile()
      onPosted?.(post)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post.")
    } finally {
      setPosting(false)
    }
  }

  const canPost =
    !posting &&
    !fileError &&
    (restrictToVideo ? !!file : !!caption.trim() || !!file)

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      <Textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder={
          restrictToVideo
            ? "Say something about your reel…"
            : "Share an update, a resource, or a question…"
        }
        rows={3}
        disabled={posting}
      />

      {file && (
        <div className="relative rounded-lg border border-border p-3">
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-2 right-2 rounded-md bg-background/80 p-1 text-muted-foreground hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
          {previewUrl && file.type.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-56 w-full rounded-md object-contain"
            />
          ) : previewUrl && file.type.startsWith("video/") ? (
            <video
              src={previewUrl}
              controls
              playsInline
              className="max-h-56 w-full rounded-md bg-black"
            />
          ) : null}
          <p className="mt-2 truncate pr-8 text-xs text-muted-foreground">
            {file.name} · {humanSize(file.size)}
          </p>
        </div>
      )}

      {fileError && (
        <p className="text-xs text-destructive" role="alert">
          {fileError}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground",
            posting && "pointer-events-none opacity-50"
          )}
        >
          <Upload className="size-4" />
          {restrictToVideo ? "Video" : "Attach"}
          <input
            ref={inputRef}
            type="file"
            accept={restrictToVideo ? VIDEO_ACCEPT : ANY_ACCEPT}
            onChange={pick}
            className="sr-only"
            disabled={posting}
          />
        </label>

        <Button type="submit" disabled={!canPost}>
          {posting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Posting…
            </>
          ) : restrictToVideo ? (
            "Post reel"
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </form>
  )
}
