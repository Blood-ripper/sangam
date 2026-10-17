import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HireProofRing } from "@/components/hire-proof-ring"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

// This page reads cookies() (via createClient()) and params directly, with
// no <Suspense> boundary, so Cache Components can't prerender a static
// shell for it — same situation the "Authentication with Cache Components"
// guide describes. `instant = false` is the guide's documented way to ship
// this now and let the route block on the server; streaming it behind a
// Suspense boundary is the follow-up if this page's load time matters.
export const instant = false

export default async function OpportunityPage(
  props: PageProps<"/opportunities/[id]">
) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*, recruiter:profiles(name, hire_proof_score, verified_domain)")
    .eq("id", id)
    .maybeSingle()

  if (!opportunity) {
    notFound()
  }

  const recruiter = opportunity.recruiter

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {opportunity.title ?? "Untitled opportunity"}
          </h1>
          <p className="text-muted-foreground">{opportunity.company}</p>
        </div>
        {recruiter && <HireProofRing score={recruiter.hire_proof_score} size={56} />}
      </div>

      <div className="flex flex-wrap gap-2">
        {opportunity.type && <Badge variant="secondary">{opportunity.type}</Badge>}
        {opportunity.stipend_text && (
          <Badge variant="outline">{opportunity.stipend_text}</Badge>
        )}
        {opportunity.seats != null && (
          <Badge variant="outline">{opportunity.seats} seats</Badge>
        )}
        {opportunity.deadline && (
          <Badge variant="outline">Deadline {opportunity.deadline}</Badge>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Description</h2>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {opportunity.description ?? "No description provided."}
        </p>
      </section>

      {opportunity.required_skills && opportunity.required_skills.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-medium">Required skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {opportunity.required_skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Recruiter Hire-Proof breakdown</h2>
        {recruiter ? (
          <Card size="sm">
            <CardContent className="flex items-center gap-4">
              <HireProofRing score={recruiter.hire_proof_score} />
              <div className="text-sm">
                <p className="font-medium">{recruiter.name ?? "Verified recruiter"}</p>
                <p className="text-muted-foreground">
                  {recruiter.verified_domain
                    ? `Verified on ${recruiter.verified_domain}`
                    : "Domain not yet verified"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            Recruiter details unavailable.
          </p>
        )}
      </section>

      <Separator />

      {/* Stub: wire this up to a real skill-gap API once it exists. */}
      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Skill gap</h2>
        <p className="text-sm text-muted-foreground">
          Skill-gap analysis is coming soon — it will compare your
          profile&apos;s skills against this opportunity&apos;s required
          skills.
        </p>
      </section>

      <Separator />

      {/* Placeholder: the qa_posts / qa_upvotes tables exist, but there's
          no Q&A UI yet. #qa is also where the feed's "Ask" button links. */}
      <section id="qa" className="flex flex-col gap-2">
        <h2 className="font-medium">Q&amp;A</h2>
        <p className="text-sm text-muted-foreground">
          Questions and answers for this opportunity are coming soon.
        </p>
      </section>
    </main>
  )
}
