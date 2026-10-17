import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ConfirmHireButton } from "@/components/confirm-hire-button"
import { HireProofRing } from "@/components/hire-proof-ring"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// Reads cookies() via createClient(), same Cache Components situation as
// app/opportunities/[id]/page.tsx — see the comment there.
export const instant = false

const STATUS_LABEL: Record<string, string> = {
  applied: "Applied",
  reviewing: "Reviewing",
  hired: "Hired",
  rejected: "Rejected",
}

type ApplicationRow = {
  id: string
  status: string
  hire_confirmed: boolean
  opportunity: {
    id: string
    title: string | null
    company: string | null
    recruiter: { name: string | null; hire_proof_score: number } | null
  } | null
}

export default async function ApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: applications, error } = await supabase
    .from("applications")
    .select(
      "id, status, hire_confirmed, applied_at, opportunity:opportunities(id, title, company, recruiter:profiles(name, hire_proof_score))"
    )
    .eq("seeker_id", user.id)
    .order("applied_at", { ascending: false })

  const rows = (applications ?? []) as unknown as ApplicationRow[]

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">My applications</h1>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          Could not load your applications right now.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t applied to anything yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </main>
  )
}

function ApplicationCard({ application }: { application: ApplicationRow }) {
  const opportunity = application.opportunity

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {opportunity?.recruiter && (
            <HireProofRing
              score={opportunity.recruiter.hire_proof_score}
              size={36}
              className="shrink-0"
            />
          )}
          <div className="min-w-0">
            {opportunity ? (
              <Link
                href={`/opportunities/${opportunity.id}`}
                className="truncate font-medium hover:underline block"
              >
                {opportunity.title ?? "Untitled opportunity"}
              </Link>
            ) : (
              <p className="font-medium text-muted-foreground">
                Opportunity no longer available
              </p>
            )}
            {opportunity?.company && (
              <p className="truncate text-sm text-muted-foreground">
                {opportunity.company}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-row items-center gap-1.5 sm:flex-col sm:items-end">
          <Badge variant="outline">
            {STATUS_LABEL[application.status] ?? application.status}
          </Badge>
          {application.status === "hired" && !application.hire_confirmed && (
            <ConfirmHireButton applicationId={application.id} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
