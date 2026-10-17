import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { scamCheck } from "@/lib/scam-check"
import { ApplyButton } from "@/components/apply-button"
import { HireProofRing } from "@/components/hire-proof-ring"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { QASection } from "@/components/qa-section"

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let alreadyApplied = false
  if (user) {
    const { data: existingApplication } = await supabase
      .from("applications")
      .select("id")
      .eq("opportunity_id", id)
      .eq("seeker_id", user.id)
      .maybeSingle()
    alreadyApplied = !!existingApplication
  }

  const realityCheck = await getRealityCheck(supabase, opportunity)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold break-words">
            {opportunity.title ?? "Untitled opportunity"}
          </h1>
          <p className="text-muted-foreground">{opportunity.company}</p>
        </div>
        {recruiter && (
          <HireProofRing
            score={recruiter.hire_proof_score}
            size={56}
            className="shrink-0"
          />
        )}
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

      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="font-medium">Recruiter Reality Check</h2>
          {opportunity.status === "unproven" && (
            <Badge variant="destructive">Unproven</Badge>
          )}
        </div>
        <Card size="sm">
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>
              <span className="font-medium">{realityCheck.hiresConfirmed}</span>{" "}
              of{" "}
              <span className="font-medium">{realityCheck.hiresClaimed}</span>{" "}
              claimed hires confirmed by candidates
            </p>
            <RealityCheckTick
              label="Stipend paid on time"
              state={realityCheck.stipendPaidOnTime}
            />
            <RealityCheckTick
              label="No fee asked"
              state={realityCheck.noFeeAsked}
            />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Apply</h2>
        <ApplyButton
          opportunityId={opportunity.id}
          initiallyApplied={alreadyApplied}
        />
      </section>

      <Separator />

      <section id="qa" className="flex flex-col gap-2">
        <h2 className="font-medium">Q&amp;A</h2>
        <QASection opportunityId={opportunity.id} />
      </section>
    </main>
  )
}

function RealityCheckTick({
  label,
  state,
}: {
  label: string
  state: boolean | null
}) {
  const symbol = state === null ? "–" : state ? "✓" : "✗"
  const colorClass =
    state === null
      ? "text-muted-foreground"
      : state
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400"

  return (
    <p>
      <span className={colorClass}>{symbol}</span> {label}
      {state === null && (
        <span className="text-muted-foreground"> (not enough data yet)</span>
      )}
    </p>
  )
}

type RealityCheck = {
  hiresClaimed: number
  hiresConfirmed: number
  stipendPaidOnTime: boolean | null
  noFeeAsked: boolean | null
}

async function getRealityCheck(
  supabase: Awaited<ReturnType<typeof createClient>>,
  opportunity: {
    recruiter_id: string | null
    title: string | null
    company: string | null
    description: string | null
    stipend_text: string | null
  }
): Promise<RealityCheck> {
  let hiresClaimed = 0
  let hiresConfirmed = 0
  let stipendPaidOnTime: boolean | null = null

  if (opportunity.recruiter_id) {
    const { data: recruiterOpportunities } = await supabase
      .from("opportunities")
      .select("id")
      .eq("recruiter_id", opportunity.recruiter_id)

    const opportunityIds = (recruiterOpportunities ?? []).map((o) => o.id)

    if (opportunityIds.length > 0) {
      const { data: hiredApplications } = await supabase
        .from("applications")
        .select("id")
        .in("opportunity_id", opportunityIds)
        .eq("status", "hired")

      const applicationIds = (hiredApplications ?? []).map((a) => a.id)

      if (applicationIds.length > 0) {
        const { data: hireEvents } = await supabase
          .from("hire_events")
          .select("claimed_at, confirmed_at, stipend_paid")
          .in("application_id", applicationIds)

        const events = hireEvents ?? []
        hiresClaimed = events.filter((e) => e.claimed_at !== null).length
        hiresConfirmed = events.filter((e) => e.confirmed_at !== null).length
        stipendPaidOnTime =
          events.length === 0
            ? null
            : events.every((e) => e.stipend_paid)
      }
    }
  }

  let noFeeAsked: boolean | null = null
  try {
    const result = await scamCheck({
      title: opportunity.title,
      company: opportunity.company,
      description: opportunity.description,
      stipend_text: opportunity.stipend_text,
    })
    noFeeAsked = !result.flags.some((flag) => /fee|payment|upi/i.test(flag))
  } catch {
    noFeeAsked = null
  }

  return { hiresClaimed, hiresConfirmed, stipendPaidOnTime, noFeeAsked }
}
