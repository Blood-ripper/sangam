import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSkillGapData, SkillGapError } from "@/app/api/skill-gap/[id]/route"
import { ApplyButton } from "@/components/apply-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Reads cookies() via createClient(), same Cache Components situation as
// app/opportunities/[id]/page.tsx — see the comment there.
export const instant = false

export default async function SkillGapPage(
  props: PageProps<"/skill-gap/[id]">
) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("title, company")
    .eq("id", id)
    .maybeSingle()

  if (!opportunity) {
    notFound()
  }

  let planError: string | null = null
  let plan: Awaited<ReturnType<typeof getSkillGapData>> | null = null

  try {
    plan = await getSkillGapData(id)
  } catch (error) {
    planError =
      error instanceof SkillGapError
        ? error.message
        : "Could not generate a skill-gap plan right now."
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <Card className="border-amber-500/40 bg-amber-500/10">
        <CardContent className="flex flex-col gap-1">
          <p className="font-medium text-amber-700 dark:text-amber-400">
            Not ready yet
          </p>
          <p className="text-sm text-muted-foreground">
            Your profile doesn&apos;t cover enough of the skills{" "}
            {opportunity.company ?? "this opportunity"} is asking for. Close
            the gap below, or apply anyway.
          </p>
        </CardContent>
      </Card>

      {planError ? (
        <p className="text-sm text-destructive" role="alert">
          {planError}
        </p>
      ) : (
        plan && (
          <>
            <section className="flex flex-col gap-2">
              <h2 className="font-medium">Missing skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {plan.missingSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No specific gaps detected.
                  </p>
                ) : (
                  plan.missingSkills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))
                )}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="font-medium">2-week free path</h2>
              {plan.freePath.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No learning path available right now.
                </p>
              ) : (
              <ol className="flex flex-col gap-3">
                {plan.freePath.map((week) => (
                  <li key={week.week} className="flex flex-col gap-1.5">
                    <p className="font-medium">
                      Week {week.week}: {week.topic}
                    </p>
                    <ul className="flex flex-col gap-1 pl-4 text-sm">
                      {week.resources.map((resource, i) => (
                        <li key={i} className="list-disc">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {resource.name}
                          </a>{" "}
                          <span className="text-muted-foreground">
                            ({resource.platform})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
              )}
            </section>

            <Card size="sm">
              <CardHeader>
                <CardTitle>Proof task</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {plan.proofTask}
                </p>
              </CardContent>
            </Card>
          </>
        )
      )}

      <ApplyButton opportunityId={id} force label="Apply anyway" />
    </main>
  )
}
