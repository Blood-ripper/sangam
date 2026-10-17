"use client"

import { FileText, Presentation } from "lucide-react"
import { cn } from "cn"
import type { MediaType } from "@/lib/db/posts"

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname
    const last = path.split("/").pop() ?? ""
    return decodeURIComponent(last) || "attachment"
  } catch {
    return "attachment"
  }
}

function officeEmbedUrl(url: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
}

/**
 * Renders a post's media by coarse type. Reels render their own <video>
 * (autoplay / mute handling lives in the reels page); this component is for
 * the community grid and the single-post page.
 */
export function MediaView({
  mediaUrl,
  mediaType,
  caption,
  className,
}: {
  mediaUrl: string
  mediaType: MediaType
  caption?: string | null
  className?: string
}) {
  if (mediaType === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user media of unknown dimensions; next/image adds no value here
      <img
        src={mediaUrl}
        alt={caption ?? "Post image"}
        className={cn(
          "w-full rounded-lg border border-border object-cover",
          className
        )}
      />
    )
  }

  if (mediaType === "video") {
    return (
      <video
        src={mediaUrl}
        controls
        playsInline
        className={cn(
          "w-full rounded-lg border border-border bg-black",
          className
        )}
      />
    )
  }

  if (mediaType === "pdf") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <iframe
          src={mediaUrl}
          title={fileNameFromUrl(mediaUrl)}
          className="h-96 w-full rounded-lg border border-border bg-muted"
        />
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <FileText className="size-4" />
          Open PDF
        </a>
      </div>
    )
  }

  // ppt
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border p-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Presentation className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {fileNameFromUrl(mediaUrl)}
          </p>
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <FileText className="size-3.5" />
            Open
          </a>
        </div>
      </div>
      <iframe
        src={officeEmbedUrl(mediaUrl)}
        title={fileNameFromUrl(mediaUrl)}
        className="h-96 w-full rounded-md border border-border bg-muted"
      />
    </div>
  )
}
