// All data access for reels / community posts lives here (per CLAUDE.md).
// Everything runs against the *browser* Supabase client — these helpers are
// imported by Client Components only. RLS on the server is the real gate;
// the role checks here just drive the UI.
import { createClient } from "@/lib/supabase/client"

export type PostKind = "reel" | "post"
export type MediaType = "image" | "video" | "pdf" | "ppt"

export interface AuthorInfo {
  id: string | null
  name: string | null
  role: string | null
}

export interface Post {
  id: string
  author_id: string | null
  kind: PostKind
  caption: string | null
  media_url: string | null
  media_path: string | null
  media_type: MediaType | null
  created_at: string
  author: AuthorInfo | null
}

export interface Comment {
  id: string
  post_id: string
  author_id: string | null
  body: string
  created_at: string
  author: AuthorInfo | null
}

export interface LikeState {
  // keyed by post id
  counts: Record<string, number>
  likedByMe: Record<string, boolean>
}

export interface UploadResult {
  publicUrl: string
  path: string
  mediaType: MediaType
}

export const MEDIA_BUCKET = "media"
export const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

// mime type -> our coarse media category. Mirrors the storage bucket policy.
const MIME_TO_TYPE: Record<string, MediaType> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "application/pdf": "pdf",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "ppt",
}

// Fallback extensions when the file name has none.
const TYPE_DEFAULT_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "application/pdf": "pdf",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
}

function humanSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Narrow the raw DB row (kind/media_type are `string`) into our Post shape. */
function toPost(row: {
  id: string
  author_id: string | null
  kind: string
  caption: string | null
  media_url: string | null
  media_path: string | null
  media_type: string | null
  created_at: string
}): Post {
  return {
    id: row.id,
    author_id: row.author_id,
    kind: (row.kind as PostKind) ?? "post",
    caption: row.caption,
    media_url: row.media_url,
    media_path: row.media_path,
    media_type: (row.media_type as MediaType | null) ?? null,
    created_at: row.created_at,
    author: null,
  }
}

/** Fetch author profiles for a set of ids and return a lookup map. */
async function authorMap(
  ids: Array<string | null | undefined>
): Promise<Map<string, AuthorInfo>> {
  const supabase = createClient()
  const unique = Array.from(
    new Set(ids.filter((id): id is string => Boolean(id)))
  )
  const map = new Map<string, AuthorInfo>()
  if (unique.length === 0) return map

  const { data } = await supabase
    .from("profiles")
    .select("id, name, role")
    .in("id", unique)

  for (const p of data ?? []) {
    map.set(p.id, { id: p.id, name: p.name, role: p.role })
  }
  return map
}

/** The currently signed-in viewer's basic profile, or null when signed out. */
export async function getViewer(): Promise<AuthorInfo | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", user.id)
    .maybeSingle()

  return {
    id: user.id,
    name: profile?.name ?? null,
    role: profile?.role ?? null,
  }
}

export async function listPosts(kind: PostKind): Promise<Post[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, kind, caption, media_url, media_path, media_type, created_at"
    )
    .eq("kind", kind)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  const posts = (data ?? []).map(toPost)
  const authors = await authorMap(posts.map((p) => p.author_id))
  for (const p of posts) {
    p.author = p.author_id ? (authors.get(p.author_id) ?? null) : null
  }
  return posts
}

export async function getPost(id: string): Promise<Post | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, kind, caption, media_url, media_path, media_type, created_at"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const post = toPost(data)
  if (post.author_id) {
    const authors = await authorMap([post.author_id])
    post.author = authors.get(post.author_id) ?? null
  }
  return post
}

export async function uploadMedia(file: File): Promise<UploadResult> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `File is ${humanSize(file.size)} — the limit is 10 MB. Please choose a smaller file.`
    )
  }

  const mediaType = MIME_TO_TYPE[file.type]
  if (!mediaType) {
    throw new Error(
      "Unsupported file type. Allowed: JPG, PNG, WebP, GIF, MP4, WebM, MOV, PDF, PPT, PPTX."
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Please sign in to upload media.")

  const nameExt = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : ""
  const ext = nameExt || TYPE_DEFAULT_EXT[file.type] || "bin"
  // Storage policy requires the first path segment to be the user's id.
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(error.message)

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)

  return { publicUrl, path, mediaType }
}

export async function createPost(input: {
  kind: PostKind
  caption?: string | null
  file?: File | null
}): Promise<Post> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Please sign in to post.")

  let media: UploadResult | null = null
  if (input.file) {
    media = await uploadMedia(input.file)
  }

  const caption = input.caption?.trim() || null
  if (!caption && !media) {
    throw new Error("Add a caption or attach a file before posting.")
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      kind: input.kind,
      caption,
      media_url: media?.publicUrl ?? null,
      media_path: media?.path ?? null,
      media_type: media?.mediaType ?? null,
    })
    .select(
      "id, author_id, kind, caption, media_url, media_path, media_type, created_at"
    )
    .single()

  if (error) throw new Error(error.message)

  const post = toPost(data)
  const authors = await authorMap([user.id])
  post.author = authors.get(user.id) ?? { id: user.id, name: null, role: null }
  return post
}

export async function getLikeState(postIds: string[]): Promise<LikeState> {
  const counts: Record<string, number> = {}
  const likedByMe: Record<string, boolean> = {}
  for (const id of postIds) {
    counts[id] = 0
    likedByMe[id] = false
  }
  if (postIds.length === 0) return { counts, likedByMe }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from("post_likes")
    .select("post_id, user_id")
    .in("post_id", postIds)

  for (const row of data ?? []) {
    counts[row.post_id] = (counts[row.post_id] ?? 0) + 1
    if (user && row.user_id === user.id) likedByMe[row.post_id] = true
  }
  return { counts, likedByMe }
}

/** Toggle the viewer's like on a post. Returns the new liked state. */
export async function toggleLike(postId: string): Promise<boolean> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Please sign in to like posts.")

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id)
    if (error) throw new Error(error.message)
    return false
  }

  const { error } = await supabase
    .from("post_likes")
    .insert({ post_id: postId, user_id: user.id })
  if (error) throw new Error(error.message)
  return true
}

export async function listComments(postId: string): Promise<Comment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("post_comments")
    .select("id, post_id, author_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)

  const rows = data ?? []
  const authors = await authorMap(rows.map((r) => r.author_id))
  return rows.map((r) => ({
    id: r.id,
    post_id: r.post_id,
    author_id: r.author_id,
    body: r.body,
    created_at: r.created_at,
    author: r.author_id ? (authors.get(r.author_id) ?? null) : null,
  }))
}

export async function addComment(
  postId: string,
  body: string
): Promise<Comment> {
  const trimmed = body.trim()
  if (trimmed.length < 1 || trimmed.length > 1000) {
    throw new Error("Comments must be between 1 and 1000 characters.")
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Please sign in to comment.")

  const { data, error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, author_id: user.id, body: trimmed })
    .select("id, post_id, author_id, body, created_at")
    .single()

  if (error) throw new Error(error.message)

  const authors = await authorMap([user.id])
  return {
    id: data.id,
    post_id: data.post_id,
    author_id: data.author_id,
    body: data.body,
    created_at: data.created_at,
    author: authors.get(user.id) ?? { id: user.id, name: null, role: null },
  }
}

export function canPostReel(role: string | null | undefined): boolean {
  return role === "recruiter" || role === "admin"
}
