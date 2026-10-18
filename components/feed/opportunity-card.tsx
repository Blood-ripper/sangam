"use client"

import Link from "next/link"
import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns"
import { CalendarClock, IndianRupee, Sparkles, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HireProofRing } from "@/components/hire-proof-ring"
import { ProgressRing } from "@/components/charts/progress-ring"
import { BorderBeam } from "@/components/magicui/border-beam"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/supabase"

export type MatchedOpportunity =
  Database["public"]["Functions"]["match_opportunities"]["Returns"][number]

const AVATAR_TINTS = ["#4d66e9", "#e89e31", "#24b07f", "#8c72ee", "#5b7cfa"]

function tintFor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_TINTS[h % AVATAR_TINTS.length]
}

function deadlineLabel(deadline: string | null | undefined, now: number) {
  if (!deadline) return null
  const d = parseISO(deadline)
  if (!isValid(d)) return null
  const days = differenceInCalendarDays(d, now)
  if (days < 0) return { text: "Applications closed", urgent: false }
  if (days === 0) return { text: "Closes today", urgent: true }
  if (days <= 7) return { text: `Closes in ${days} ${days === 1 ? "day" : "days"}`, urgent: true }
  return { text: `Closes ${format(d, "d MMM")}`, urgent: false }
}

export function OpportunityCard({
  opportunity,
  matchReason,
  isTopMatch,
  now,
}: {
  opportunity: MatchedOpportunity
  matchReason?: string
  isTopMatch?: boolean
  now: number
}) {
  const match = Math.round(Math.max(0, Math.min(1, opportunity.match_score ?? 0)) * 100)
  const company = opportunity.company?.trim() || "Company"
  const tint = tintFor(company)
  const skills = opportunity.required_skills ?? []
  const deadline = deadlineLabel(opportunity.deadline, now)
  const title = opportunity.title ?? "Untitled opportunity"

  return (
    <article data-slot="card" className="relative flex h-full flex-col gap-4 p-5">
      {isTopMatch && <BorderBeam size={90} duration={9} />}

      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-xl text-base font-bold text-white"
          style={{
            background: `color-mix(in oklab, ${tint} 26%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tint} 50%, transparent)`,
          }}
        >
          {company[0]?.toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          {isTopMatch && (
            <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-foreground">
              <Sparkles className="size-3.5 text-cyan" aria-hidden="true" />
              Top match
            </span>
          )}
          <h3 className="text-base leading-snug font-bold tracking-tight">
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="rounded-sm text-foreground hover:underline focus-visible:underline"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="truncate">{company}</span>
            {opportunity.type && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-foreground capitalize">
                {opportunity.type}
              </span>
            )}
          </p>
        </div>
        <ProgressRing value={match} size={56} thickness={5} label="Match" className="-mt-0.5">
          <span className="text-sm leading-none font-bold text-foreground tabular-nums">{match}%</span>
          <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">match</span>
        </ProgressRing>
      </div>

      <dl className="grid grid-cols-1 gap-2 text-sm min-[420px]:grid-cols-2">
        {opportunity.stipend_text && (
          <div className="flex min-w-0 items-center gap-2">
            <dt className="sr-only">Stipend</dt>
            <IndianRupee className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dd className="truncate font-medium text-foreground">{opportunity.stipend_text}</dd>
          </div>
        )}
        {deadline && (
          <div className="flex min-w-0 items-center gap-2">
            <dt className="sr-only">Deadline</dt>
            <CalendarClock
              className={cn("size-4 shrink-0", deadline.urgent ? "text-[#e89e31]" : "text-muted-foreground")}
              aria-hidden="true"
            />
            <dd className="truncate text-foreground/90">{deadline.text}</dd>
          </div>
        )}
        {opportunity.seats > 0 && (
          <div className="flex min-w-0 items-center gap-2">
            <dt className="sr-only">Seats</dt>
            <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dd className="truncate text-foreground/90">
              {opportunity.seats} {opportunity.seats === 1 ? "seat" : "seats"}
            </dd>
          </div>
        )}
        <div className="flex min-w-0 items-center gap-2">
          <dt className="sr-only">Hire-Proof score</dt>
          <HireProofRing score={opportunity.hire_proof_score ?? 0} size={22} />
          <dd className="truncate text-foreground/90">Hire-Proof score</dd>
        </div>
      </dl>

      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Skills needed">
          {skills.slice(0, 4).map((skill) => (
            <li
              key={skill}
              className="rounded-md border border-dashed border-white/15 px-2 py-0.5 text-xs text-foreground/90"
            >
              {skill}
            </li>
          ))}
          {skills.length > 4 && (
            <li className="px-1 py-0.5 text-xs text-muted-foreground">+{skills.length - 4} more</li>
          )}
        </ul>
      )}

      {matchReason && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="size-3.5 text-violet" aria-hidden="true" />
            Why it fits you
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{matchReason}</p>
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-1">
        <Button asChild size="lg" className="flex-1">
          <Link href={`/opportunities/${opportunity.id}`}>Apply</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1">
          <Link href={`/opportunities/${opportunity.id}#qa`}>Ask a question</Link>
        </Button>
      </div>
    </article>
  )
}
