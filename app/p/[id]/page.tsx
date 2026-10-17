import { PostDetail } from "@/components/posts/post-detail"

// A dynamic route can't prerender a static shell under Cache Components (the
// id is only known at runtime), so block on the server — same pattern as the
// repo's other [id] routes. No Supabase reads happen here; PostDetail fetches
// everything client-side through lib/db, so the page works signed out too.
export const instant = false

export default async function SinglePostPage(props: PageProps<"/p/[id]">) {
  const { id } = await props.params
  return <PostDetail id={id} />
}
