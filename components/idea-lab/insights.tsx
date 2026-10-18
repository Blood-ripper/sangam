"use client"

import Link from "next/link"
import { formatDistance } from "date-fns"
import { Briefcase, ChevronRight, LifeBuoy, Lightbulb, Plus, Users, type LucideIcon } from "lucide-react"
import { DonutChart } from "@/components/charts/donut-chart"
import { ProgressRing } from "@/components/charts/progress-ring"
import { STAGES, STAGE_ORDER, stageOf, type Idea, type StageKey } from "./lib"

function CardHeading({ id, title, sub }: { id: string; title: string; sub: string }) {
  return (
    <header className="flex flex-col gap-1">
      <h2 id={id} className="text-lg font-bold tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </header>
  )
}

export function StageBreakdown({ counts, total }: { counts: Record<StageKey, number>; total: number }) {
  const segments = STAGE_ORDER.map((k) => ({ label: STAGES[k].label, value: counts[k], color: STAGES[k].color }))
  return (
    <section data-slot="card" aria-labelledby="stage-breakdown-heading" className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
      <CardHeading id="stage-breakdown-heading" title="Ideas by stage" sub="Hover or focus a stage to see its count." />
      <DonutChart
        segments={segments}
        size={156}
        thickness={16}
        centerLabel={total === 1 ? "idea" : "ideas"}
        ariaLabel={`Ideas by stage: ${segments.map((s) => `${s.label} ${s.value}`).join(", ")}`}
        className="sm:flex-row xl:flex-col 2xl:flex-row"
      />
    </section>
  )
}

export function VentureReady({
  venture,
  validating,
  total,
}: {
  venture: number
  validating: number
  total: number
}) {
  const rate = total ? Math.round((venture / total) * 100) : 0
  return (
    <section data-slot="card" aria-labelledby="venture-heading" className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
      <CardHeading id="venture-heading" title="Venture-ready rate" sub="Share of ideas with an Idea Pulse of 60 or more." />
      <div className="flex flex-col items-center gap-6 sm:flex-row xl:flex-col 2xl:flex-row">
        <ProgressRing value={rate} label="venture-ready" size={148} />
        <dl className="flex w-full flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ background: STAGES.build.color }} />
              Venture track
            </dt>
            <dd className="font-semibold text-foreground tabular-nums">
              {venture} <span className="font-normal text-muted-foreground">/ {total}</span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-[#8c72ee]" />
              Validating now
            </dt>
            <dd className="font-semibold text-foreground tabular-nums">
              {validating} <span className="font-normal text-muted-foreground">/ {total}</span>
            </dd>
          </div>
          <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
            Reaching 60 unlocks co-founder and mentor matching for that idea.
          </p>
        </dl>
      </div>
    </section>
  )
}

export function ActivityTimeline({ ideas, now }: { ideas: Idea[]; now: number }) {
  const items = [...ideas].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5)
  return (
    <section data-slot="card" aria-labelledby="activity-heading" className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
      <CardHeading id="activity-heading" title="Recent activity" sub="The latest ideas from the community." />
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing yet. New ideas show up here.</p>
      ) : (
        <ol className="flex flex-col gap-5">
          {items.map((idea, i) => {
            const stage = STAGES[stageOf(idea.idea_pulse)]
            return (
              <li key={idea.id} className="relative flex gap-3.5">
                {i < items.length - 1 && (
                  <span aria-hidden="true" className="absolute top-10 -bottom-5 left-[17px] w-px bg-white/10" />
                )}
                <span
                  aria-hidden="true"
                  className="relative grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]"
                >
                  <Lightbulb className="size-4" style={{ color: stage.color }} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm leading-snug text-foreground/90">
                    <span className="font-semibold text-foreground">{idea.founder?.name ?? "A founder"}</span> posted{" "}
                    <Link href={`/idea-lab/${idea.id}`} className="font-semibold text-foreground hover:underline">
                      {idea.title ?? "an idea"}
                    </Link>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistance(new Date(idea.created_at), now, { addSuffix: true })}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

export function QuickActions({ onPost }: { onPost: () => void }) {
  const rows: { label: string; icon: LucideIcon; href?: string }[] = [
    { label: "Post an idea", icon: Plus },
    { label: "Find a mentor", icon: Users, href: "/mentors" },
    { label: "Browse openings", icon: Briefcase, href: "/feed" },
    { label: "Get help", icon: LifeBuoy, href: "/faq" },
  ]
  const rowClass =
    "group flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-white/15 hover:bg-white/[0.06]"

  return (
    <section data-slot="card" aria-labelledby="quick-actions-heading" className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
      <CardHeading id="quick-actions-heading" title="Quick actions" sub="Your next move." />
      <ul className="flex flex-col gap-2.5">
        {rows.map(({ label, icon: Icon, href }) => {
          const inner = (
            <>
              <Icon className="size-4 text-violet" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              <ChevronRight
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </>
          )
          return (
            <li key={label}>
              {href ? (
                <Link href={href} className={rowClass}>
                  {inner}
                </Link>
              ) : (
                <button type="button" onClick={onPost} className={rowClass}>
                  {inner}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
