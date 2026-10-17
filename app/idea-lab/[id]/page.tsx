import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PollCard } from "@/components/poll-card"
import { QASection } from "@/components/qa-section"
import { IdeaCritiquePanel } from "@/components/idea-critique-panel"
import { HireProofRing } from "@/components/hire-proof-ring"

// See app/opportunities/[id]/page.tsx for why `instant = false` is needed
// here: this page reads cookies() via createClient() with no Suspense
// boundary, so Cache Components can't prerender a static shell for it.
export const instant = false

export default async function IdeaPage(props: PageProps<"/idea-lab/[id]">) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: idea } = await supabase
    .from("ideas")
    .select("*, founder:profiles(name)")
    .eq("id", id)
    .maybeSingle()

  if (!idea) {
    notFound()
  }

  const { data: polls } = await supabase
    .from("polls")
    .select("*")
    .eq("idea_id", id)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {idea.title ?? "Untitled idea"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {idea.founder?.name ?? "Anonymous founder"}
          </p>
        </div>
        <HireProofRing score={idea.idea_pulse} size={48} />
      </div>

      {idea.idea_pulse >= 60 && (
        <Badge variant="default" className="w-fit">
          Venture track unlocked
        </Badge>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">The problem</h2>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {idea.problem ?? "No problem statement provided."}
        </p>
      </section>

      {(idea.target_users || idea.model) && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {idea.target_users && (
            <div>
              <h2 className="font-medium">Target users</h2>
              <p className="text-sm text-muted-foreground">
                {idea.target_users}
              </p>
            </div>
          )}
          {idea.model && (
            <div>
              <h2 className="font-medium">Model</h2>
              <p className="text-sm text-muted-foreground">{idea.model}</p>
            </div>
          )}
        </section>
      )}

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Polls</h2>
        {(polls ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No polls yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(polls ?? []).map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </section>

      <Separator />

      <IdeaCritiquePanel ideaId={idea.id} />

      <Separator />

      <section id="qa" className="flex flex-col gap-2">
        <h2 className="font-medium">Q&amp;A</h2>
        <QASection ideaId={idea.id} />
      </section>
    </main>
  )
}
